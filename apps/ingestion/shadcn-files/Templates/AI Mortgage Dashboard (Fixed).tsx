import { useTwilioVoice } from '@twilio/voice-react-sdk'
import { triggerWorkflow } from 'n8n-react-integration'

const MortgageAssistant = () => {
  const { startCall } = useTwilioVoice({
    voiceProfile: 'mortgage-broker',
    onCallStart: () => triggerWorkflow('new_lead_call')
  });

  return (
    <div className="grid grid-cols-3 gap-4 p-6">
      <button 
        onClick={startCall}
        className="bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600"
      >
        Initiate Lead Call
      </button>
      
      <div className="space-y-4">
        <button
          onClick={() => triggerWorkflow('new_lead_sms')}
          className="bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 w-full"
        >
          Trigger SMS Sequence
        </button>
        <button
          onClick={() => triggerWorkflow('followup_sequence')}
          className="bg-purple-500 text-white p-3 rounded-lg hover:bg-purple-600 w-full"
        >
          Schedule Follow-ups
        </button>
      </div>
    </div>
  )
}