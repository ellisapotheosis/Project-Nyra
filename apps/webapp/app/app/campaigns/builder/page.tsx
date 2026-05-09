'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  PhoneMissed,
  MessageSquare,
  Mail,
  Phone,
  MoreVertical,
  GripVertical
} from "lucide-react";

export default function CampaignBuilderPage() {
  return (
    <div className="flex flex-col space-y-8 p-8 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Campaign Builder</h1>
          <p className="mt-2 text-slate-500">
            Create your automated omnichannel sequence for 'Refinance Blitz'.
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" className="bg-white">
            Discard Changes
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            Save Campaign
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">

        {/* Step 1 */}
        <Card className="shadow-sm border-slate-200 border-t-4 border-t-blue-500">
          <CardHeader className="pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-slate-900">Day 1: Initial Contact</CardTitle>
              <p className="text-xs text-slate-500 mt-1">Trigger: Immediately after lead assignment</p>
            </div>
            <Button variant="ghost" size="icon" className="text-slate-400">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <ActionItem
              icon={<PhoneMissed className="h-4 w-4 text-green-600" />}
              iconBg="bg-green-100"
              title="Missed Call + Voicemail"
              subtitle="10:30 AM | Twilio Voice"
            />
            <ActionItem
              icon={<MessageSquare className="h-4 w-4 text-blue-600" />}
              iconBg="bg-blue-100"
              title="Text Message"
              subtitle="1:00 PM | Twilio SMS"
            />
            <ActionItem
              icon={<Mail className="h-4 w-4 text-red-600" />}
              iconBg="bg-red-100"
              title="Personalized Email"
              subtitle="3:45 PM | Gmail Integration"
            />
            <Button variant="ghost" className="w-full text-slate-500 border border-dashed border-slate-300 mt-2">
              <Plus className="mr-2 h-4 w-4" />
              Add Action
            </Button>
          </CardContent>
        </Card>

        {/* Step 2 */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-slate-900">Day 2: Follow-up</CardTitle>
              <p className="text-xs text-slate-500 mt-1">Trigger: 24 hours after initial contact</p>
            </div>
            <Button variant="ghost" size="icon" className="text-slate-400">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <ActionItem
              icon={<Phone className="h-4 w-4 text-green-600" />}
              iconBg="bg-green-100"
              title="Live Call Attempt"
              subtitle="9:15 AM | Operator Route"
            />
            <ActionItem
              icon={<Mail className="h-4 w-4 text-red-600" />}
              iconBg="bg-red-100"
              title="Follow-up Email"
              subtitle="2:30 PM | Outlook Integration"
            />
             <Button variant="ghost" className="w-full text-slate-500 border border-dashed border-slate-300 mt-2">
              <Plus className="mr-2 h-4 w-4" />
              Add Action
            </Button>
          </CardContent>
        </Card>

        {/* Add Step */}
        <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-slate-50 h-full min-h-[250px] cursor-pointer hover:bg-slate-100 transition-colors">
          <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
            <Plus className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Add Next Step</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">Extend your campaign sequence</p>
          <Button className="bg-white text-slate-700 border border-slate-200 hover:bg-slate-50">
            Add Day
          </Button>
        </div>

      </div>
    </div>
  );
}

function ActionItem({ icon, iconBg, title, subtitle }: any) {
  return (
    <div className="flex items-start group">
      <div className="flex flex-col items-center mr-3 mt-1 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity">
        <GripVertical className="h-4 w-4 text-slate-300" />
      </div>
      <div className={`flex items-center justify-center h-8 w-8 rounded-full ${iconBg} shrink-0 mt-0.5`}>
        {icon}
      </div>
      <div className="ml-3 flex-1 border border-slate-100 bg-white p-3 rounded-lg shadow-sm">
        <div className="flex justify-between items-start">
          <p className="text-sm font-bold text-slate-900">{title}</p>
        </div>
        <p className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-wider">{subtitle}</p>
      </div>
    </div>
  );
}
