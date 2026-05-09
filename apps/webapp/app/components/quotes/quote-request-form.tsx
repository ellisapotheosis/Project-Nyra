'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  Calculator, 
  DollarSign, 
  CreditCard, 
  Home,
  CheckCircle2,
  AlertCircle,
  Loader2
} from "lucide-react";
import { QuoteRequest } from "@/lib/api/quotes";

interface QuoteRequestFormProps {
  onSubmit: (data: QuoteRequest) => void;
  isLoading?: boolean;
}

export function QuoteRequestForm({ onSubmit, isLoading }: QuoteRequestFormProps) {
  const [formData, setFormData] = useState({
    property_value: 450000,
    loan_amount: 360000,
    credit_score: 740,
    annual_interest_rate: 6.5,
    term_years: 30,
    annual_property_tax: 5400,
    annual_home_insurance: 1200,
    monthly_hoa: 0,
    monthly_gross_income: 10000,
    monthly_debt_payments: 500,
    start_date: new Date().toISOString().split('T')[0]
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'start_date' ? value : (parseFloat(value) || 0)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData as any);
  };

  const ltv = (formData.loan_amount / formData.property_value) * 100;
  
  // Calculate DTI (Debt-to-Income)
  // Estimated monthly PI:
  const monthlyRate = formData.annual_interest_rate / 100 / 12;
  const numPayments = formData.term_years * 12;
  const monthlyPI = formData.loan_amount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
  const monthlyTax = formData.annual_property_tax / 12;
  const monthlyIns = formData.annual_home_insurance / 12;
  const totalMonthlyHousing = monthlyPI + monthlyTax + monthlyIns + formData.monthly_hoa;
  const dti = ((totalMonthlyHousing + formData.monthly_debt_payments) / formData.monthly_gross_income) * 100;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Core Scenario</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="property_value" className="text-xs font-bold uppercase tracking-widest text-slate-500">
              Property Value
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="property_value"
                name="property_value"
                type="number"
                value={formData.property_value}
                onChange={handleChange}
                className="pl-9 bg-slate-50/50 border-slate-200 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="loan_amount" className="text-xs font-bold uppercase tracking-widest text-slate-500">
              Loan Amount
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="loan_amount"
                name="loan_amount"
                type="number"
                value={formData.loan_amount}
                onChange={handleChange}
                className="pl-9 bg-slate-50/50 border-slate-200 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="credit_score" className="text-xs font-bold uppercase tracking-widest text-slate-500">
              Credit Score
            </Label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="credit_score"
                name="credit_score"
                type="number"
                value={formData.credit_score}
                onChange={handleChange}
                className="pl-9 bg-slate-50/50 border-slate-200 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="annual_interest_rate" className="text-xs font-bold uppercase tracking-widest text-slate-500">
              Base Interest Rate (%)
            </Label>
            <div className="relative">
              <Calculator className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="annual_interest_rate"
                name="annual_interest_rate"
                type="number"
                step="0.125"
                value={formData.annual_interest_rate}
                onChange={handleChange}
                className="pl-9 bg-slate-50/50 border-slate-200 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-slate-100">
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Borrower Financials & DTI</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="monthly_gross_income" className="text-xs font-bold uppercase tracking-widest text-slate-500">
              Monthly Gross Income
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="monthly_gross_income"
                name="monthly_gross_income"
                type="number"
                value={formData.monthly_gross_income}
                onChange={handleChange}
                className="pl-9 bg-slate-50/50 border-slate-200 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="monthly_debt_payments" className="text-xs font-bold uppercase tracking-widest text-slate-500">
              Other Monthly Debts
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="monthly_debt_payments"
                name="monthly_debt_payments"
                type="number"
                value={formData.monthly_debt_payments}
                onChange={handleChange}
                className="pl-9 bg-slate-50/50 border-slate-200 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-slate-100">
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Escrows & HOAs</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="annual_property_tax" className="text-xs font-bold uppercase tracking-widest text-slate-500">
              Annual Property Tax
            </Label>
            <Input
              id="annual_property_tax"
              name="annual_property_tax"
              type="number"
              value={formData.annual_property_tax}
              onChange={handleChange}
              className="bg-slate-50/50 border-slate-200 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="annual_home_insurance" className="text-xs font-bold uppercase tracking-widest text-slate-500">
              Annual Home Ins.
            </Label>
            <Input
              id="annual_home_insurance"
              name="annual_home_insurance"
              type="number"
              value={formData.annual_home_insurance}
              onChange={handleChange}
              className="bg-slate-50/50 border-slate-200 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="monthly_hoa" className="text-xs font-bold uppercase tracking-widest text-slate-500">
              Monthly HOA
            </Label>
            <Input
              id="monthly_hoa"
              name="monthly_hoa"
              type="number"
              value={formData.monthly_hoa}
              onChange={handleChange}
              className="bg-slate-50/50 border-slate-200 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100">
          <div className="flex items-center space-x-3">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${ltv > 80 ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>
              <Home className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600">LTV</p>
              <p className="text-xl font-bold text-blue-900">{ltv.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-xl border border-indigo-100">
          <div className="flex items-center space-x-3">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${dti > 43 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
              <Calculator className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">DTI</p>
              <p className="text-xl font-bold text-indigo-900">{dti.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </div>

      {ltv > 97 && (
        <div className="flex items-center p-3 bg-red-50 text-red-700 rounded-lg border border-red-100 text-xs font-bold uppercase">
          <AlertCircle className="mr-2 h-4 w-4" />
          Critical LTV: Exceeds standard program maximums (97%)
        </div>
      )}

      {dti > 50 && (
        <div className="flex items-center p-3 bg-red-50 text-red-700 rounded-lg border border-red-100 text-xs font-bold uppercase">
          <AlertCircle className="mr-2 h-4 w-4" />
          High DTI: Exceeds recommended 50% debt-to-income threshold
        </div>
      )}

      <Button 
        type="submit" 
        className="w-full bg-blue-600 hover:bg-blue-700 py-8 text-xl font-black shadow-xl shadow-blue-200 transition-all active:scale-[0.98]"
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="mr-3 h-6 w-6 animate-spin" />
        ) : (
          <Calculator className="mr-3 h-6 w-6" />
        )}
        GENERATE QUOTE COMPARISON
      </Button>
    </form>
  );
}
