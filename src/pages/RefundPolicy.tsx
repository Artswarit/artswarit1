import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { RotateCcw, Shield, Clock, CreditCard, AlertCircle, Scale, HelpCircle, Ban } from 'lucide-react';
import { Link } from 'react-router-dom';

const RefundPolicy = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-purple-50 dark:from-background dark:via-background dark:to-background">
      <Navbar />

      <main className="flex-1 pt-20 sm:pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">

          {/* Hero */}
          <div className="text-center mb-12 sm:mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest mb-2">
              <RotateCcw className="h-4 w-4" />
              Escrow-Protected Refunds
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent leading-tight">
              Refund & Cancellation Policy
            </h1>
            <p className="text-sm text-muted-foreground">
              <strong>Effective Date:</strong> 1st March, 2026 · <strong>Last Updated:</strong> 27th February, 2026
            </p>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              All refunds on Artswarit are processed in accordance with the Reserve Bank of India's Master Directions on Payment Aggregators (2026), including the mandatory Source-to-Source refund rule.
            </p>
          </div>

          {/* Key Principle */}
          <Card className="mb-8 border-emerald-200 dark:border-emerald-900/40 shadow-lg overflow-hidden">
            <CardContent className="p-6 sm:p-10">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 shrink-0">
                  <Shield className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight mb-1">The Core Principle: Escrow Protection</h2>
                  <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Your Money is Protected From Day One</p>
                </div>
              </div>
              <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                <p>
                  When you fund a milestone on Artswarit, your payment is <strong>not transferred to the artist immediately</strong>. Instead, it is held in a <strong>neutral escrow account</strong> managed through our PCI-DSS Level 1 compliant payment partner (Razorpay).
                </p>
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/30">
                  <p className="font-bold text-foreground text-sm mb-2">Funds are released to the Artist ONLY when:</p>
                  <ul className="list-disc pl-5 space-y-1.5">
                    <li>The Client explicitly <strong>approves the milestone deliverable</strong>, OR</li>
                    <li>The <strong>48-hour dispute window</strong> expires without any dispute being raised by the Client.</li>
                  </ul>
                </div>
                <p>
                  This means that at every stage of a project, your money is either <strong>in your hands</strong>, <strong>safely in escrow</strong>, or <strong>released to the artist with your explicit or implicit approval</strong>.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Source-to-Source Refund */}
          <Card className="mb-6 border-blue-200 dark:border-blue-900/40 shadow-md">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start gap-3 mb-4">
                <CreditCard className="h-5 w-5 text-blue-600 mt-1 shrink-0" />
                <div>
                  <h2 className="text-lg sm:text-xl font-black tracking-tight">1. Source-to-Source Refund Rule</h2>
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mt-1">RBI Master Directions on PA/PG, 2026</p>
                </div>
              </div>
              <div className="space-y-4 text-sm text-muted-foreground leading-relaxed pl-8">
                <p>
                  In compliance with the Reserve Bank of India's <strong>Source-to-Source refund mandate</strong>, all refunds on Artswarit are processed back to the <strong>original payment instrument</strong> used by the Client:
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-blue-200 dark:border-blue-800/30 bg-blue-50 dark:bg-blue-950/20">
                        <th className="py-3 px-4 text-left font-bold text-foreground">Payment Method</th>
                        <th className="py-3 px-4 text-left font-bold text-foreground">Refund Destination</th>
                        <th className="py-3 px-4 text-left font-bold text-foreground">Timeline</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-blue-100 dark:border-blue-800/20">
                        <td className="py-3 px-4">Credit Card</td>
                        <td className="py-3 px-4">Same credit card</td>
                        <td className="py-3 px-4">5–7 business days</td>
                      </tr>
                      <tr className="border-b border-blue-100 dark:border-blue-800/20">
                        <td className="py-3 px-4">Debit Card</td>
                        <td className="py-3 px-4">Same bank account linked to card</td>
                        <td className="py-3 px-4">5–7 business days</td>
                      </tr>
                      <tr className="border-b border-blue-100 dark:border-blue-800/20">
                        <td className="py-3 px-4">UPI</td>
                        <td className="py-3 px-4">Same UPI-linked bank account</td>
                        <td className="py-3 px-4">1–3 business days</td>
                      </tr>
                      <tr className="border-b border-blue-100 dark:border-blue-800/20">
                        <td className="py-3 px-4">Net Banking</td>
                        <td className="py-3 px-4">Same bank account</td>
                        <td className="py-3 px-4">3–5 business days</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4">Wallet (if applicable)</td>
                        <td className="py-3 px-4">Same wallet</td>
                        <td className="py-3 px-4">1–2 business days</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-xs italic">
                  Note: Refund processing times depend on the payment instrument issuer (bank/card network). Artswarit initiates refunds within 24 hours of approval; the actual credit to the Customer's account is subject to the issuer's processing timeline.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 48-Hour Dispute Window */}
          <Card className="mb-6 border-amber-200 dark:border-amber-900/40 shadow-md">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start gap-3 mb-4">
                <Clock className="h-5 w-5 text-amber-600 mt-1 shrink-0" />
                <h2 className="text-lg sm:text-xl font-black tracking-tight">2. The 48-Hour Dispute Window</h2>
              </div>
              <div className="space-y-4 text-sm text-muted-foreground leading-relaxed pl-8">
                <p>
                  Every milestone on Artswarit includes a built-in <strong>48-hour dispute window</strong> that begins from the moment the Artist submits the milestone deliverable:
                </p>
                <ol className="list-decimal pl-5 space-y-2">
                  <li><strong>Artist submits milestone</strong> — delivers the agreed work via the Platform.</li>
                  <li><strong>Client is notified</strong> — receives an email and in-app notification to review the deliverable.</li>
                  <li><strong>48-hour window begins</strong> — the Client may:
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                      <li><strong>Approve</strong> — funds are released to the Artist immediately.</li>
                      <li><strong>Request Revision</strong> — Artist is notified; funds remain in escrow.</li>
                      <li><strong>Raise a Dispute</strong> — the matter is escalated; funds remain in escrow until resolved.</li>
                    </ul>
                  </li>
                  <li><strong>Window expires without action</strong> — funds are <strong>automatically released</strong> to the Artist. This auto-release protects Artists from indefinite payment holds.</li>
                </ol>
              </div>
            </CardContent>
          </Card>

          {/* When Refunds Are Issued */}
          <Card className="mb-6 border-primary/10 shadow-md">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start gap-3 mb-4">
                <RotateCcw className="h-5 w-5 text-primary mt-1 shrink-0" />
                <h2 className="text-lg sm:text-xl font-black tracking-tight">3. When Refunds Are Issued</h2>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground leading-relaxed pl-8">
                <p>A full or partial refund may be issued in the following scenarios:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Milestone not started:</strong> If the Artist has not begun work on a funded milestone, the Client may request a full refund. Approved within 24 hours.</li>
                  <li><strong>Dispute resolved in favour of Client:</strong> If a dispute is raised and resolved in the Client's favour (e.g., non-delivery, material breach of scope), a full refund of the disputed milestone amount is issued.</li>
                  <li><strong>Project cancellation by mutual consent:</strong> If both the Artist and Client agree to cancel a project, unfunded milestones are cancelled and funded-but-incomplete milestones are refunded to the Client.</li>
                  <li><strong>Artist account termination:</strong> If an Artist's account is terminated by Artswarit (e.g., for policy violation), all pending escrow balances for that Artist's projects are refunded to the respective Clients.</li>
                  <li><strong>Payment processing error:</strong> If a duplicate payment or incorrect amount is captured due to a technical error, the excess amount is refunded automatically.</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* When Refunds Are NOT Issued */}
          <Card className="mb-6 border-red-200 dark:border-red-900/40 shadow-md">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start gap-3 mb-4">
                <Ban className="h-5 w-5 text-red-600 mt-1 shrink-0" />
                <h2 className="text-lg sm:text-xl font-black tracking-tight">4. When Refunds Are NOT Issued</h2>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground leading-relaxed pl-8">
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Approved milestones:</strong> Once a Client approves a milestone (or the 48-hour window expires without dispute), the funds are considered earned by the Artist and are no longer refundable.</li>
                  <li><strong>Subjective dissatisfaction:</strong> "I changed my mind" or "I don't like the style" is not grounds for a refund if the deliverable meets the agreed-upon scope.</li>
                  <li><strong>Platform Fee:</strong> The Platform Fee deducted from an artist payout is non-refundable.</li>
                  <li><strong>Pro subscription:</strong> Monthly Pro subscription charges (₹499/month) are non-refundable once the billing cycle has begun, except as required by applicable law.</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Dispute Resolution */}
          <Card className="mb-6 border-primary/10 shadow-md">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start gap-3 mb-4">
                <Scale className="h-5 w-5 text-primary mt-1 shrink-0" />
                <h2 className="text-lg sm:text-xl font-black tracking-tight">5. Dispute Resolution Process</h2>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground leading-relaxed pl-8">
                <ol className="list-decimal pl-5 space-y-2">
                  <li><strong>Client raises a dispute</strong> within the 48-hour window via the project dashboard.</li>
                  <li><strong>Both parties submit evidence</strong> — the Client explains the issue; the Artist responds with supporting documentation.</li>
                  <li><strong>Artswarit mediates</strong> — our team reviews the evidence and the original project scope within <strong>7 business days</strong>.</li>
                  <li><strong>Resolution:</strong>
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                      <li><strong>Full refund</strong> to Client (if Artist failed to deliver per scope).</li>
                      <li><strong>Partial refund</strong> (if deliverable partially meets scope).</li>
                      <li><strong>Funds released to Artist</strong> (if deliverable meets scope; dispute dismissed).</li>
                    </ul>
                  </li>
                </ol>
                <p>
                  If either party is dissatisfied with the resolution, they may escalate to the <strong>Grievance Officer</strong> via our <Link to="/contact-us" className="text-primary font-semibold underline underline-offset-2">Contact & Grievance Redressal</Link> page.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* How to Request */}
          <Card className="mb-6 border-primary/10 shadow-md">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start gap-3 mb-4">
                <HelpCircle className="h-5 w-5 text-primary mt-1 shrink-0" />
                <h2 className="text-lg sm:text-xl font-black tracking-tight">6. How to Request a Refund</h2>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground leading-relaxed pl-8">
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Navigate to the project in your <strong>Client Dashboard</strong>.</li>
                  <li>Click on the relevant milestone and select <strong>"Raise Dispute"</strong> or <strong>"Request Cancellation"</strong>.</li>
                  <li>Provide a clear description of the issue and any supporting evidence.</li>
                  <li>Our team will review and respond within <strong>24–48 hours</strong>.</li>
                </ol>
                <p>
                  Alternatively, you may email <a href="mailto:support@artswarit.com" className="text-primary font-semibold underline underline-offset-2">support@artswarit.com</a> with your project ID, milestone ID, and a description of the issue.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Chargebacks */}
          <Card className="mb-6 border-amber-200 dark:border-amber-900/40 shadow-md">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start gap-3 mb-4">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-1 shrink-0" />
                <h2 className="text-lg sm:text-xl font-black tracking-tight">7. Chargebacks</h2>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground leading-relaxed pl-8">
                <p>
                  We strongly encourage Clients to use Artswarit's built-in dispute and refund process before initiating a chargeback with their bank or card issuer. Filing a chargeback without first attempting resolution through the Platform may result in suspension of your Artswarit account pending investigation.
                </p>
                <p>
                  In the event of a chargeback, Artswarit will cooperate with the payment processor and provide all relevant transaction documentation as required.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center space-y-3 pt-4">
            <p className="text-sm text-muted-foreground">
              For refund-related queries, please contact <a href="mailto:support@artswarit.com" className="text-primary font-semibold underline underline-offset-2">support@artswarit.com</a> or visit our <Link to="/contact-us" className="text-primary font-semibold underline underline-offset-2">Contact & Grievance Redressal</Link> page.
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

export default RefundPolicy;
