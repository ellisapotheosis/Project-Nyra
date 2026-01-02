import React, { useState } from 'react'
import { Phone, MessageSquare, Calendar } from 'lucide-react'

const MortgageAssistant = () => {
  const [loading, setLoading] = useState(false)

  const handleVoiceCall = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/voice-call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.TWILIO_TOKEN}`
        }
      })
      if (!response.ok) throw new Error('Call failed')
    } catch (error) {
      console.error('Voice call error:', error)
    } finally {
      setLoading(false)
    }
  }

  const triggerWorkflow = (workflowId: string) => {
    fetch(`/api/n8n/${workflowId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }

  return (
    <div className="grid grid-cols-3 gap-6 p-6 bg-gray-50">
      <button
        onClick={handleVoiceCall}
        disabled={loading}
        className="flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-all"
      >
        <Phone className="w-8 h-8 text-blue-600 mb-2" />
        <span className="text-sm font-medium">
          {loading ? 'Connecting...' : 'Start Voice Call'}
        </span>
      </button>

      <div className="space-y-4 col-span-2">
        <button
          onClick={() => triggerWorkflow('new_lead_sms')}
          className="flex items-center w-full p-3 bg-white rounded-lg shadow-md hover:shadow-lg transition-all"
        >
          <MessageSquare className="w-5 h-5 text-green-600 mr-2" />
          <span className="text-sm font-medium">Send SMS Sequence</span>
        </button>
        
        <button
          onClick={() => triggerWorkflow('followup_sequence')}
          className="flex items-center w-full p-3 bg-white rounded-lg shadow-md hover:shadow-lg transition-all"
        >
          <Calendar className="w-5 h-5 text-purple-600 mr-2" />
          <span className="text-sm font-medium">Schedule Follow-ups</span>
        </button>
      </div>
    </div>
  )
}