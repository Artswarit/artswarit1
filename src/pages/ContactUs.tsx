import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Phone, MapPin, Clock, Shield, AlertTriangle, Building2, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const ContactUs = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-purple-50 dark:from-background dark:via-background dark:to-background">
      <Navbar />

      <main className="flex-1 pt-20 sm:pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">

          {/* Hero */}
          <div className="text-center mb-12 sm:mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-2">
              <Mail className="h-4 w-4" />
              We're Here to Help
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight bg-gradient-to-r from-primary via-purple-600 to-indigo-600 bg-clip-text text-transparent leading-tight">
              Contact Us
            </h1>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Whether you have a question, need support, or wish to escalate a concern — we're committed to resolving it promptly and transparently.
            </p>
          </div>

          {/* General Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
            <Card className="border-primary/10 shadow-md hover:shadow-lg transition-shadow text-center">
              <CardContent className="p-6 space-y-3">
                <div className="p-3 rounded-2xl bg-primary/10 w-fit mx-auto">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-black text-sm">Email Support</h3>
                <a href="mailto:support@artswarit.com" className="text-primary font-semibold text-sm underline underline-offset-2 block">
                  support@artswarit.com
                </a>
                <p className="text-xs text-muted-foreground">Response within 24 hours</p>
              </CardContent>
            </Card>
            <Card className="border-primary/10 shadow-md hover:shadow-lg transition-shadow text-center">
              <CardContent className="p-6 space-y-3">
                <div className="p-3 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 w-fit mx-auto">
                  <Clock className="h-5 w-5 text-emerald-600" />
                </div>
                <h3 className="font-black text-sm">Support Hours</h3>
                <p className="text-sm text-muted-foreground font-medium">Mon – Sat</p>
                <p className="text-xs text-muted-foreground">10:00 AM – 7:00 PM IST</p>
              </CardContent>
            </Card>
            <Card className="border-primary/10 shadow-md hover:shadow-lg transition-shadow text-center">
              <CardContent className="p-6 space-y-3">
                <div className="p-3 rounded-2xl bg-amber-100 dark:bg-amber-900/30 w-fit mx-auto">
                  <Shield className="h-5 w-5 text-amber-600" />
                </div>
                <h3 className="font-black text-sm">Grievance Email</h3>
                <a href="mailto:grievance@artswarit.com" className="text-primary font-semibold text-sm underline underline-offset-2 block">
                  grievance@artswarit.com
                </a>
                <p className="text-xs text-muted-foreground">For formal complaints</p>
              </CardContent>
            </Card>
          </div>

          {/* Grievance Redressal - Main Section */}
          <Card className="mb-8 border-red-200 dark:border-red-900/40 shadow-lg overflow-hidden">
            <CardContent className="p-6 sm:p-10">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 rounded-2xl bg-red-100 dark:bg-red-900/30 shrink-0">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight mb-1">Grievance Redressal Mechanism</h2>
                  <p className="text-xs font-bold text-red-600 uppercase tracking-widest">IT Rules 2021, Rule 3(2) & Rule 4 · Consumer Protection Act, 2019</p>
                </div>
              </div>

              <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
                <p>
                  In compliance with the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021 (as amended through 2026), and the Consumer Protection Act, 2019, Artswarit has established a formal Grievance Redressal Mechanism with a designated Nodal Officer.
                </p>

                {/* Nodal Officer Card */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-red-50 to-amber-50 dark:from-red-950/20 dark:to-amber-950/20 border border-red-200 dark:border-red-800/30 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-white dark:bg-background shadow-sm">
                      <User className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-red-600 uppercase tracking-widest">Nodal Contact Officer / Grievance Officer</p>
                      <p className="font-black text-lg text-foreground">Ashwareet Basu</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-muted-foreground/70 uppercase tracking-wider">Designation</p>
                      <p className="font-semibold text-foreground">Proprietor & Nodal Officer</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-muted-foreground/70 uppercase tracking-wider">Grievance Email</p>
                      <a href="mailto:grievance@artswarit.com" className="font-semibold text-primary underline underline-offset-2">grievance@artswarit.com</a>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-muted-foreground/70 uppercase tracking-wider">General Support</p>
                      <a href="mailto:support@artswarit.com" className="font-semibold text-primary underline underline-offset-2">support@artswarit.com</a>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-muted-foreground/70 uppercase tracking-wider">Response Commitment</p>
                      <p className="font-semibold text-foreground">Acknowledgement within 24 hours</p>
                    </div>
                  </div>
                </div>

                {/* Complaint Process */}
                <div>
                  <h3 className="font-black text-base text-foreground mb-3">How to File a Grievance</h3>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>
                      <strong>Email your complaint</strong> to <a href="mailto:grievance@artswarit.com" className="text-primary font-semibold underline underline-offset-2">grievance@artswarit.com</a> with the following details:
                      <ul className="list-disc pl-5 mt-1 space-y-1">
                        <li>Your full name and registered email address</li>
                        <li>Your User ID or account email</li>
                        <li>A detailed description of the grievance</li>
                        <li>Any relevant project/milestone IDs, screenshots, or supporting documents</li>
                        <li>The relief or resolution you are seeking</li>
                      </ul>
                    </li>
                    <li><strong>Acknowledgement:</strong> You will receive an acknowledgement with a ticket number within <strong>24 hours</strong> of receipt.</li>
                    <li><strong>Investigation:</strong> The Grievance Officer will investigate the matter and may contact you for additional information.</li>
                    <li><strong>Resolution:</strong> A final resolution will be communicated within <strong>15 days</strong> of receipt of the complaint, in compliance with IT Rules 2021.</li>
                    <li><strong>Escalation:</strong> If unsatisfied with the resolution, you may escalate the matter by writing to <a href="mailto:escalation@artswarit.com" className="text-primary font-semibold underline underline-offset-2">escalation@artswarit.com</a> or approach the appropriate consumer forum or regulatory authority.</li>
                  </ol>
                </div>

                {/* Types of Grievances */}
                <div>
                  <h3 className="font-black text-base text-foreground mb-3">Types of Grievances Handled</h3>
                  <ul className="list-disc pl-5 space-y-1.5">
                    <li>Payment disputes, refund delays, or escrow-related queries</li>
                    <li>Content takedown requests (including CSAM, IP violations, defamatory content)</li>
                    <li>Account suspension or termination appeals</li>
                    <li>Data privacy and personal data requests (access, correction, deletion)</li>
                    <li>Platform misuse, harassment, or fraudulent activity reports</li>
                    <li>Any other concern related to the use of Artswarit services</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Office Addresses */}
          <Card className="mb-8 border-primary/10 shadow-lg overflow-hidden">
            <CardContent className="p-6 sm:p-10">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 shrink-0">
                  <Building2 className="h-6 w-6 text-indigo-600" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight">Office Addresses</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-5 rounded-2xl bg-muted/40 border border-border/50 space-y-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <p className="text-xs font-bold text-primary uppercase tracking-widest">Registered Office</p>
                  </div>
                  <div className="text-sm text-muted-foreground leading-relaxed">
                    <p className="font-bold text-foreground mb-1">Ashwareet Basu</p>
                    <p>Bairiya Bazar, Turkaulia,</p>
                    <p>Purbi Champaran, Bihar — 845437</p>
                    <p>India</p>
                  </div>
                </div>
                <div className="p-5 rounded-2xl bg-muted/40 border border-border/50 space-y-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-emerald-600" />
                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Operations Hub</p>
                  </div>
                  <div className="text-sm text-muted-foreground leading-relaxed">
                    <p className="font-bold text-foreground mb-1">Artswarit Operations</p>
                    <p>Kalkaji, New Delhi — 110019</p>
                    <p>India</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Legal Compliance Note */}
          <Card className="mb-6 border-primary/10 shadow-md">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start gap-3 mb-4">
                <Shield className="h-5 w-5 text-primary mt-1 shrink-0" />
                <h2 className="text-lg sm:text-xl font-black tracking-tight">Regulatory Compliance</h2>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground leading-relaxed pl-8">
                <p>Artswarit's grievance redressal mechanism is established in compliance with:</p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li><strong>Information Technology Act, 2000</strong> — Section 79 (Intermediary due diligence)</li>
                  <li><strong>IT (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021</strong> (as amended through 2026) — Rule 3(2), Rule 4</li>
                  <li><strong>Consumer Protection Act, 2019</strong> — Consumer grievance redressal obligations</li>
                  <li><strong>Digital Personal Data Protection Act, 2023</strong> — Data principal rights and grievance mechanism</li>
                  <li><strong>RBI Master Directions on Payment Aggregators, 2026</strong> — Customer grievance redressal for payment-related issues</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <div className="text-center space-y-4 pt-4">
            <div className="flex flex-wrap justify-center gap-3 text-sm">
              <Link to="/terms-of-service" className="text-primary font-semibold underline underline-offset-2 hover:text-primary/80 transition-colors">Terms of Service</Link>
              <span className="text-muted-foreground/40">·</span>
              <Link to="/privacy-policy" className="text-primary font-semibold underline underline-offset-2 hover:text-primary/80 transition-colors">Privacy Policy</Link>
              <span className="text-muted-foreground/40">·</span>
              <Link to="/refund-policy" className="text-primary font-semibold underline underline-offset-2 hover:text-primary/80 transition-colors">Refund Policy</Link>
              <span className="text-muted-foreground/40">·</span>
              <Link to="/about-us" className="text-primary font-semibold underline underline-offset-2 hover:text-primary/80 transition-colors">About Us</Link>
            </div>
            <p className="text-xs text-muted-foreground/60">
              © 2026 Artswarit · Sole Proprietorship of Ashwareet Basu · All rights reserved.
            </p>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ContactUs;
