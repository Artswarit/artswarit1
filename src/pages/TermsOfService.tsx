
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';

const TermsOfService = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 pt-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
            <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          <Card className="mb-8">
            <CardContent className="p-6 space-y-6">
              <section>
                <h2 className="text-2xl font-bold text-purple-600 mb-4">1. Acceptance of Terms</h2>
                <p className="text-gray-700">
                  By accessing and using Artswarit, you accept and agree to be bound by the terms and provision of this agreement.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-purple-600 mb-4">2. Use License</h2>
                <div className="space-y-3 text-gray-700">
                  <p>Permission is granted to temporarily use Artswarit for personal, non-commercial transitory viewing only. This includes:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Creating artist profiles and showcasing artwork</li>
                    <li>Browsing and discovering creative content</li>
                    <li>Engaging with the artist community</li>
                    <li>Purchasing artwork and commissioning services</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-purple-600 mb-4">3. User Responsibilities</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Provide accurate and truthful information</li>
                  <li>Respect intellectual property rights</li>
                  <li>Upload only original content or content you have rights to</li>
                  <li>Maintain appropriate and respectful communication</li>
                  <li>Comply with all applicable laws and regulations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-purple-600 mb-4">4. Content Guidelines</h2>
                <div className="space-y-3 text-gray-700">
                  <p>All content uploaded to Artswarit must:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Be original work or properly licensed</li>
                    <li>Not contain offensive, harmful, or illegal material</li>
                    <li>Respect copyright and intellectual property laws</li>
                    <li>Comply with community standards</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-purple-600 mb-4">5. Payment and Transactions</h2>
                <div className="space-y-3 text-gray-700">
                  <p>For commercial transactions on our platform:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>All prices are clearly displayed before purchase</li>
                    <li>Payment processing is handled securely</li>
                    <li>Artists retain rights to their original work</li>
                    <li>Refund policies are clearly stated</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-purple-600 mb-4">6. Limitation of Liability</h2>
                <p className="text-gray-700">
                  Artswarit shall not be liable for any damages that may occur from the use of our platform, 
                  including but not limited to direct, indirect, incidental, punitive, and consequential damages.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-purple-600 mb-4">7. Termination</h2>
                <p className="text-gray-700">
                  We reserve the right to terminate accounts that violate these terms of service or engage in 
                  behavior that is harmful to the community.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-purple-600 mb-4">8. Contact Information</h2>
                <p className="text-gray-700">
                  For questions regarding these Terms of Service, please contact us at legal@artswarit.com
                </p>
              </section>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TermsOfService;
