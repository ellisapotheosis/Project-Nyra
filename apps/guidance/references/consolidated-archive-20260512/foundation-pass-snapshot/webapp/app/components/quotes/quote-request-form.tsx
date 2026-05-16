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
  AlertCircle,
  Loader2,
  Zap
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

  const ltv = formData.property_value > 0 ? (formData.loan_amount / formData.property_value) * 100 : 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Core Scenario</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="property_value" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Property Value
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="property_value"
                name="property_value"
                type="number"
                value={formData.property_value}
                onChange={handleChange}
                className="pl-9 bg-background/40"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="loan_amount" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Loan Amount
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="loan_amount"
                name="loan_amount"
                type="number"
                value={formData.loan_amount}
                onChange={handleChange}
                className="pl-9 bg-background/40"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="credit_score" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Credit Score
            </Label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="credit_score"
                name="credit_score"
                type="number"
                value={formData.credit_score}
                onChange={handleChange}
                className="pl-9 bg-background/40"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="annual_interest_rate" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Base Interest Rate (%)
            </Label>
            <div className="relative">
              <Calculator className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="annual_interest_rate"
                name="annual_interest_rate"
                type="number"
                step="0.125"
                value={formData.annual_interest_rate}
                onChange={handleChange}
                className="pl-9 bg-background/40"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-border">
        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Borrower Financial Inputs</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="monthly_gross_income" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Monthly Gross Income
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="monthly_gross_income"
                name="monthly_gross_income"
                type="number"
                value={formData.monthly_gross_income}
                onChange={handleChange}
                className="pl-9 bg-background/40"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="monthly_debt_payments" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Other Monthly Debts
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="monthly_debt_payments"
                name="monthly_debt_payments"
                type="number"
                value={formData.monthly_debt_payments}
                onChange={handleChange}
                className="pl-9 bg-background/40"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-border">
        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Escrows & HOAs</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="annual_property_tax" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Annual Property Tax
            </Label>
            <Input
              id="annual_property_tax"
              name="annual_property_tax"
              type="number"
              value={formData.annual_property_tax}
              onChange={handleChange}
              className="bg-background/40"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="annual_home_insurance" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Annual Home Ins.
            </Label>
            <Input
              id="annual_home_insurance"
              name="annual_home_insurance"
              type="number"
              value={formData.annual_home_insurance}
              onChange={handleChange}
              className="bg-background/40"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="monthly_hoa" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Monthly HOA
            </Label>
            <Input
              id="monthly_hoa"
              name="monthly_hoa"
              type="number"
              value={formData.monthly_hoa}
              onChange={handleChange}
              className="bg-background/40"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="flex items-center justify-between p-5 bg-background/35 rounded-lg border border-border/50 shadow-inner group hover:border-primary/30 transition-colors">
          <div className="flex items-center space-x-4">
            <div className={`h-11 w-11 rounded-lg flex items-center justify-center border shadow-lg ${ltv > 80 ? 'bg-destructive/10 text-destructive border-destructive/20' : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'}`}>
              <Home className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground group-hover:text-primary transition-colors">LTV_ESTIMATE</p>
              <p className="text-2xl font-black text-foreground tracking-tighter">{ltv.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-5 bg-background/35 rounded-lg border border-border/50 shadow-inner group hover:border-primary/30 transition-colors">
          <div className="flex items-center space-x-4">
            <div className="h-11 w-11 rounded-lg flex items-center justify-center bg-primary/10 text-primary border border-primary/20 shadow-lg">
              <Calculator className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground group-hover:text-primary transition-colors">DTI_INDEX</p>
              <p className="text-[10px] font-black text-foreground uppercase tracking-widest opacity-50">SERVICE_COMPUTED</p>
            </div>
          </div>
        </div>
      </div>

      {ltv > 97 && (
        <div className="flex items-center p-4 bg-destructive/10 text-destructive rounded-lg border border-destructive/30 text-[10px] font-black uppercase tracking-widest animate-pulse">
          <AlertCircle className="mr-3 h-5 w-5" />
          CRITICAL_LTV: EXCEEDS_STANDARD_LIMITS (97%)
        </div>
      )}

      <Button
        type="submit"
        className="w-full py-8 text-sm font-black uppercase tracking-[0.2em] transition-all active:scale-[0.98] bg-primary hover:bg-primary/80 text-white shadow-2xl shadow-primary/20 rounded-lg"
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="mr-3 h-6 w-6 animate-spin" />
        ) : (
          <Zap className="mr-3 h-6 w-6" />
        )}
        DISPATCH_QUOTE_SCENARIO
      </Button>
    </form>
  );
}
