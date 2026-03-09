
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 pt-24">
        <div className="max-w-4xl mx-auto">
          {/* Logo and name */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <img
              src="/lovable-uploads/eec23911-0863-40d6-84da-ea787a8759c1.png"
              alt="Artswarit Logo"
              className="h-14 w-14 md:h-20 md:w-20 rounded-full object-cover shadow"
            />
            <span className="font-bold text-2xl md:text-3xl text-purple-700 tracking-tight font-heading">Artswarit</span>
          </div>
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
            <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          <Card className="mb-8">
            <CardContent className="p-6 space-y-6">
              <section>
                <h2 className="text-2xl font-bold text-purple-600 mb-4">1. Information We Collect</h2>
                <div className="space-y-4 text-gray-700">
                  <div>
                    <h3 className="font-semibold text-gray-900">Personal Information:</h3>
                    <p>When you create an account, we collect your name, email address, profile information, location (if provided), social media links, and professional details such as artistic specializations and experience level.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Artwork and Content Data:</h3>
                    <p>Images, videos, audio files, descriptions, titles, tags, categories, pricing information, and any metadata associated with your uploaded content. We may also process this content for AI-powered features like content detection and recommendations.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Usage and Analytics Information:</h3>
                    <p>How you interact with our platform including page views, clicks, time spent on pages, search queries, device information, IP addresses, browser type, and referral sources.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Communication Data:</h3>
                    <p>Messages and interactions between users, feedback and ratings, support tickets, and any correspondence with our team.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Financial Information:</h3>
                    <p>Payment details for transactions, subscription information, and earnings data (processed securely through third-party payment processors).</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-purple-600 mb-4">2. How We Use Your Information</h2>
                <div className="space-y-3 text-gray-700">
                  <p><strong>Service Provision:</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Create and maintain your account and profile</li>
                    <li>Enable artwork uploads, showcasing, and discovery</li>
                    <li>Facilitate connections between artists and clients</li>
                    <li>Process transactions, payments, and subscription management</li>
                    <li>Provide customer support and respond to inquiries</li>
                  </ul>
                  
                  <p><strong>Platform Improvement:</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Analyze usage patterns to enhance user experience</li>
                    <li>Develop new features and improve existing functionality</li>
                    <li>Conduct research and analytics for platform optimization</li>
                    <li>Train AI models for content recommendations and detection</li>
                  </ul>
                  
                  <p><strong>Communication and Marketing:</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Send important updates, notifications, and platform announcements</li>
                    <li>Provide marketing communications (with your consent)</li>
                    <li>Send personalized recommendations and featured content</li>
                  </ul>
                  
                  <p><strong>Security and Legal Compliance:</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Prevent fraud, abuse, and unauthorized access</li>
                    <li>Ensure platform security and user safety</li>
                    <li>Comply with legal obligations and regulatory requirements</li>
                    <li>Enforce our Terms of Service and community guidelines</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-purple-600 mb-4">3. Information Sharing and Disclosure</h2>
                <div className="space-y-4 text-gray-700">
                  <p className="font-semibold">We do not sell your personal information to third parties. We may share information in the following circumstances:</p>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900">With Your Consent:</h3>
                    <p>When you explicitly agree to share information with specific third parties or for particular purposes.</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900">Service Providers:</h3>
                    <p>With trusted third-party service providers who help us operate our platform, including payment processors, cloud storage providers, analytics services, and customer support tools. These providers are bound by confidentiality agreements.</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900">Legal Requirements:</h3>
                    <p>When required by law, court order, or government request, or when necessary to protect our rights, property, or safety, or that of our users.</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900">Business Transfers:</h3>
                    <p>In connection with a merger, acquisition, or sale of assets, your information may be transferred to the new entity, subject to the same privacy protections.</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900">Public Information:</h3>
                    <p>Information you choose to make public on your profile, such as your portfolio, bio, and contact information, will be visible to other users and may be indexed by search engines.</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-purple-600 mb-4">4. Data Security and Protection</h2>
                <div className="space-y-3 text-gray-700">
                  <p>We implement industry-standard security measures to protect your personal information, including:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>SSL encryption for data transmission</li>
                    <li>Secure cloud storage with access controls</li>
                    <li>Regular security audits and vulnerability assessments</li>
                    <li>Employee training on data protection practices</li>
                    <li>Multi-factor authentication for sensitive operations</li>
                  </ul>
                  <p className="text-sm italic">However, no internet transmission or storage system is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-purple-600 mb-4">5. Data Retention</h2>
                <div className="space-y-3 text-gray-700">
                  <p>We retain your information for as long as necessary to provide our services and comply with legal obligations:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Account information: Until you delete your account or request deletion</li>
                    <li>Artwork and content: Until removed by you or in accordance with our policies</li>
                    <li>Transaction records: As required by law (typically 7 years)</li>
                    <li>Analytics data: Aggregated and anonymized after 2 years</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-purple-600 mb-4">6. Your Rights and Choices</h2>
                <div className="space-y-3 text-gray-700">
                  <p>You have the following rights regarding your personal information:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li><strong>Access:</strong> Request a copy of your personal data</li>
                    <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                    <li><strong>Deletion:</strong> Request deletion of your account and data</li>
                    <li><strong>Portability:</strong> Export your data in a machine-readable format</li>
                    <li><strong>Objection:</strong> Opt out of certain data processing activities</li>
                    <li><strong>Privacy Controls:</strong> Manage your profile visibility and privacy settings</li>
                    <li><strong>Communication Preferences:</strong> Control marketing and notification settings</li>
                  </ul>
                  <p>To exercise these rights, contact us at privacy@artswarit.com or use the settings in your account dashboard.</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-purple-600 mb-4">7. International Data Transfers</h2>
                <p className="text-gray-700">
                  Artswarit operates globally, and your information may be transferred to and processed in countries other than your own. 
                  We ensure appropriate safeguards are in place to protect your information during international transfers, in compliance 
                  with applicable data protection laws including GDPR and other regional regulations.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-purple-600 mb-4">8. Children's Privacy</h2>
                <p className="text-gray-700">
                  Our platform is not intended for children under 13 years of age. We do not knowingly collect personal information 
                  from children under 13. If you believe we have collected information from a child under 13, please contact us immediately, 
                  and we will take steps to remove the information.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-purple-600 mb-4">9. Changes to This Policy</h2>
                <p className="text-gray-700">
                  We may update this Privacy Policy from time to time to reflect changes in our practices or applicable laws. 
                  We will notify you of significant changes through email or platform notifications. Your continued use of our 
                  services after changes take effect constitutes acceptance of the updated policy.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-purple-600 mb-4">10. Contact Us</h2>
                <div className="text-gray-700">
                  <p>If you have questions about this Privacy Policy or wish to exercise your rights, please contact us:</p>
                  <div className="mt-3 space-y-1">
                    <p><strong>Email:</strong> privacy@artswarit.com</p>
                    <p><strong>Data Protection Officer:</strong> dpo@artswarit.com</p>
                    <p><strong>Response Time:</strong> We will respond to your inquiry within 30 days</p>
                  </div>
                </div>
              </section>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;

