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
    term_years: 30
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData as QuoteRequest);
  };

  const ltv = (formData.loan_amount / formData.property_value) * 100;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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

      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100">
        <div className="flex items-center space-x-3">
          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${ltv > 80 ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>
            <Home className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Calculated LTV</p>
            <p className="text-xl font-bold text-blue-900">{ltv.toFixed(2)}%</p>
          </div>
        </div>
        {ltv > 97 && (
          <div className="flex items-center text-red-600 space-x-2">
            <AlertCircle className="h-4 w-4" />
            <span className="text-xs font-bold uppercase">Critical LTV</span>
          </div>
        )}
      </div>

      <Button 
        type="submit" 
        className="w-full bg-blue-600 hover:bg-blue-700 py-6 text-lg font-bold shadow-lg shadow-blue-200"
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        ) : (
          <Calculator className="mr-2 h-5 w-5" />
        )}
        Run Comparison Engine
      </Button>
    </form>
  );
}
