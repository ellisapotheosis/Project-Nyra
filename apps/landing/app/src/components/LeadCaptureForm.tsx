'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export function LeadCaptureForm() {
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    loanPurpose: 'PURCHASE',
    loanAmount: 300000,
    propertyState: 'TX',
    creditScore: 740,
    consent: false,
    utmSource: '',
    utmMedium: '',
    utmCampaign: '',
  });

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      utmSource: searchParams.get('utm_source') || '',
      utmMedium: searchParams.get('utm_medium') || '',
      utmCampaign: searchParams.get('utm_campaign') || '',
    }));
  }, [searchParams]);

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.consent) {
      alert("You must provide consent to be contacted.");
      return;
    }
    
    setStatus('submitting');
    
    try {
      // Direct ingestion to Lead Capture API (intelligent front door)
      const leadCaptureApiUrl = process.env.NEXT_PUBLIC_LEAD_CAPTURE_API_URL || 'http://localhost:3300';
      
      const res = await fetch(`${leadCaptureApiUrl}/api/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          source: 'landing_page_main'
        })
      });
      
      if (!res.ok) throw new Error('Ingestion failed');
      
      setStatus('success');
      window.location.href = '/thank-you';
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl backdrop-blur">
      <h3 className="text-xl font-bold text-white mb-4">See Your Custom Rates</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">First Name</label>
          <input required type="text" className="w-full bg-slate-800 border-slate-700 rounded-lg p-2 text-white" 
            value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Last Name</label>
          <input required type="text" className="w-full bg-slate-800 border-slate-700 rounded-lg p-2 text-white"
            value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Email</label>
          <input required type="email" className="w-full bg-slate-800 border-slate-700 rounded-lg p-2 text-white"
            value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Phone</label>
          <input required type="tel" className="w-full bg-slate-800 border-slate-700 rounded-lg p-2 text-white"
            value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Loan Amount</label>
          <input required type="number" className="w-full bg-slate-800 border-slate-700 rounded-lg p-2 text-white"
            value={formData.loanAmount} onChange={e => setFormData({...formData, loanAmount: Number(e.target.value)})} />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Purpose</label>
          <select className="w-full bg-slate-800 border-slate-700 rounded-lg p-2 text-white"
            value={formData.loanPurpose} onChange={e => setFormData({...formData, loanPurpose: e.target.value})}>
            <option value="PURCHASE">Purchase</option>
            <option value="REFI_RATE">Refinance (Rate/Term)</option>
            <option value="REFI_CASH">Refinance (Cash Out)</option>
          </select>
        </div>
      </div>

      <div className="mt-4 flex items-start space-x-2">
        <input 
          type="checkbox" 
          id="consent" 
          required
          checked={formData.consent}
          onChange={e => setFormData({...formData, consent: e.target.checked})}
          className="mt-1 h-4 w-4 rounded border-slate-700 bg-slate-800 text-cyan-500 focus:ring-cyan-500" 
        />
        <label htmlFor="consent" className="text-xs text-slate-400 leading-tight">
          By checking this box, I consent to receive SMS, emails, and calls from West Capital Lending and Ellis Andersen at the number provided. I understand that consent is not a condition of purchase and I can opt out at any time.
        </label>
      </div>

      <button 
        type="submit" 
        disabled={status === 'submitting'}
        className="w-full mt-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
      >
        {status === 'submitting' ? 'Processing...' : 'Get My Custom Quote'}
      </button>

      {status === 'error' && (
        <p className="text-xs text-rose-400 text-center mt-2">There was an error processing your request. Please try again.</p>
      )}
    </form>
  );
}
