<<<<<<< HEAD
"use client";

import React from "react";

export default function LeadCockpitPage() {
  return (
    <div className="p-8">
      <h1>Lead Cockpit</h1>
=======
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Phone,
  Mail,
  MessageSquare,
  User,
  MapPin,
  CreditCard,
  Calendar,
  Clock,
  PhoneMissed,
  PhoneCall,
  Send,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  Play,
} from "lucide-react";

export default function LeadProfilePage() {
  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-4rem)] bg-slate-50 overflow-hidden">

      {/* Left Column: Lead Details & Actions */}
      <div className="w-full md:w-[400px] flex flex-col border-r border-slate-200 bg-white overflow-y-auto">

        {/* Profile Header */}
        <div className="p-6 border-b border-slate-100 flex flex-col items-center text-center">
          <div className="h-20 w-20 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-2xl mb-4 shadow-sm">
            JD
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">John Doe</h2>
          <div className="flex items-center mt-2 space-x-2">
            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-none">Refinance</Badge>
            <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-none">Active Campaign</Badge>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-4 grid grid-cols-3 gap-2 border-b border-slate-100 bg-slate-50/50">
          <Button variant="outline" className="flex flex-col h-auto py-3 bg-white hover:bg-slate-50 hover:text-blue-600 border-slate-200">
            <Phone className="h-4 w-4 mb-1" />
            <span className="text-xs">Call</span>
          </Button>
          <Button variant="outline" className="flex flex-col h-auto py-3 bg-white hover:bg-slate-50 hover:text-blue-600 border-slate-200">
            <MessageSquare className="h-4 w-4 mb-1" />
            <span className="text-xs">Text</span>
          </Button>
          <Button variant="outline" className="flex flex-col h-auto py-3 bg-white hover:bg-slate-50 hover:text-blue-600 border-slate-200">
            <Mail className="h-4 w-4 mb-1" />
            <span className="text-xs">Email</span>
          </Button>
        </div>

        {/* Details Section */}
        <div className="p-6 space-y-6 flex-1">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-center text-sm text-slate-600">
                <Phone className="h-4 w-4 mr-3 text-slate-400" />
                (555) 123-4567
              </div>
              <div className="flex items-center text-sm text-slate-600">
                <Mail className="h-4 w-4 mr-3 text-slate-400" />
                john.doe@example.com
              </div>
              <div className="flex items-start text-sm text-slate-600">
                <MapPin className="h-4 w-4 mr-3 text-slate-400 mt-0.5" />
                <span>123 Main St, Apt 4B<br/>Austin, TX 78701</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Loan Details</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Loan Amount</span>
                <span className="font-semibold text-slate-900">$325,000</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Property Value</span>
                <span className="font-semibold text-slate-900">$450,000</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Credit Score</span>
                <span className="font-semibold text-slate-900 flex items-center">
                  <CreditCard className="h-3 w-3 mr-1 text-green-600" />
                  720-739
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Current Campaign</span>
                <span className="font-semibold text-blue-600 underline cursor-pointer">Refinance Blitz</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Communication History / Activity Feed */}
      <div className="flex-1 flex flex-col bg-slate-50">

        {/* Feed Header */}
        <div className="h-16 px-8 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
          <h2 className="text-lg font-bold text-slate-900">Activity & Communications</h2>
          <Tabs defaultValue="all" className="w-auto">
            <TabsList className="bg-slate-100">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="calls">Calls</TabsTrigger>
              <TabsTrigger value="messages">Messages</TabsTrigger>
              <TabsTrigger value="campaign">Campaigns</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Scrollable Feed */}
        <ScrollArea className="flex-1 p-8">
          <TabsContent value="all" className="mt-0">
            <div className="space-y-6 max-w-3xl mx-auto">

              {/* Timeline Item: Incoming Message */}
              <div className="flex items-start space-x-4">
                <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                  <User className="h-5 w-5 text-slate-500" />
                </div>
                <div className="flex-1 bg-white p-4 rounded-2xl rounded-tl-sm shadow-sm border border-slate-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-slate-900">John Doe (SMS)</span>
                    <span className="text-xs text-slate-400">Just now</span>
                  </div>
                  <p className="text-sm text-slate-700">Hey Ellis, I saw the email about rates dropping. I'm interested in seeing what my options look like for pulling some cash out for renovations.</p>
                </div>
              </div>

              {/* Timeline Item: Automated Email (Campaign) */}
              <div className="flex items-start space-x-4 flex-row-reverse space-x-reverse">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1 bg-blue-50 p-4 rounded-2xl rounded-tr-sm shadow-sm border border-blue-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-blue-400">Today, 9:00 AM</span>
                    <span className="text-sm font-semibold text-blue-900 flex items-center">
                      <CheckCircle2 className="h-3 w-3 mr-1 text-green-500" />
                      Automated Email Sent
                    </span>
                  </div>
                  <div className="text-sm text-blue-800 font-medium mb-1">Subject: 📉 Rates just dropped - Good news for your refinance!</div>
                  <p className="text-sm text-blue-700 line-clamp-2">Hi John, great news. We saw a dip in the market today that puts you in a great position to refinance your loan and lower your monthly payment. Let's chat for 5 minutes today...</p>
                  <div className="mt-3 flex">
                    <Badge variant="outline" className="bg-white/50 text-blue-600 border-blue-200 text-[10px] uppercase">Refinance Blitz: Step 3</Badge>
                  </div>
                </div>
              </div>

              {/* Timeline Item: Missed Call / Voicemail Drop */}
              <div className="flex items-start space-x-4 flex-row-reverse space-x-reverse">
                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                  <PhoneMissed className="h-5 w-5 text-purple-600" />
                </div>
                <div className="flex-1 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-slate-400">Yesterday, 2:30 PM</span>
                    <span className="text-sm font-semibold text-slate-900 flex items-center">
                      Ringless Voicemail Dropped
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                    <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full shrink-0">
                      <Play className="h-4 w-4" />
                    </Button>
                    <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full w-1/3 bg-purple-500 rounded-full" />
                    </div>
                    <span className="text-xs font-medium text-slate-500">0:45</span>
                  </div>
                  <div className="mt-3 flex">
                    <Badge variant="outline" className="bg-slate-50 text-slate-500 border-slate-200 text-[10px] uppercase">Refinance Blitz: Step 2</Badge>
                  </div>
                </div>
              </div>

               {/* Timeline Item: System Note */}
               <div className="flex justify-center my-6">
                <Badge variant="outline" className="bg-white text-slate-400 border-slate-200 px-4 py-1 text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  Lead assigned to Ellis Andersen - Yesterday, 9:00 AM
                </Badge>
              </div>

            </div>
          </TabsContent>

          <TabsContent value="pricing" className="mt-0 max-w-3xl mx-auto space-y-8">
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">Pricing Comparison</h3>
              <p className="text-sm text-slate-500 mb-6">Compare Conventional, FHA, VA, and HELOC options via Rocket & LenderPrice.</p>

              <div className="space-y-6">

                {/* Scenario 1: Conventional Cash Out */}
                <Card className="border border-blue-200 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600"></div>
                  <CardHeader className="pb-3 bg-slate-50/50">
                    <div className="flex justify-between items-center">
                      <div>
                        <Badge className="bg-blue-100 text-blue-800 border-none mb-2">Conventional Cash Out</Badge>
                        <CardTitle className="text-lg text-slate-900">Rocket Mortgage (Primary)</CardTitle>
                      </div>
                      <Badge variant="outline" className="text-slate-500 border-slate-200">720 FICO | 80% LTV</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-slate-500 bg-slate-50 uppercase border-y border-slate-100">
                        <tr>
                          <th className="px-6 py-3 font-semibold">Rate</th>
                          <th className="px-6 py-3 font-semibold">APR</th>
                          <th className="px-6 py-3 font-semibold">Cost / Credit</th>
                          <th className="px-6 py-3 font-semibold">Mo. Payment</th>
                          <th className="px-6 py-3 font-semibold text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        <tr className="hover:bg-slate-50">
                          <td className="px-6 py-4 font-bold text-slate-900">6.250%</td>
                          <td className="px-6 py-4 text-slate-600">6.345%</td>
                          <td className="px-6 py-4 text-slate-600">$1,250 (0.38%)</td>
                          <td className="px-6 py-4 font-semibold text-slate-900">$2,001</td>
                          <td className="px-6 py-4 text-right">
                            <Button size="sm" variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50">Propose</Button>
                          </td>
                        </tr>
                        <tr className="hover:bg-slate-50 bg-blue-50/30">
                          <td className="px-6 py-4 font-bold text-slate-900">6.500%</td>
                          <td className="px-6 py-4 text-slate-600">6.550%</td>
                          <td className="px-6 py-4 text-green-600 font-medium">($500) Credit</td>
                          <td className="px-6 py-4 font-semibold text-slate-900">$2,054</td>
                          <td className="px-6 py-4 text-right">
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">Propose</Button>
                          </td>
                        </tr>
                        <tr className="hover:bg-slate-50">
                          <td className="px-6 py-4 font-bold text-slate-900">6.750%</td>
                          <td className="px-6 py-4 text-slate-600">6.780%</td>
                          <td className="px-6 py-4 text-green-600 font-medium">($2,100) Credit</td>
                          <td className="px-6 py-4 font-semibold text-slate-900">$2,108</td>
                          <td className="px-6 py-4 text-right">
                            <Button size="sm" variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50">Propose</Button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </CardContent>
                </Card>

                {/* Scenario 2: FHA Cash Out (Alternative) */}
                <Card className="border border-slate-200 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-purple-500"></div>
                  <CardHeader className="pb-3 bg-slate-50/50">
                    <div className="flex justify-between items-center">
                      <div>
                        <Badge className="bg-purple-100 text-purple-800 border-none mb-2">FHA Cash Out</Badge>
                        <CardTitle className="text-lg text-slate-900">LenderPrice (Fallback)</CardTitle>
                      </div>
                      <Badge variant="outline" className="text-slate-500 border-slate-200">Better for &lt;680 FICO</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <table className="w-full text-sm text-left opacity-75">
                      <thead className="text-xs text-slate-500 bg-slate-50 uppercase border-y border-slate-100">
                        <tr>
                          <th className="px-6 py-3 font-semibold">Rate</th>
                          <th className="px-6 py-3 font-semibold">APR</th>
                          <th className="px-6 py-3 font-semibold">Cost / Credit</th>
                          <th className="px-6 py-3 font-semibold">Mo. Payment</th>
                          <th className="px-6 py-3 font-semibold text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        <tr className="hover:bg-slate-50">
                          <td className="px-6 py-4 font-bold text-slate-900">5.875%</td>
                          <td className="px-6 py-4 text-slate-600">6.850% (inc. MIP)</td>
                          <td className="px-6 py-4 text-slate-600">$850 (0.26%)</td>
                          <td className="px-6 py-4 font-semibold text-slate-900">$2,110</td>
                          <td className="px-6 py-4 text-right">
                            <Button size="sm" variant="outline">Propose</Button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </CardContent>
                </Card>

                {/* Scenario 3: HELOC (Alternative) */}
                <Card className="border border-slate-200 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-green-500"></div>
                  <CardHeader className="pb-3 bg-slate-50/50">
                    <div className="flex justify-between items-center">
                      <div>
                        <Badge className="bg-green-100 text-green-800 border-none mb-2">HELOC / Home Equity</Badge>
                        <CardTitle className="text-lg text-slate-900">Rocket Mortgage</CardTitle>
                      </div>
                      <Badge variant="outline" className="text-slate-500 border-slate-200">Keep 1st Mortgage</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="p-6 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-900 mb-1">Standalone HELOC ($75,000 line)</p>
                        <p className="text-xs text-slate-500">Prime + 1.25% (Currently 9.75%)</p>
                      </div>
                      <Button variant="outline" className="text-green-700 border-green-200 hover:bg-green-50">Propose HELOC Option</Button>
                    </div>
                  </CardContent>
                </Card>

              </div>
            </div>
          </TabsContent>
        </ScrollArea>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-200 shrink-0">
          <div className="max-w-3xl mx-auto flex items-end space-x-2">
            <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-shadow p-2">
              <textarea
                className="w-full bg-transparent border-none focus:ring-0 resize-none outline-none text-sm p-2 min-h-[60px]"
                placeholder="Type a message to send via SMS..."
              />
              <div className="flex justify-between items-center px-2 pb-1">
                <div className="flex space-x-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-slate-600">
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-slate-600">
                    <Mail className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center space-x-2 text-xs text-slate-400">
                  <input type="checkbox" id="stop-msg" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                  <label htmlFor="stop-msg" className="cursor-pointer">Append STOP instructions</label>
                </div>
              </div>
            </div>
            <Button className="h-auto py-3 bg-blue-600 hover:bg-blue-700 rounded-xl px-6">
              <Send className="h-4 w-4 mr-2" />
              Send
            </Button>
          </div>
        </div>

      </div>
>>>>>>> github/main
    </div>
  );
}
