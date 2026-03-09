import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Scale, ShieldCheck, FileText, Ban, CreditCard, AlertTriangle, Users, Clock, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

const TermsOfService = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-purple-50 dark:from-background dark:via-background dark:to-background">
      <Navbar />

      <main className="flex-1 pt-20 sm:pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">

          {/* Hero */}
          <div className="text-center mb-12 sm:mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-2">
              <Scale className="h-4 w-4" />
              Legally Binding Agreement
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight bg-gradient-to-r from-primary via-purple-600 to-indigo-600 bg-clip-text text-transparent leading-tight">
              Terms of Service
            </h1>
            <p className="text-sm text-muted-foreground">
              <strong>Effective Date:</strong> 1st March, 2026 · <strong>Last Updated:</strong> 27th February, 2026
            </p>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              These Terms of Service ("Terms") constitute a legally binding agreement between you and Artswarit (Sole Proprietorship of Ashwareet Basu). By accessing or using artswarit.com, you agree to be bound by these Terms in their entirety.
            </p>
          </div>

          {/* Section 1: Definitions */}
          <Card className="mb-6 border-primary/10 shadow-md">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start gap-3 mb-4">
                <FileText className="h-5 w-5 text-primary mt-1 shrink-0" />
                <h2 className="text-lg sm:text-xl font-black tracking-tight">1. Definitions & Interpretation</h2>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground leading-relaxed pl-8">
                <p><strong>"Platform"</strong> refers to the website artswarit.com and all associated services, mobile applications, and APIs operated by Artswarit.</p>
                <p><strong>"Artist"</strong> refers to any individual or entity that registers on the Platform to offer creative services, upload artworks, or accept commissions.</p>
                <p><strong>"Client"</strong> refers to any individual or entity that registers on the Platform to browse, commission, or purchase creative services or artworks.</p>
                <p><strong>"User"</strong> refers collectively to Artists and Clients.</p>
                <p><strong>"Escrow Account"</strong> refers to the neutral payment holding mechanism through which all project milestone payments are processed.</p>
                <p><strong>"Milestone"</strong> refers to a discrete, agreed-upon deliverable within a project, with an associated payment amount.</p>
                <p><strong>"Platform Fee"</strong> refers to the service charge deducted by Artswarit from the artist's payout upon successful completion of a milestone.</p>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Digital Intermediary */}
          <Card className="mb-6 border-blue-200 dark:border-blue-900/40 shadow-md">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start gap-3 mb-4">
                <ShieldCheck className="h-5 w-5 text-blue-600 mt-1 shrink-0" />
                <div>
                  <h2 className="text-lg sm:text-xl font-black tracking-tight">2. Digital Intermediary Status</h2>
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mt-1">IT Act 2000 · IT Rules 2021 (Amended 2026) · RBI PA/PG Guidelines 2026</p>
                </div>
              </div>
              <div className="space-y-4 text-sm text-muted-foreground leading-relaxed pl-8">
                <p>
                  Artswarit operates as a <strong>digital intermediary</strong> as defined under Section 2(1)(w) of the Information Technology Act, 2000, and in compliance with the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021 (as amended through 2026).
                </p>
                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/30 space-y-2">
                  <p className="font-bold text-foreground text-sm">As an intermediary, Artswarit:</p>
                  <ul className="list-disc pl-5 space-y-1.5">
                    <li><strong>Does not own</strong> any artwork, content, or creative output listed on the Platform.</li>
                    <li><strong>Does not endorse</strong> the quality, originality, or legality of any individual artwork or service offered by Artists.</li>
                    <li><strong>Facilitates</strong> the technological infrastructure for discovery, communication, project management, and secure payment settlement between Artists and Clients.</li>
                    <li>Complies with all applicable <strong>RBI Master Directions on Payment Aggregators and Payment Gateways</strong> (updated 2026), including but not limited to KYC norms, settlement timelines, and fund-flow segregation.</li>
                    <li>Maintains a designated <strong>Grievance Officer / Nodal Contact Officer</strong> as required under Rule 3(2) and Rule 4 of the IT Rules 2021.</li>
                  </ul>
                </div>
                <p>
                  The relationship between the Artist and the Client is a <strong>direct contractual relationship</strong>. Artswarit acts solely as a facilitator and is not party to any agreement between the Artist and the Client regarding the scope, quality, or delivery of creative work.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Platform Fee */}
          <Card className="mb-6 border-emerald-200 dark:border-emerald-900/40 shadow-md">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start gap-3 mb-4">
                <CreditCard className="h-5 w-5 text-emerald-600 mt-1 shrink-0" />
                <div>
                  <h2 className="text-lg sm:text-xl font-black tracking-tight">3. Platform Fee Disclosure</h2>
                  <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mt-1">Mandatory Fee Transparency (RBI PA/PG 2026)</p>
                </div>
              </div>
              <div className="space-y-4 text-sm text-muted-foreground leading-relaxed pl-8">
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/30">
                  <p className="font-bold text-foreground text-base mb-2">Fee Structure:</p>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-emerald-200 dark:border-emerald-800/30">
                        <th className="py-2 text-left font-bold">Plan</th>
                        <th className="py-2 text-left font-bold">Platform Fee</th>
                        <th className="py-2 text-left font-bold">Artist Receives</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-emerald-100 dark:border-emerald-800/20">
                        <td className="py-2">Free Artist</td>
                        <td className="py-2 font-bold text-amber-600">15%</td>
                        <td className="py-2">85% of milestone amount</td>
                      </tr>
                      <tr>
                        <td className="py-2">Pro Artist (₹499/month)</td>
                        <td className="py-2 font-bold text-emerald-600">0%</td>
                        <td className="py-2">100% of milestone amount</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <ul className="list-disc pl-5 space-y-2">
                  <li>The Platform Fee is deducted <strong>at the point of artist payout</strong>, not at the point of client payment.</li>
                  <li>The exact Platform Fee amount and the artist's net payout are <strong>displayed to the Client before confirming payment</strong> for full transparency.</li>
                  <li>All payment processing is handled by our PCI-DSS Level 1 compliant payment partner (Razorpay). Artswarit does not store credit/debit card details.</li>
                  <li>GST and other applicable taxes, where required, are included in or added to the Platform Fee as per prevailing Indian tax law.</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Section 4: Escrow & Payment */}
          <Card className="mb-6 border-primary/10 shadow-md">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start gap-3 mb-4">
                <ShieldCheck className="h-5 w-5 text-primary mt-1 shrink-0" />
                <h2 className="text-lg sm:text-xl font-black tracking-tight">4. Escrow-Based Payment & Settlement</h2>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground leading-relaxed pl-8">
                <p>All project payments on Artswarit are processed through an <strong>escrow-based settlement model</strong>:</p>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Clients fund milestones in advance. Funds are <strong>held in a neutral escrow account</strong> and are not accessible to the Artist or Artswarit until the milestone is approved.</li>
                  <li>Upon milestone delivery, the Client has a <strong>48-hour dispute window</strong> to raise concerns.</li>
                  <li>If approved (or if no dispute is raised within 48 hours), funds are released to the Artist minus the applicable Platform Fee.</li>
                  <li>In case of a dispute, funds remain in escrow until the dispute is resolved per our <Link to="/refund-policy" className="text-primary font-semibold underline underline-offset-2">Refund Policy</Link>.</li>
                </ol>
                <p>
                  Artswarit complies with the RBI-mandated <strong>T+1 settlement timeline</strong> for payment aggregators. Once a milestone is approved, the artist payout is initiated within one business day.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Section 5: Content & Takedown */}
          <Card className="mb-6 border-red-200 dark:border-red-900/40 shadow-md">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start gap-3 mb-4">
                <Ban className="h-5 w-5 text-red-600 mt-1 shrink-0" />
                <div>
                  <h2 className="text-lg sm:text-xl font-black tracking-tight">5. Content Policy & Mandatory 3-Hour Takedown</h2>
                  <p className="text-xs font-bold text-red-600 uppercase tracking-widest mt-1">IT Rules 2021, Rule 3(1)(d) — As Amended 2026</p>
                </div>
              </div>
              <div className="space-y-4 text-sm text-muted-foreground leading-relaxed pl-8">
                <p>
                  In compliance with the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021 (as amended through 2026), Artswarit enforces a <strong>mandatory 3-hour takedown protocol</strong> for content meeting any of the following criteria:
                </p>
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 space-y-2">
                  <p className="font-bold text-foreground text-sm">Content subject to immediate takedown:</p>
                  <ul className="list-disc pl-5 space-y-1.5">
                    <li>Content depicting <strong>child sexual abuse material</strong> (CSAM) or any content sexualising minors.</li>
                    <li>Content that is <strong>obscene, defamatory, or incites violence</strong> against any individual or group.</li>
                    <li>Content that violates <strong>intellectual property rights</strong> with a valid complaint from the rights-holder.</li>
                    <li>Content <strong>ordered for removal by a court of competent jurisdiction</strong> or any government authority empowered under Indian law.</li>
                    <li>Content that threatens the <strong>sovereignty, integrity, or security of India</strong>.</li>
                    <li>Any content flagged by a <strong>government-authorised agency</strong> under the IT Act, 2000.</li>
                  </ul>
                </div>
                <p>
                  <strong>Reporting Mechanism:</strong> Any user or third party may report objectionable content by contacting our Grievance Officer at <a href="mailto:grievance@artswarit.com" className="text-primary font-semibold underline underline-offset-2">grievance@artswarit.com</a> or via the in-platform reporting tools. We acknowledge complaints within <strong>24 hours</strong> and resolve them within <strong>15 days</strong>, except for emergency takedowns (3 hours).
                </p>
                <p>
                  <strong>Proactive Monitoring:</strong> Artswarit uses AI-assisted content moderation to proactively detect and flag potentially violating content before it is published on the Platform.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Section 6: User Obligations */}
          <Card className="mb-6 border-primary/10 shadow-md">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start gap-3 mb-4">
                <Users className="h-5 w-5 text-primary mt-1 shrink-0" />
                <h2 className="text-lg sm:text-xl font-black tracking-tight">6. User Obligations & Acceptable Use</h2>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground leading-relaxed pl-8">
                <p>By using the Platform, you represent and warrant that:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>You are at least <strong>18 years of age</strong> or the age of majority in your jurisdiction, whichever is greater.</li>
                  <li>All information provided during registration is <strong>truthful, accurate, and current</strong>.</li>
                  <li>You will not use the Platform for any <strong>unlawful purpose</strong> or in a manner that could damage, disable, or impair the Platform.</li>
                  <li>Artists warrant that all uploaded content is <strong>original</strong> or that they hold valid licences to distribute it.</li>
                  <li>Clients agree to fund milestones in good faith and to provide <strong>timely feedback</strong> on deliverables.</li>
                  <li>Neither party will attempt to circumvent the Platform's payment system by <strong>transacting directly</strong> outside the Platform for services discovered through Artswarit.</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Section 7: IP */}
          <Card className="mb-6 border-primary/10 shadow-md">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start gap-3 mb-4">
                <FileText className="h-5 w-5 text-primary mt-1 shrink-0" />
                <h2 className="text-lg sm:text-xl font-black tracking-tight">7. Intellectual Property Rights</h2>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground leading-relaxed pl-8">
                <p>
                  <strong>Artist IP:</strong> Artists retain full ownership of their original creative works. By uploading content to the Platform, Artists grant Artswarit a non-exclusive, worldwide, royalty-free licence to display, promote, and distribute the content solely for the purpose of operating and marketing the Platform.
                </p>
                <p>
                  <strong>Client IP:</strong> Upon full payment and approval of a commissioned work, the intellectual property rights in the deliverable transfer to the Client unless otherwise agreed in writing between the Artist and Client.
                </p>
                <p>
                  <strong>Platform IP:</strong> The Artswarit name, logo, design elements, underlying technology, and all proprietary content are the exclusive intellectual property of Ashwareet Basu / Artswarit.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Section 8: Limitation of Liability */}
          <Card className="mb-6 border-primary/10 shadow-md">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start gap-3 mb-4">
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-1 shrink-0" />
                <h2 className="text-lg sm:text-xl font-black tracking-tight">8. Limitation of Liability</h2>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground leading-relaxed pl-8">
                <p>
                  To the maximum extent permitted by applicable Indian law:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Artswarit shall not be liable for any <strong>indirect, incidental, special, consequential, or punitive damages</strong> arising from the use of the Platform.</li>
                  <li>Artswarit's total aggregate liability for any claim shall not exceed the <strong>total Platform Fees collected from the claiming party in the 12 months preceding the claim</strong>.</li>
                  <li>Artswarit is not responsible for disputes between Artists and Clients regarding the <strong>quality, originality, or fitness-for-purpose</strong> of creative work, except to the extent of facilitating the escrow-based dispute resolution process.</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Section 9: Termination */}
          <Card className="mb-6 border-primary/10 shadow-md">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start gap-3 mb-4">
                <Ban className="h-5 w-5 text-primary mt-1 shrink-0" />
                <h2 className="text-lg sm:text-xl font-black tracking-tight">9. Account Termination</h2>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground leading-relaxed pl-8">
                <p>
                  Artswarit reserves the right to suspend or terminate any User account, with or without notice, if the User violates these Terms, engages in fraudulent activity, or if required to do so by law or regulatory directive.
                </p>
                <p>
                  Upon termination: (a) any pending escrow balances will be settled per the applicable <Link to="/refund-policy" className="text-primary font-semibold underline underline-offset-2">Refund Policy</Link>; (b) the User's content may be removed from the Platform; and (c) the User's right to access the Platform ceases immediately.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Section 10: Governing Law */}
          <Card className="mb-6 border-primary/10 shadow-md">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start gap-3 mb-4">
                <Globe className="h-5 w-5 text-primary mt-1 shrink-0" />
                <h2 className="text-lg sm:text-xl font-black tracking-tight">10. Governing Law & Dispute Resolution</h2>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground leading-relaxed pl-8">
                <p>
                  These Terms shall be governed by and construed in accordance with the <strong>laws of India</strong>. Any disputes arising from or in connection with these Terms shall be subject to the exclusive jurisdiction of the <strong>courts of New Delhi, India</strong>.
                </p>
                <p>
                  Before initiating formal legal proceedings, both parties agree to attempt resolution through Artswarit's internal dispute resolution process and the Grievance Officer mechanism outlined in our <Link to="/contact-us" className="text-primary font-semibold underline underline-offset-2">Contact & Grievance Redressal</Link> page.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Section 11: Modifications */}
          <Card className="mb-6 border-primary/10 shadow-md">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start gap-3 mb-4">
                <Clock className="h-5 w-5 text-primary mt-1 shrink-0" />
                <h2 className="text-lg sm:text-xl font-black tracking-tight">11. Modifications to These Terms</h2>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground leading-relaxed pl-8">
                <p>
                  Artswarit reserves the right to modify these Terms at any time. Material changes will be notified to registered Users via email and/or a prominent notice on the Platform at least <strong>30 days before</strong> the changes take effect. Continued use of the Platform after the effective date constitutes acceptance of the modified Terms.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Footer Note */}
          <div className="text-center space-y-3 pt-4">
            <p className="text-sm text-muted-foreground">
              For questions, clarifications, or complaints regarding these Terms, please contact our Nodal Officer via the <Link to="/contact-us" className="text-primary font-semibold underline underline-offset-2">Contact & Grievance Redressal</Link> page.
            </p>
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

export default TermsOfService;
