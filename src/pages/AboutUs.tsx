import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Users, Globe, Scale, Building2, Heart, Landmark, BadgeCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const AboutUs = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-purple-50 dark:from-background dark:via-background dark:to-background">
      <Navbar />

      <main className="flex-1 pt-20 sm:pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">

          {/* Hero */}
          <div className="text-center mb-12 sm:mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-2">
              <Shield className="h-4 w-4" />
              RBI 2026 Compliant Marketplace
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight bg-gradient-to-r from-primary via-purple-600 to-indigo-600 bg-clip-text text-transparent leading-tight">
              About Artswarit
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              India's trust-first digital marketplace connecting global artists with clients worldwide — built on escrow-secured payments and complete transparency.
            </p>
          </div>

          {/* Mission */}
          <Card className="mb-8 border-primary/10 shadow-lg overflow-hidden">
            <CardContent className="p-6 sm:p-10">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 rounded-2xl bg-primary/10 shrink-0">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight mb-3">Our Mission</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Artswarit is an initiative by <strong>Ashwareet Basu</strong> (Sole Proprietor) to bridge the gap between global artists and clients across the world. We believe that every artist — regardless of geography, language, or background — deserves a secure, transparent, and fair platform to monetise their creative talent.
                  </p>
                </div>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Founded with the vision of democratising art commerce in India and beyond, Artswarit operates as a <strong>digital intermediary and marketplace</strong>. We do not own, produce, or stock any artworks. We facilitate the discovery, negotiation, and secure settlement of creative projects between independent artists and their clients.
              </p>
            </CardContent>
          </Card>

          {/* Escrow-First Model */}
          <Card className="mb-8 border-emerald-200 dark:border-emerald-900/40 shadow-lg overflow-hidden">
            <CardContent className="p-6 sm:p-10">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 shrink-0">
                  <Landmark className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight mb-1">The Escrow-First Model</h2>
                  <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Your Money, Safely Held</p>
                </div>
              </div>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  At the heart of Artswarit's trust architecture is our <strong>Escrow-First Payment Model</strong>. Every transaction on our platform follows a rigorous, RBI-compliant fund-flow:
                </p>
                <ol className="list-decimal pl-6 space-y-2">
                  <li>
                    <strong>Client Funds a Milestone</strong> — Payment is captured via our PCI-DSS compliant payment gateway (Razorpay) and held in a <strong>neutral escrow account</strong>. At no point does Artswarit take ownership of these funds.
                  </li>
                  <li>
                    <strong>Artist Delivers Work</strong> — The artist completes the agreed milestone and submits deliverables on the platform for client review.
                  </li>
                  <li>
                    <strong>Client Approves or Disputes</strong> — The client has a <strong>48-hour dispute window</strong> to review the work. If approved (or if no dispute is raised within 48 hours), funds are released to the artist.
                  </li>
                  <li>
                    <strong>Transparent Fee Deduction</strong> — A flat <strong>15% platform fee</strong> is deducted at the point of artist payout (0% for Pro subscribers). The artist payout amount is clearly displayed before the client confirms payment.
                  </li>
                </ol>
                <p className="text-sm border-l-4 border-emerald-400 pl-4 py-2 bg-emerald-50 dark:bg-emerald-950/20 rounded-r-lg">
                  <strong>Regulatory Note:</strong> This model is designed to comply with the Reserve Bank of India's Master Directions on Payment Aggregators (updated 2026), including the requirement that intermediary platforms must not hold customer funds beyond the prescribed settlement timeline.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Our Role as a Digital Intermediary */}
          <Card className="mb-8 border-primary/10 shadow-lg overflow-hidden">
            <CardContent className="p-6 sm:p-10">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 rounded-2xl bg-blue-100 dark:bg-blue-900/30 shrink-0">
                  <Scale className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight mb-1">Digital Intermediary — Not a Seller</h2>
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">IT Act 2000 · IT Rules 2021 (Amended 2026)</p>
                </div>
              </div>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Artswarit operates as a <strong>digital intermediary</strong> within the meaning of Section 2(1)(w) of the Information Technology Act, 2000, and the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021 (as amended through 2026).
                </p>
                <p>
                  <strong>What this means for you:</strong>
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>We <strong>do not own, curate, or endorse</strong> any artwork listed on the platform. All content is created and owned by independent artists.</li>
                  <li>We provide the <strong>technology infrastructure</strong> for discovery, communication, project management, and secure payment settlement.</li>
                  <li>We exercise <strong>due diligence</strong> in moderating content and comply with the mandatory 3-hour takedown protocol for content that is flagged as unlawful under applicable Indian law.</li>
                  <li>We maintain a designated <strong>Grievance Officer</strong> (also the Nodal Contact Officer) as required under the IT Rules 2021.</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Values Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <Card className="border-primary/10 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6 space-y-3">
                <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-900/30 w-fit">
                  <BadgeCheck className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="font-black text-lg">Trust & Verification</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Every artist on Artswarit goes through a profile verification process. Our AI-assisted content moderation ensures that only original, legitimate work is showcased on the platform.
                </p>
              </CardContent>
            </Card>
            <Card className="border-primary/10 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6 space-y-3">
                <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-900/30 w-fit">
                  <Shield className="h-5 w-5 text-amber-600" />
                </div>
                <h3 className="font-black text-lg">Data Protection</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Your personal data is processed in accordance with the Digital Personal Data Protection Act, 2023 and our comprehensive <Link to="/privacy-policy" className="text-primary underline underline-offset-2 font-semibold">Privacy Policy</Link>. We collect only what is necessary and never sell your data.
                </p>
              </CardContent>
            </Card>
            <Card className="border-primary/10 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6 space-y-3">
                <div className="p-2.5 rounded-xl bg-green-100 dark:bg-green-900/30 w-fit">
                  <Globe className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="font-black text-lg">Global Access, Indian Roots</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  While Artswarit is headquartered in India and fully compliant with Indian regulations, our platform is open to artists and clients from around the world. Payments are processed in INR with transparent conversion rates.
                </p>
              </CardContent>
            </Card>
            <Card className="border-primary/10 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6 space-y-3">
                <div className="p-2.5 rounded-xl bg-rose-100 dark:bg-rose-900/30 w-fit">
                  <Users className="h-5 w-5 text-rose-600" />
                </div>
                <h3 className="font-black text-lg">Fair Pricing</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Artists set their own prices. Our flat 15% platform fee (0% for Pro subscribers) is disclosed upfront — no hidden charges, no surprises. See our full <Link to="/terms-of-service" className="text-primary underline underline-offset-2 font-semibold">Terms of Service</Link> for details.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Entity Information */}
          <Card className="mb-8 border-primary/10 shadow-lg overflow-hidden">
            <CardContent className="p-6 sm:p-10">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 shrink-0">
                  <Building2 className="h-6 w-6 text-indigo-600" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight">Entity & Office Information</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-5 rounded-2xl bg-muted/40 border border-border/50 space-y-2">
                  <p className="text-xs font-bold text-primary uppercase tracking-widest">Sole Proprietor</p>
                  <p className="font-bold text-lg">Ashwareet Basu</p>
                  <p className="text-sm text-muted-foreground">Proprietor, Artswarit</p>
                </div>
                <div className="p-5 rounded-2xl bg-muted/40 border border-border/50 space-y-2">
                  <p className="text-xs font-bold text-primary uppercase tracking-widest">Registered Office</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Bairiya Bazar, Turkaulia,<br />
                    Purbi Champaran, Bihar — 845437<br />
                    India
                  </p>
                </div>
                <div className="p-5 rounded-2xl bg-muted/40 border border-border/50 space-y-2">
                  <p className="text-xs font-bold text-primary uppercase tracking-widest">Operations Hub</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Kalkaji, New Delhi — 110019<br />
                    India
                  </p>
                </div>
                <div className="p-5 rounded-2xl bg-muted/40 border border-border/50 space-y-2">
                  <p className="text-xs font-bold text-primary uppercase tracking-widest">Contact</p>
                  <p className="text-sm text-muted-foreground">
                    <a href="mailto:support@artswarit.com" className="text-primary hover:underline font-semibold">support@artswarit.com</a>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <Link to="/contact-us" className="text-primary hover:underline font-semibold">Grievance Redressal →</Link>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <div className="text-center space-y-4 pt-4">
            <p className="text-sm text-muted-foreground max-w-lg mx-auto">
              Have questions about our compliance or how your money is protected? Reach out to our Nodal Officer via our <Link to="/contact-us" className="text-primary font-semibold underline underline-offset-2">Contact & Grievance Redressal</Link> page.
            </p>
            <p className="text-xs text-muted-foreground/60">
              Last updated: 27th February, 2026 · Effective from: 1st March, 2026
            </p>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AboutUs;