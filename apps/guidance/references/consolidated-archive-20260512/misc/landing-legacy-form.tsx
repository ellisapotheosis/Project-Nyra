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
    propertyValue: 400000,
    creditRange: '740-799',
    timeframe: 'IMMEDIATE',
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
          source: 'landing_page_main',
          consentSms: 'OPTED_IN',
          consentEmail: 'OPTED_IN',
          consentVoice: 'OPTED_IN',
          consentTimestamp: new Date().toISOString(),
          consentSource: 'ratehunter_landing_checkbox',
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
    <form onSubmit={handleSubmit} className="space-y-6 rounded-[32px] border border-border/50 bg-card/40 p-8 shadow-2xl backdrop-blur-xl border-t-2 border-t-indigo-500 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl -z-10" />

      <div>
        <h3 className="text-2xl font-black text-foreground uppercase tracking-tight">Secure Rate Access</h3>
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1 opacity-60">Step 1: Protocol_Initialization</p>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4">
        <div className="space-y-1.5">
          <label className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">First Name</label>
          <input required type="text" className="w-full bg-background/40 border-border/50 rounded-xl p-3 text-sm font-bold text-foreground focus:border-indigo-500/50 outline-none transition-all shadow-inner"
            value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
        </div>
        <div className="space-y-1.5">
          <label className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Last Name</label>
          <input required type="text" className="w-full bg-background/40 border-border/50 rounded-xl p-3 text-sm font-bold text-foreground focus:border-indigo-500/50 outline-none transition-all shadow-inner"
            value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="block text-[10px] font-black text-turquoise-400 uppercase tracking-widest ml-1">Email</label>
          <input required type="email" className="w-full bg-background/40 border-border/50 rounded-xl p-3 text-sm font-bold text-foreground focus:border-turquoise-500/50 outline-none transition-all shadow-inner"
            value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
        </div>
        <div className="space-y-1.5">
          <label className="block text-[10px] font-black text-turquoise-400 uppercase tracking-widest ml-1">Phone</label>
          <input required type="tel" className="w-full bg-background/40 border-border/50 rounded-xl p-3 text-sm font-bold text-foreground focus:border-turquoise-500/50 outline-none transition-all shadow-inner"
            value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Loan Amount</label>
          <input required type="number" className="w-full bg-background/40 border-border/50 rounded-xl p-3 text-sm font-bold text-foreground focus:border-indigo-500/50 outline-none transition-all shadow-inner"
            value={formData.loanAmount} onChange={e => setFormData({...formData, loanAmount: Number(e.target.value)})} />
        </div>
        <div className="space-y-1.5">
          <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Property Value</label>
          <input required type="number" className="w-full bg-background/40 border-border/50 rounded-xl p-3 text-sm font-bold text-foreground focus:border-indigo-500/50 outline-none transition-all shadow-inner"
            value={formData.propertyValue} onChange={e => setFormData({...formData, propertyValue: Number(e.target.value)})} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Credit Range</label>
          <select className="w-full bg-background/40 border-border/50 rounded-xl p-3 text-sm font-bold text-foreground focus:border-indigo-500/50 outline-none transition-all shadow-inner appearance-none cursor-pointer"
            value={formData.creditRange} onChange={e => setFormData({...formData, creditRange: e.target.value})}>
            <option value="800+">800+</option>
            <option value="740-799">740-799</option>
            <option value="670-739">670-739</option>
            <option value="580-669">580-669</option>
            <option value="300-579">300-579</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Timeframe</label>
          <select className="w-full bg-background/40 border-border/50 rounded-xl p-3 text-sm font-bold text-foreground focus:border-indigo-500/50 outline-none transition-all shadow-inner appearance-none cursor-pointer"
            value={formData.timeframe} onChange={e => setFormData({...formData, timeframe: e.target.value})}>
            <option value="IMMEDIATE">Immediate</option>
            <option value="1-3_MONTHS">1-3 Months</option>
            <option value="3-6_MONTHS">3-6 Months</option>
            <option value="EXPLORATORY">Exploratory</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-1.5">
          <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Loan Purpose</label>
          <select className="w-full bg-background/40 border-border/50 rounded-xl p-3 text-sm font-bold text-foreground focus:border-indigo-500/50 outline-none transition-all shadow-inner appearance-none cursor-pointer"
            value={formData.loanPurpose} onChange={e => setFormData({...formData, loanPurpose: e.target.value})}>
            <option value="PURCHASE">Purchase</option>
            <option value="REFI_RATE">Refi (Rate/Term)</option>
            <option value="REFI_CASH">Refi (Cash Out)</option>
            <option value="HELOC">HELOC / Fixed HELOAN</option>
            <option value="COMMERCIAL">Commercial / Hard Money</option>
          </select>
        </div>
      </div>

      <div className="mt-6 flex items-start space-x-3 p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 shadow-inner">
        <input
          type="checkbox"
          id="consent"
          required
          checked={formData.consent}
          onChange={e => setFormData({...formData, consent: e.target.checked})}
          className="mt-1 h-4 w-4 rounded border-border/50 bg-background/40 text-indigo-600 focus:ring-indigo-500 cursor-pointer transition-all"
        />
        <label htmlFor="consent" className="text-[10px] font-bold text-muted-foreground leading-relaxed uppercase tracking-tight">
          By checking this box, I consent to receive SMS, emails, and calls from West Capital Lending and Ellis Andersen at the number provided. Consent is not a condition of purchase.
        </label>
      </div>

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="w-full mt-6 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-[0.2em] py-4 rounded-2xl transition-all shadow-2xl shadow-indigo-500/30 active:scale-95 disabled:opacity-50 text-xs"
      >
        {status === 'submitting' ? 'SYNCHRONIZING...' : 'GET_CUSTOM_ANALYSIS'}
      </button>

      {status === 'error' && (
        <p className="text-[10px] font-black text-pink-400 text-center mt-4 uppercase tracking-widest animate-pulse">ERROR: UPLINK_FAILED. RETRY_LATER.</p>
      )}
    </form>
  );
}
