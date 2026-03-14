
import { Link } from "react-router-dom";

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-gradient-to-br from-violet-950 via-indigo-950 to-purple-950 text-white/90 border-t border-white/5 relative overflow-hidden pb-[var(--safe-bottom)]">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/20 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-12 lg:gap-8 text-center sm:text-left">
          {/* Brand Section */}
          <div className="space-y-6 flex flex-col items-center sm:items-start">
            <button 
              onClick={scrollToTop} 
              className="flex items-center group transition-all duration-300"
            >
              <span className="font-heading font-black text-2xl tracking-tighter text-white group-hover:text-primary transition-colors">
                ARTSWARIT
              </span>
            </button>
            <p className="text-sm leading-relaxed text-white/60 max-w-xs font-medium">
              The premier digital destination for artists to showcase, monetize, and scale their creative careers globally.
            </p>
            {/* Social Icons */}
            <div className="flex items-center space-x-4">
              <a 
                href="https://twitter.com/artswarit" 
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-white/60 hover:bg-primary hover:text-white transition-all duration-300" 
                aria-label="Twitter"
                target="_blank" 
                rel="noopener noreferrer"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a 
                href="https://instagram.com/artswarit" 
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-white/60 hover:bg-primary hover:text-white transition-all duration-300" 
                aria-label="Instagram"
                target="_blank" 
                rel="noopener noreferrer"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
              <a 
                href="https://www.linkedin.com/company/artswarit" 
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-white/60 hover:bg-primary hover:text-white transition-all duration-300" 
                aria-label="LinkedIn"
                target="_blank" 
                rel="noopener noreferrer"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* For Artists */}
          <div className="space-y-4 sm:space-y-5">
            <h3 className="font-heading text-xs sm:text-sm font-bold uppercase tracking-widest text-white/40">For Artists</h3>
            <ul className="space-y-1 sm:space-y-3">
              <li>
                <Link to="/signup" className="text-[15px] text-white/70 hover:text-white hover:translate-x-1 inline-block transition-all duration-200 py-2 sm:py-1">
                  Join as Artist
                </Link>
              </li>
              <li>
                <Link to="/artist-dashboard" className="text-[15px] text-white/70 hover:text-white hover:translate-x-1 inline-block transition-all duration-200 py-2 sm:py-1">
                  Artist Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* For Clients */}
          <div className="space-y-4 sm:space-y-5">
            <h3 className="font-heading text-xs sm:text-sm font-bold uppercase tracking-widest text-white/40">For Clients</h3>
            <ul className="space-y-1 sm:space-y-3">
              <li>
                <Link to="/explore" className="text-[15px] text-white/70 hover:text-white hover:translate-x-1 inline-block transition-all duration-200 py-2 sm:py-1">
                  Find Artists
                </Link>
              </li>
              <li>
                <Link to="/categories" className="text-[15px] text-white/70 hover:text-white hover:translate-x-1 inline-block transition-all duration-200 py-2 sm:py-1">
                  Categories
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Policies */}
          <div className="space-y-4 sm:space-y-5">
            <h3 className="font-heading text-xs sm:text-sm font-bold uppercase tracking-widest text-white/40">Legal & Policies</h3>
            <ul className="space-y-1 sm:space-y-3">
              <li>
                <Link to="/about-us" className="text-[15px] text-white/70 hover:text-white hover:translate-x-1 inline-block transition-all duration-200 py-2 sm:py-1">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/terms-of-service" className="text-[15px] text-white/70 hover:text-white hover:translate-x-1 inline-block transition-all duration-200 py-2 sm:py-1">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="text-[15px] text-white/70 hover:text-white hover:translate-x-1 inline-block transition-all duration-200 py-2 sm:py-1">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/refund-policy" className="text-[15px] text-white/70 hover:text-white hover:translate-x-1 inline-block transition-all duration-200 py-2 sm:py-1">
                  Refund & Cancellation
                </Link>
              </li>
              <li>
                <Link to="/contact-us" className="text-[15px] text-white/70 hover:text-white hover:translate-x-1 inline-block transition-all duration-200 py-2 sm:py-1">
                  Contact & Grievance
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* ─── RBI 2026 Mandatory Legal Disclosure Strip ─── */}
        <div className="mt-12 sm:mt-16 pt-8 border-t border-white/10 space-y-6">

          {/* Legal Entity & Address Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
            {/* Legal Entity */}
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Legal Entity</p>
              <p className="text-sm font-bold text-white/80">Artswarit</p>
              <p className="text-xs text-white/50">Sole Proprietorship of <span className="text-white/70 font-semibold">Ashwareet Basu</span></p>
            </div>

            {/* Registered Office */}
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Registered Office</p>
              <p className="text-xs text-white/50 leading-relaxed">
                Bairiya Bazar, Turkaulia,<br />
                Purbi Champaran, Bihar — 845437, India
              </p>
            </div>

            {/* Operations Hub */}
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Operations Hub</p>
              <p className="text-xs text-white/50 leading-relaxed">
                Kalkaji, New Delhi — 110019, India
              </p>
            </div>
          </div>

          {/* Grievance & Payment Aggregator Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
            {/* Nodal / Grievance Officer */}
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Nodal / Grievance Officer</p>
              <p className="text-xs text-white/70 font-semibold">Ashwareet Basu</p>
              <p className="text-xs text-white/50">
                <a href="mailto:grievance@artswarit.com" className="hover:text-primary transition-colors underline underline-offset-2">
                  grievance@artswarit.com
                </a>
              </p>
              <p className="text-[10px] text-white/30">
                Acknowledgement within 24 hrs · Resolution within 15 days
              </p>
            </div>

            {/* Payment Aggregator */}
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Payment Partner</p>
              <p className="text-xs text-white/70 font-semibold">Razorpay Software Pvt. Ltd.</p>
              <p className="text-[10px] text-white/40 leading-relaxed">
                PCI-DSS Level 1 Compliant · RBI Authorised PA<br />
                All payments processed in INR via escrow settlement
              </p>
            </div>

            {/* Compliance Badges */}
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Compliance</p>
              <div className="flex flex-wrap gap-1.5 justify-center md:justify-start">
                <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full bg-white/5 text-white/50 border border-white/10">
                  RBI PA/PG 2026
                </span>
                <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full bg-white/5 text-white/50 border border-white/10">
                  IT Act 2000
                </span>
                <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full bg-white/5 text-white/50 border border-white/10">
                  DPDP 2023
                </span>
                <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full bg-white/5 text-white/50 border border-white/10">
                  IT Rules 2021
                </span>
              </div>
            </div>
          </div>

          {/* Merchant Policy Links — RBI 2026 Mandate */}
          <div className="pt-4 border-t border-white/5">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-white/40">
                <Link to="/terms-of-service" className="hover:text-white/70 transition-colors underline underline-offset-2">Terms of Service</Link>
                <span className="text-white/15">|</span>
                <Link to="/privacy-policy" className="hover:text-white/70 transition-colors underline underline-offset-2">Privacy Policy</Link>
                <span className="text-white/15">|</span>
                <Link to="/refund-policy" className="hover:text-white/70 transition-colors underline underline-offset-2">Refund & Cancellation</Link>
                <span className="text-white/15">|</span>
                <Link to="/contact-us" className="hover:text-white/70 transition-colors underline underline-offset-2">Grievance Redressal</Link>
                <span className="text-white/15">|</span>
                <a href="mailto:support@artswarit.com" className="hover:text-white/70 transition-colors underline underline-offset-2">support@artswarit.com</a>
              </div>
              <p className="text-[11px] font-medium text-white/30 text-center sm:text-right whitespace-nowrap">
                © {new Date().getFullYear()} Artswarit · All rights reserved.
              </p>
            </div>
          </div>

          {/* Fine print — Intermediary Disclaimer */}
          <p className="text-[10px] text-white/25 text-center leading-relaxed max-w-3xl mx-auto">
            Artswarit is a digital intermediary under Section 2(1)(w) of the Information Technology Act, 2000. 
            We do not own, produce, or endorse any artwork or creative content listed on this platform. 
            All payments are held in escrow and settled per RBI Master Directions on Payment Aggregators (2026). 
            Platform fee: 15% (Free plan) / 0% (Pro plan). 
            Registered under the Sole Proprietorship of Ashwareet Basu.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
