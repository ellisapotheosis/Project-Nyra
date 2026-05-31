'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  CalendarDays,
  PhoneCall,
  Mail,
  RefreshCw,
  Home,
  ShoppingCart,
  ChevronRight,
  PhoneMissed,
  MessageSquare,
  Plus
} from 'lucide-react';
import Link from 'next/link';

export default function CampaignDashboard() {
  return (
    <div className="flex flex-col p-8 bg-slate-50 min-h-screen space-y-8">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Campaign Dashboard</h1>
          <p className="text-slate-500 mt-1">Manage your mortgage lead drip campaigns and nurturing flows.</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" className="bg-white">
            Export Data
          </Button>
          <Link href="/campaigns/builder">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="mr-2 h-4 w-4" />
              New Campaign
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Leads"
          value="1,248"
          trend="+12.4%"
          trendUp={true}
          icon={<Users className="h-5 w-5 text-blue-600" />}
          iconBg="bg-blue-100"
        />
        <StatCard
          title="Active Campaigns"
          value="8"
          trend=""
          trendUp={true}
          icon={<CalendarDays className="h-5 w-5 text-purple-600" />}
          iconBg="bg-purple-100"
        />
        <StatCard
          title="Today's Calls"
          value="142"
          trend=""
          trendUp={true}
          icon={<PhoneCall className="h-5 w-5 text-green-600" />}
          iconBg="bg-green-100"
        />
        <StatCard
          title="Emails Sent"
          value="1,842"
          trend=""
          trendUp={true}
          icon={<Mail className="h-5 w-5 text-red-600" />}
          iconBg="bg-red-100"
        />
      </div>

      {/* Campaigns Overview */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-slate-900">Your Campaigns</h2>
          <Button variant="link" className="text-blue-600 pr-0">
            View All <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CampaignCard
            title="Refinance Blitz"
            status="Active"
            description="45-day drip for refinance leads"
            icon={<RefreshCw className="h-5 w-5 text-purple-600" />}
            iconBg="bg-purple-100"
            leads={342}
            completion={62}
            response={18.7}
            statusColor="bg-blue-100 text-blue-800"
          />
          <CampaignCard
            title="Home Equity Pro"
            status="Completed"
            description="30-day sequence for HELOC leads"
            icon={<Home className="h-5 w-5 text-green-600" />}
            iconBg="bg-green-100"
            leads={187}
            completion={100}
            response={22.4}
            statusColor="bg-green-100 text-green-800"
          />
          <CampaignCard
            title="Purchase Power"
            status="Draft"
            description="40-day campaign for purchase leads"
            icon={<ShoppingCart className="h-5 w-5 text-yellow-600" />}
            iconBg="bg-yellow-100"
            leads={0}
            completion={0}
            response={0}
            statusColor="bg-yellow-100 text-yellow-800"
          />
          <CampaignCard
            title="Past Client Nurture"
            status="Active"
            description="Annual review and rate drop alerts for funded clients"
            icon={<Users className="h-5 w-5 text-indigo-600" />}
            iconBg="bg-indigo-100"
            leads={845}
            completion={12}
            response={8.2}
            statusColor="bg-blue-100 text-blue-800"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Leads */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-lg">Recent Leads</CardTitle>
            <p className="text-sm text-slate-500">Leads added in the last 24 hours</p>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y divide-slate-100">
              <LeadListItem
                name="John Doe"
                initials="JD"
                status="New"
                statusColor="bg-blue-100 text-blue-800"
                detail="Refinance - $325,000 loan"
                icon={<Home className="h-3 w-3 mr-1" />}
                color="bg-blue-500"
              />
              <LeadListItem
                name="Sarah Smith"
                initials="SS"
                status="Purchase"
                statusColor="bg-purple-100 text-purple-800"
                detail="sarah@example.com"
                icon={<Mail className="h-3 w-3 mr-1" />}
                color="bg-purple-500"
              />
              <LeadListItem
                name="Mike Johnson"
                initials="MJ"
                status="Contacted"
                statusColor="bg-orange-100 text-orange-800"
                detail="(555) 123-4567"
                icon={<PhoneCall className="h-3 w-3 mr-1" />}
                color="bg-orange-500"
              />
            </ul>
          </CardContent>
        </Card>

        {/* Campaign Timeline */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-lg">Campaign Timeline</CardTitle>
            <p className="text-sm text-slate-500">Upcoming automated communications</p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="relative pl-6 border-l-2 border-indigo-100 space-y-8">
              <TimelineItem
                time="Today, 10:30 AM"
                title="Missed Call + Voicemail Drop"
                description="John Doe - Refinance Blitz Campaign"
                channel="Twilio Voice"
                channelColor="bg-blue-100 text-blue-800"
                icon={<PhoneMissed className="h-4 w-4 text-white" />}
                iconBg="bg-indigo-500"
              />
              <TimelineItem
                time="Today, 1:45 PM"
                title="Personalized Email"
                description="Sarah Smith - Purchase Power Campaign"
                channel="Gmail"
                channelColor="bg-red-100 text-red-800"
                icon={<Mail className="h-4 w-4 text-white" />}
                iconBg="bg-sky-500"
              />
              <TimelineItem
                time="Tomorrow, 9:15 AM"
                title="SMS Follow-up"
                description="Mike Johnson - Cash Out Campaign"
                channel="Twilio SMS"
                channelColor="bg-blue-100 text-blue-800"
                icon={<MessageSquare className="h-4 w-4 text-white" />}
                iconBg="bg-blue-500"
              />
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}

function StatCard({ title, value, trend, trendUp, icon, iconBg }: any) {
  return (
    <Card className="shadow-sm border-slate-200">
      <CardContent className="p-6 flex items-center">
        <div className={`p-3 rounded-lg ${iconBg} mr-4`}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <div className="flex items-baseline space-x-2 mt-1">
            <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
            {trend && (
              <span className={`text-sm font-medium ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
                {trend}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CampaignCard({ title, status, description, icon, iconBg, leads, completion, response, statusColor }: any) {
  return (
    <Card className="shadow-sm border-slate-200 hover:shadow-md transition-shadow group overflow-hidden">
      <div className="p-5 border-b border-slate-100">
        <div className="flex justify-between items-start mb-2">
          <div>
            <Badge className={`${statusColor} hover:${statusColor} border-none font-semibold px-2.5 py-0.5 rounded-full`}>
              {status}
            </Badge>
            <h3 className="mt-3 text-lg font-bold text-slate-900">{title}</h3>
          </div>
          <div className={`p-2 rounded-lg ${iconBg}`}>
            {icon}
          </div>
        </div>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
      <div className="bg-slate-50 p-5">
        <div className="flex justify-between text-sm mb-3">
          <div>
            <p className="text-slate-500">Leads</p>
            <p className="font-semibold text-slate-900">{leads}</p>
          </div>
          <div>
            <p className="text-slate-500">Completion</p>
            <p className="font-semibold text-slate-900">{completion}%</p>
          </div>
          <div>
            <p className="text-slate-500">Response</p>
            <p className="font-semibold text-slate-900">{response}%</p>
          </div>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${completion}%` }}
          />
        </div>
      </div>
    </Card>
  );
}

function LeadListItem({ name, initials, status, statusColor, detail, icon, color }: any) {
  return (
    <li className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
      <div className="flex items-center">
        <div className={`h-10 w-10 rounded-full ${color} flex items-center justify-center text-white font-bold text-sm`}>
          {initials}
        </div>
        <div className="ml-4">
          <div className="flex items-center">
            <h4 className="text-sm font-semibold text-slate-900">{name}</h4>
            <Badge className={`ml-2 border-none rounded-full px-2 py-0.5 text-xs font-medium ${statusColor}`}>
              {status}
            </Badge>
          </div>
          <div className="flex items-center text-sm text-slate-500 mt-1">
            {icon}
            <span>{detail}</span>
          </div>
        </div>
      </div>
      <Button variant="outline" size="sm" className="text-xs">
        Assign
      </Button>
    </li>
  );
}

function TimelineItem({ time, title, description, channel, channelColor, icon, iconBg }: any) {
  return (
    <div className="relative">
      <div className={`absolute -left-[35px] mt-1 h-6 w-6 rounded-full border-4 border-white ${iconBg} flex items-center justify-center shadow-sm`}>
        {/* We use a smaller icon or just a colored dot. Here we can use the passed icon if we shrink it, but a dot is cleaner for timelines. Let's use the icon. */}
        <div className="scale-[0.6]">{icon}</div>
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{time}</p>
        <h4 className="text-sm font-bold text-slate-900 mt-1">{title}</h4>
        <p className="text-sm text-slate-600 mt-0.5">{description}</p>
        <Badge className={`mt-2 border-none rounded-full px-2 py-0.5 text-xs font-medium ${channelColor}`}>
          {channel}
        </Badge>
      </div>
    </div>
  );
}
