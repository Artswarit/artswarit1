import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
const TermsOfService = () => {
  return <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50">
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
                <div className="space-y-3 text-gray-700">
                  <p>
                    By accessing, browsing, or using the Artswarit platform ("Service"), you acknowledge that you have read, 
                    understood, and agree to be bound by these Terms of Service ("Terms") and our Privacy Policy. If you do not 
                    agree to these Terms, please do not use our Service.
                  </p>
                  <p>
                    These Terms constitute a legally binding agreement between you and Artswarit. By creating an account or using 
                    our services, you confirm that you are at least 18 years old or have parental consent to use our platform.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-purple-600 mb-4">2. Service Description</h2>
                <div className="space-y-3 text-gray-700">
                  <p>Artswarit is a digital platform that enables artists to:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Create professional artist profiles and portfolios</li>
                    <li>Upload, showcase, and sell original artwork</li>
                    <li>Connect with clients and other artists worldwide</li>
                    <li>Participate in live streaming and community features</li>
                    <li>Access AI-powered tools and recommendations</li>
                    <li>Manage commissions and transactions</li>
                    <li>Engage in educational and promotional activities</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-purple-600 mb-4">3. Account Registration and Security</h2>
                <div className="space-y-3 text-gray-700">
                  <p>To access certain features, you must create an account by providing accurate and complete information. You agree to:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Provide truthful, accurate, and complete registration information</li>
                    <li>Maintain and update your information to keep it current</li>
                    <li>Keep your login credentials secure and confidential</li>
                    <li>Notify us immediately of any unauthorized use of your account</li>
                    <li>Accept responsibility for all activities under your account</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-purple-600 mb-4">4. User Conduct and Responsibilities</h2>
                <div className="space-y-4 text-gray-700">
                  <p>You agree to use our platform responsibly and in compliance with these Terms. You must:</p>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900">Content Standards:</h3>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Upload only original content or content you have legal rights to use</li>
                      <li>Ensure all content is appropriate and does not violate community guidelines</li>
                      <li>Provide accurate descriptions, titles, and pricing for your artwork</li>
                      <li>Respect intellectual property rights of others</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900">Community Behavior:</h3>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Treat all users with respect and professionalism</li>
                      <li>Engage in constructive communication and feedback</li>
                      <li>Report inappropriate behavior or content</li>
                      <li>Maintain the integrity of the artistic community</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900">Prohibited Activities:</h3>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Harassment, bullying, or discriminatory behavior</li>
                      <li>Spam, fraudulent activities, or misleading information</li>
                      <li>Attempts to hack, disrupt, or compromise platform security</li>
                      <li>Violation of any applicable laws or regulations</li>
                      <li>Impersonation of other users or entities</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-purple-600 mb-4">5. Content Ownership and Licensing</h2>
                <div className="space-y-3 text-gray-700">
                  <p><strong>Your Content:</strong> You retain ownership of all intellectual property rights in content you upload. By using our platform, you grant Artswarit a limited, non-exclusive license to display, distribute, and promote your content for platform operations.</p>
                  
                  <p><strong>Platform Content:</strong> All platform features, design, software, and branding remain the property of Artswarit and are protected by intellectual property laws.</p>
                  
                  <p><strong>User-Generated Content:</strong> We may feature outstanding artworks in marketing materials with your permission. You can opt out of such promotional use in your account settings.</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-purple-600 mb-4">6. Payment Terms and Transactions</h2>
                <div className="space-y-4 text-gray-700">
                  <div>
                    <h3 className="font-semibold text-gray-900">Transaction Processing:</h3>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>All prices are displayed clearly before purchase confirmation</li>
                      <li>Payments are processed securely through third-party providers</li>
                      <li>Platform fees and commissions are transparently disclosed</li>
                      <li>Artists receive payouts according to established schedules</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900">Refunds and Disputes:</h3>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Refund eligibility depends on the type of purchase and timing</li>
                      <li>Digital artwork sales are generally final unless defective</li>
                      <li>Commission disputes are resolved through our mediation process</li>
                      <li>Subscription cancellations follow pro-rated refund policies</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900">Tax Responsibilities:</h3>
                    <p>Users are responsible for understanding and complying with tax obligations in their jurisdiction. Artswarit provides transaction records but does not provide tax advice.</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-purple-600 mb-4">7. Platform Availability and Modifications</h2>
                <div className="space-y-3 text-gray-700">
                  <p>We strive to maintain platform availability but cannot guarantee uninterrupted service. We reserve the right to:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Modify, suspend, or discontinue features with reasonable notice</li>
                    <li>Perform maintenance that may temporarily affect availability</li>
                    <li>Update these Terms as needed, with advance notification</li>
                    <li>Implement new policies to improve platform safety and functionality</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-purple-600 mb-4">8. Disclaimer of Warranties</h2>
                <div className="space-y-3 text-gray-700">
                  <p>Our platform is provided "as is" without warranties of any kind. We disclaim all warranties, express or implied, including:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Merchantability and fitness for a particular purpose</li>
                    <li>Uninterrupted or error-free service</li>
                    <li>Accuracy or completeness of content</li>
                    <li>Security from unauthorized access or data breaches</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-purple-600 mb-4">9. Limitation of Liability</h2>
                <div className="space-y-3 text-gray-700">
                  <p>To the maximum extent permitted by law, Artswarit shall not be liable for:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Indirect, incidental, special, consequential, or punitive damages</li>
                    <li>Loss of profits, data, or business opportunities</li>
                    <li>Actions or inactions of other users</li>
                    <li>Technical failures or security breaches beyond our control</li>
                  </ul>
                  <p>Our total liability for any claim shall not exceed the amount you paid to us in the preceding 12 months.</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-purple-600 mb-4">10. Account Termination and Suspension</h2>
                <div className="space-y-3 text-gray-700">
                  <p>We may suspend or terminate accounts for violations of these Terms, including:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Repeated violations of community guidelines</li>
                    <li>Fraudulent or deceptive practices</li>
                    <li>Copyright infringement or intellectual property violations</li>
                    <li>Behavior harmful to the community or platform</li>
                  </ul>
                  <p>You may terminate your account at any time through your account settings. Upon termination, your content may be removed, subject to legal retention requirements.</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-purple-600 mb-4">11. Governing Law and Dispute Resolution</h2>
                <div className="space-y-3 text-gray-700">
                  <p>These Terms are governed by the laws of [Jurisdiction]. Any disputes shall be resolved through:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Good faith negotiation between the parties</li>
                    <li>Binding arbitration if negotiation fails</li>
                    <li>Courts of competent jurisdiction for injunctive relief</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-purple-600 mb-4">12. Contact Information</h2>
                <div className="text-gray-700">
                  <p>For questions regarding these Terms of Service:</p>
                  <div className="mt-3 space-y-1">
                    <p><strong>Legal Team:</strong> legal@artswarit.com</p>
                    <p><strong>General Support:</strong> support@artswarit.com</p>
                    <p><strong>Address:</strong>Address: New Delhi</p>
                    <p><strong>Last Updated:</strong> {new Date().toLocaleDateString()}</p>
                  </div>
                </div>
              </section>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>;
};
export default TermsOfService;