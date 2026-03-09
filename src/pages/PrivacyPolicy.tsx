import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { ShieldCheck, Eye, Database, Lock, Globe, UserCheck, Trash2, Bell, Scale, FileText, Server } from 'lucide-react';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-purple-50 dark:from-background dark:via-background dark:to-background">
      <Navbar />

      <main className="flex-1 pt-20 sm:pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">

          {/* Hero */}
          <div className="text-center mb-12 sm:mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-2">
              <ShieldCheck className="h-4 w-4" />
              DPDP Act 2023 Compliant
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight bg-gradient-to-r from-primary via-purple-600 to-indigo-600 bg-clip-text text-transparent leading-tight">
              Privacy Policy
            </h1>
            <p className="text-sm text-muted-foreground">
              <strong>Effective Date:</strong> 1st March, 2026 · <strong>Last Updated:</strong> 27th February, 2026
            </p>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Artswarit (Sole Proprietorship of Ashwareet Basu) is committed to protecting your personal data. This Privacy Policy explains how we collect, use, store, and protect your information in compliance with the Digital Personal Data Protection Act, 2023, the IT Act 2000, and the RBI guidelines for payment aggregators.
            </p>
          </div>

          {/* Section 1: Data Controller */}
          <Card className="mb-6 border-primary/10 shadow-md">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start gap-3 mb-4">
                <UserCheck className="h-5 w-5 text-primary mt-1 shrink-0" />
                <h2 className="text-lg sm:text-xl font-black tracking-tight">1. Data Fiduciary (Controller)</h2>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground leading-relaxed pl-8">
                <p>
                  The <strong>Data Fiduciary</strong> (as defined under the DPDP Act, 2023) for all personal data processed through artswarit.com is:
                </p>
                <div className="p-4 rounded-xl bg-muted/40 border border-border/50 space-y-1">
                  <p className="font-bold text-foreground">Ashwareet Basu</p>
                  <p>Proprietor, Artswarit</p>
                  <p>Registered Office: Bairiya Bazar, Turkaulia, Purbi Champaran, Bihar — 845437, India</p>
                  <p>Operations Hub: Kalkaji, New Delhi — 110019, India</p>
                  <p>Email: <a href="mailto:privacy@artswarit.com" className="text-primary font-semibold">privacy@artswarit.com</a></p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Data We Collect */}
          <Card className="mb-6 border-primary/10 shadow-md">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start gap-3 mb-4">
                <Database className="h-5 w-5 text-primary mt-1 shrink-0" />
                <h2 className="text-lg sm:text-xl font-black tracking-tight">2. Personal Data We Collect</h2>
              </div>
              <div className="space-y-4 text-sm text-muted-foreground leading-relaxed pl-8">
                <div>
                  <h3 className="font-bold text-foreground mb-2">a. Data You Provide Directly</h3>
                  <ul className="list-disc pl-5 space-y-1.5">
                    <li><strong>Account Registration:</strong> Full name, email address, password (hashed), role (Artist/Client), country, city</li>
                    <li><strong>Profile Information:</strong> Bio, avatar image, portfolio links, social media links, skills, categories</li>
                    <li><strong>KYC/Verification:</strong> Phone number, tax identification (PAN/GST), bank account details for artist payouts</li>
                    <li><strong>Communications:</strong> Messages sent via the platform's chat system, project descriptions, milestone specifications</li>
                    <li><strong>Payment Data:</strong> Billing address, transaction records. Note: We do NOT store credit/debit card numbers — this is handled by our PCI-DSS Level 1 compliant partner (Razorpay).</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold text-foreground mb-2">b. Data Collected Automatically</h3>
                  <ul className="list-disc pl-5 space-y-1.5">
                    <li><strong>Device Information:</strong> Browser type, operating system, screen resolution, device identifiers</li>
                    <li><strong>Usage Data:</strong> Pages visited, click patterns, session duration, search queries, artwork views/likes</li>
                    <li><strong>Network Data:</strong> IP address, approximate location (city-level), referral URLs</li>
                    <li><strong>Cookies & Tracking:</strong> Session cookies (essential), analytics cookies (with consent). See Section 8 below.</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Purpose */}
          <Card className="mb-6 border-primary/10 shadow-md">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start gap-3 mb-4">
                <Eye className="h-5 w-5 text-primary mt-1 shrink-0" />
                <h2 className="text-lg sm:text-xl font-black tracking-tight">3. Purpose & Legal Basis for Processing</h2>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground leading-relaxed pl-8">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="py-3 px-4 text-left font-bold text-foreground">Purpose</th>
                        <th className="py-3 px-4 text-left font-bold text-foreground">Legal Basis (DPDP Act)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-border/50">
                        <td className="py-3 px-4">Account creation & authentication</td>
                        <td className="py-3 px-4">Consent (Section 6)</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-3 px-4">Facilitating artist-client transactions</td>
                        <td className="py-3 px-4">Performance of contract</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-3 px-4">Payment processing & escrow management</td>
                        <td className="py-3 px-4">Legal obligation (RBI PA/PG Guidelines)</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-3 px-4">KYC/Identity verification for payouts</td>
                        <td className="py-3 px-4">Legal obligation (RBI KYC norms)</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-3 px-4">Content moderation & compliance</td>
                        <td className="py-3 px-4">Legal obligation (IT Rules 2021)</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-3 px-4">Platform analytics & improvement</td>
                        <td className="py-3 px-4">Legitimate use (with consent)</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4">Marketing communications</td>
                        <td className="py-3 px-4">Consent (opt-in, withdrawable)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 4: Data Sharing */}
          <Card className="mb-6 border-primary/10 shadow-md">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start gap-3 mb-4">
                <Globe className="h-5 w-5 text-primary mt-1 shrink-0" />
                <h2 className="text-lg sm:text-xl font-black tracking-tight">4. Data Sharing & Third Parties</h2>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground leading-relaxed pl-8">
                <p><strong>We do not sell your personal data. Ever.</strong></p>
                <p>We share personal data only with the following categories of recipients, and only to the extent necessary:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Payment Processor (Razorpay):</strong> To process payments, manage escrow, and comply with RBI mandates. Razorpay is PCI-DSS Level 1 certified.</li>
                  <li><strong>Cloud Hosting (Supabase / AWS):</strong> For data storage and infrastructure. All data is encrypted at rest and in transit.</li>
                  <li><strong>Authentication (Supabase Auth):</strong> For secure user authentication including email verification and password management.</li>
                  <li><strong>Analytics (aggregate, anonymised):</strong> We may use anonymised, aggregated data for platform performance analysis. This data cannot identify individual users.</li>
                  <li><strong>Law Enforcement:</strong> We will disclose personal data if required by a court order, government directive, or law enforcement request under applicable Indian law.</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Section 5: Data Storage & Security */}
          <Card className="mb-6 border-primary/10 shadow-md">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start gap-3 mb-4">
                <Lock className="h-5 w-5 text-primary mt-1 shrink-0" />
                <h2 className="text-lg sm:text-xl font-black tracking-tight">5. Data Storage & Security</h2>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground leading-relaxed pl-8">
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Encryption:</strong> All data is encrypted at rest (AES-256) and in transit (TLS 1.2+).</li>
                  <li><strong>Password Storage:</strong> Passwords are hashed using industry-standard bcrypt algorithms and are never stored in plain text.</li>
                  <li><strong>Access Control:</strong> Access to personal data is restricted to authorised personnel on a need-to-know basis with audit logging.</li>
                  <li><strong>Infrastructure:</strong> Our platform is hosted on Supabase (backed by AWS infrastructure) with data centres that comply with SOC 2 Type II and ISO 27001 standards.</li>
                  <li><strong>Payment Security:</strong> Card and bank account data is handled exclusively by Razorpay (PCI-DSS Level 1). Artswarit does not have access to raw card numbers.</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Section 6: Data Retention */}
          <Card className="mb-6 border-primary/10 shadow-md">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start gap-3 mb-4">
                <Server className="h-5 w-5 text-primary mt-1 shrink-0" />
                <h2 className="text-lg sm:text-xl font-black tracking-tight">6. Data Retention</h2>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground leading-relaxed pl-8">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="py-3 px-4 text-left font-bold text-foreground">Data Category</th>
                        <th className="py-3 px-4 text-left font-bold text-foreground">Retention Period</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-border/50">
                        <td className="py-3 px-4">Account data (name, email, profile)</td>
                        <td className="py-3 px-4">Until account deletion + 30 days</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-3 px-4">Transaction records</td>
                        <td className="py-3 px-4">7 years (Income Tax Act, 1961)</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-3 px-4">KYC documents</td>
                        <td className="py-3 px-4">5 years post relationship end (RBI KYC norms)</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-3 px-4">Chat/message logs</td>
                        <td className="py-3 px-4">Until account deletion</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-3 px-4">Server logs (IP, access)</td>
                        <td className="py-3 px-4">90 days (rolling)</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4">Analytics data</td>
                        <td className="py-3 px-4">Anonymised; retained indefinitely</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 7: Your Rights */}
          <Card className="mb-6 border-emerald-200 dark:border-emerald-900/40 shadow-md">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start gap-3 mb-4">
                <UserCheck className="h-5 w-5 text-emerald-600 mt-1 shrink-0" />
                <div>
                  <h2 className="text-lg sm:text-xl font-black tracking-tight">7. Your Rights as a Data Principal</h2>
                  <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mt-1">DPDP Act, 2023 — Chapter III</p>
                </div>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground leading-relaxed pl-8">
                <p>Under the Digital Personal Data Protection Act, 2023, you (the "Data Principal") have the following rights:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Right to Access:</strong> You may request a summary of the personal data processed about you and the processing activities.</li>
                  <li><strong>Right to Correction:</strong> You may request correction of inaccurate or incomplete personal data.</li>
                  <li><strong>Right to Erasure:</strong> You may request deletion of your personal data (subject to legal retention obligations).</li>
                  <li><strong>Right to Withdraw Consent:</strong> You may withdraw consent for data processing at any time. Withdrawal does not affect the lawfulness of processing done prior to withdrawal.</li>
                  <li><strong>Right to Grievance Redressal:</strong> You may file a complaint with our Grievance Officer or the Data Protection Board of India.</li>
                  <li><strong>Right to Nominate:</strong> You may nominate another individual to exercise your rights in the event of your death or incapacity.</li>
                </ul>
                <p>
                  To exercise any of these rights, contact <a href="mailto:privacy@artswarit.com" className="text-primary font-semibold underline underline-offset-2">privacy@artswarit.com</a> or our Grievance Officer via the <Link to="/contact-us" className="text-primary font-semibold underline underline-offset-2">Contact & Grievance Redressal</Link> page.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Section 8: Cookies */}
          <Card className="mb-6 border-primary/10 shadow-md">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start gap-3 mb-4">
                <FileText className="h-5 w-5 text-primary mt-1 shrink-0" />
                <h2 className="text-lg sm:text-xl font-black tracking-tight">8. Cookies & Tracking Technologies</h2>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground leading-relaxed pl-8">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="py-3 px-4 text-left font-bold text-foreground">Cookie Type</th>
                        <th className="py-3 px-4 text-left font-bold text-foreground">Purpose</th>
                        <th className="py-3 px-4 text-left font-bold text-foreground">Consent</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-border/50">
                        <td className="py-3 px-4 font-medium">Essential</td>
                        <td className="py-3 px-4">Authentication, session management, security</td>
                        <td className="py-3 px-4">Not required (strictly necessary)</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-3 px-4 font-medium">Functional</td>
                        <td className="py-3 px-4">Remembering preferences, theme, language</td>
                        <td className="py-3 px-4">Optional (consent-based)</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-medium">Analytics</td>
                        <td className="py-3 px-4">Understanding usage patterns, improving UX</td>
                        <td className="py-3 px-4">Optional (consent-based)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p>
                  We do <strong>not</strong> use third-party advertising trackers or sell data to advertisers. You may manage cookie preferences in your browser settings at any time.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Section 9: Children */}
          <Card className="mb-6 border-primary/10 shadow-md">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start gap-3 mb-4">
                <Trash2 className="h-5 w-5 text-primary mt-1 shrink-0" />
                <h2 className="text-lg sm:text-xl font-black tracking-tight">9. Children's Data</h2>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground leading-relaxed pl-8">
                <p>
                  Artswarit is not intended for use by individuals under the age of <strong>18 years</strong>. We do not knowingly collect personal data from minors. In compliance with Section 9 of the DPDP Act, 2023, processing of a child's personal data requires verifiable parental consent.
                </p>
                <p>
                  If we become aware that we have collected data from a child without appropriate consent, we will take immediate steps to delete such data.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Section 10: Updates */}
          <Card className="mb-6 border-primary/10 shadow-md">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start gap-3 mb-4">
                <Bell className="h-5 w-5 text-primary mt-1 shrink-0" />
                <h2 className="text-lg sm:text-xl font-black tracking-tight">10. Changes to This Policy</h2>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground leading-relaxed pl-8">
                <p>
                  We may update this Privacy Policy from time to time to reflect changes in our practices, technology, or legal requirements. Material changes will be notified via email and/or a prominent notice on the Platform at least <strong>30 days before</strong> the changes take effect.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Section 11: Contact */}
          <Card className="mb-6 border-primary/10 shadow-md">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start gap-3 mb-4">
                <Scale className="h-5 w-5 text-primary mt-1 shrink-0" />
                <h2 className="text-lg sm:text-xl font-black tracking-tight">11. Contact for Privacy Concerns</h2>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground leading-relaxed pl-8">
                <p>For any privacy-related questions, data access requests, or complaints:</p>
                <div className="p-4 rounded-xl bg-muted/40 border border-border/50 space-y-1">
                  <p><strong>Privacy Email:</strong> <a href="mailto:privacy@artswarit.com" className="text-primary font-semibold">privacy@artswarit.com</a></p>
                  <p><strong>Grievance Officer:</strong> Ashwareet Basu — <a href="mailto:grievance@artswarit.com" className="text-primary font-semibold">grievance@artswarit.com</a></p>
                  <p><strong>Regulatory Authority:</strong> Data Protection Board of India (once constituted under DPDP Act, 2023)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center space-y-3 pt-4">
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

export default PrivacyPolicy;
