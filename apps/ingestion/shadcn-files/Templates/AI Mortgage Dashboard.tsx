import { VoiceAssistant } from '@vibekit/voice'
import { WorkflowTrigger } from '@vibekit/n8n'

const MortgageAssistant = () => (
  <div className="grid grid-cols-3 gap-4 p-6">
    <VoiceAssistant 
      profile="mortgage_broker" 
      triggers={['lead_qualification', 'rate_lock']}
    />
    <WorkflowTrigger
      workflows={[
        { id: 'new_lead_sms', schedule: 'instant' },
        { id: 'followup_sequence', schedule: '24h' }
      ]}
    />
  </div>
)