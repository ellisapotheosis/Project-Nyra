import twilio from 'twilio';
import { IVRConfig, IVRMenuOption } from '../types/twilio.types';
import { CallModel } from '../models/call.model';

export class IVRService {
  /**
   * Generate TwiML for IVR menu
   */
  generateIVRTwiML(config: IVRConfig, callSid?: string): string {
    const VoiceResponse = twilio.twiml.VoiceResponse;
    const twiml = new VoiceResponse();

    // Welcome message
    twiml.say(
      {
        voice: 'Polly.Joanna',
        language: 'en-US',
      },
      config.welcomeMessage
    );

    // Gather input
    const gather = twiml.gather({
      numDigits: 1,
      action: '/webhooks/ivr/handle',
      method: 'POST',
      timeout: 5,
    });

    // Add menu options to speech
    const menuText = config.menuOptions
      .map((opt) => `Press ${opt.digit} ${opt.message || ''}`)
      .join('. ');

    gather.say(
      {
        voice: 'Polly.Joanna',
        language: 'en-US',
      },
      menuText
    );

    // Default action if no input
    if (config.invalidInputMessage) {
      twiml.say(
        {
          voice: 'Polly.Joanna',
          language: 'en-US',
        },
        config.invalidInputMessage
      );
    }

    // Redirect back to IVR
    twiml.redirect('/webhooks/ivr/menu');

    return twiml.toString();
  }

  /**
   * Handle IVR digit input
   */
  async handleIVRInput(
    digit: string,
    config: IVRConfig,
    callSid: string
  ): Promise<string> {
    const VoiceResponse = twilio.twiml.VoiceResponse;
    const twiml = new VoiceResponse();

    // Find matching option
    const option = config.menuOptions.find((opt) => opt.digit === digit);

    if (!option) {
      // Invalid input
      const message = config.invalidInputMessage || 'Invalid option. Please try again.';
      twiml.say(
        {
          voice: 'Polly.Joanna',
          language: 'en-US',
        },
        message
      );
      twiml.redirect('/webhooks/ivr/menu');

      // Track IVR path
      await this.trackIVRPath(callSid, `invalid:${digit}`);

      return twiml.toString();
    }

    // Track IVR path
    await this.trackIVRPath(callSid, `${digit}:${option.action}`);

    // Handle action
    switch (option.action) {
      case 'forward':
        if (option.destination) {
          twiml.say('Connecting you now.');
          twiml.dial(option.destination);
        }
        break;

      case 'voicemail':
        twiml.say('Please leave a message after the beep.');
        twiml.record({
          maxLength: 120,
          action: '/webhooks/ivr/voicemail',
          transcribe: true,
          transcribeCallback: '/webhooks/ivr/transcription',
        });
        break;

      case 'hangup':
        if (option.message) {
          twiml.say(option.message);
        }
        twiml.hangup();
        break;

      case 'submenu':
        if (option.submenu) {
          return this.generateIVRTwiML(option.submenu, callSid);
        }
        break;

      case 'queue':
        if (option.destination) {
          twiml.say('Please hold while we connect you to the next available agent.');
          const enqueue = twiml.enqueue({
            waitUrl: '/webhooks/ivr/wait-music',
            action: '/webhooks/ivr/queue-complete',
          });
          enqueue.queue(option.destination);
        }
        break;
    }

    return twiml.toString();
  }

  /**
   * Generate TwiML for wait music
   */
  generateWaitMusicTwiML(): string {
    const VoiceResponse = twilio.twiml.VoiceResponse;
    const twiml = new VoiceResponse();

    twiml.say('Your call is important to us. Please continue to hold.');
    twiml.play({
      loop: 10,
    }, 'http://com.twilio.sounds.music.s3.amazonaws.com/MARKOVICHAMP-Borghestral.mp3');

    return twiml.toString();
  }

  /**
   * Create lead routing IVR
   */
  createLeadRoutingIVR(departments: {
    [key: string]: { phone: string; name: string };
  }): IVRConfig {
    const menuOptions: IVRMenuOption[] = Object.entries(departments).map(
      ([digit, dept], index) => ({
        digit: (index + 1).toString(),
        action: 'forward' as const,
        destination: dept.phone,
        message: `for ${dept.name}`,
      })
    );

    // Add voicemail option
    menuOptions.push({
      digit: '0',
      action: 'voicemail' as const,
      message: 'to leave a voicemail',
    });

    return {
      welcomeMessage: 'Thank you for calling. Please select from the following options.',
      menuOptions,
      invalidInputMessage: 'Invalid selection. Please try again.',
      maxRetries: 3,
    };
  }

  /**
   * Create business hours IVR
   */
  createBusinessHoursIVR(
    isBusinessHours: boolean,
    businessHoursConfig: IVRConfig,
    afterHoursMessage: string
  ): IVRConfig {
    if (isBusinessHours) {
      return businessHoursConfig;
    }

    return {
      welcomeMessage: afterHoursMessage,
      menuOptions: [
        {
          digit: '1',
          action: 'voicemail',
          message: 'to leave a voicemail',
        },
        {
          digit: '0',
          action: 'hangup',
          message: 'to end the call',
        },
      ],
      invalidInputMessage: 'Invalid option. Please try again.',
      maxRetries: 2,
    };
  }

  /**
   * Track IVR navigation path
   */
  private async trackIVRPath(callSid: string, step: string): Promise<void> {
    await CallModel.findOneAndUpdate(
      { sid: callSid },
      { $push: { ivrPath: step } },
      { new: true, upsert: true }
    );
  }

  /**
   * Get IVR analytics
   */
  async getIVRAnalytics(
    startDate: Date,
    endDate: Date
  ): Promise<{
    totalCalls: number;
    pathDistribution: Record<string, number>;
    averagePathLength: number;
    abandonmentRate: number;
  }> {
    const calls = await CallModel.find({
      dateCreated: { $gte: startDate, $lte: endDate },
      ivrPath: { $exists: true, $ne: [] },
    });

    const pathDistribution: Record<string, number> = {};
    let totalPathLength = 0;
    let abandonedCalls = 0;

    for (const call of calls) {
      if (call.ivrPath) {
        totalPathLength += call.ivrPath.length;

        // Track each step
        call.ivrPath.forEach((step) => {
          pathDistribution[step] = (pathDistribution[step] || 0) + 1;
        });

        // Check if call was abandoned (hung up without completing action)
        const lastStep = call.ivrPath[call.ivrPath.length - 1];
        if (lastStep?.includes('invalid') || call.status === 'busy' || call.status === 'no-answer') {
          abandonedCalls++;
        }
      }
    }

    return {
      totalCalls: calls.length,
      pathDistribution,
      averagePathLength: calls.length > 0 ? totalPathLength / calls.length : 0,
      abandonmentRate: calls.length > 0 ? (abandonedCalls / calls.length) * 100 : 0,
    };
  }

  /**
   * Validate IVR configuration
   */
  validateIVRConfig(config: IVRConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!config.welcomeMessage) {
      errors.push('Welcome message is required');
    }

    if (!config.menuOptions || config.menuOptions.length === 0) {
      errors.push('At least one menu option is required');
    }

    // Check for duplicate digits
    const digits = new Set<string>();
    config.menuOptions?.forEach((opt, index) => {
      if (digits.has(opt.digit)) {
        errors.push(`Duplicate digit '${opt.digit}' at option ${index + 1}`);
      }
      digits.add(opt.digit);

      // Validate destinations for forward actions
      if (opt.action === 'forward' && !opt.destination) {
        errors.push(`Forward action at option ${index + 1} requires a destination`);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
