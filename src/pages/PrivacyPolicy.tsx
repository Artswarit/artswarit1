
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
                <div className="space-y-3 text-gray-700">
                  <p><strong>Personal Information:</strong> When you create an account, we collect your name, email address, and profile information.</p>
                  <p><strong>Artwork Data:</strong> Images, videos, audio files, and descriptions you upload to showcase your work.</p>
                  <p><strong>Usage Information:</strong> How you interact with our platform, including views, likes, and browsing patterns.</p>
                  <p><strong>Communication Data:</strong> Messages and interactions between users on our platform.</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-purple-600 mb-4">2. How We Use Your Information</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>To provide and improve our services</li>
                  <li>To facilitate connections between artists and clients</li>
                  <li>To process transactions and payments</li>
                  <li>To send important updates and notifications</li>
                  <li>To prevent fraud and ensure platform security</li>
                  <li>To analyze usage patterns and improve user experience</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-purple-600 mb-4">3. Information Sharing</h2>
                <div className="space-y-3 text-gray-700">
                  <p>We do not sell your personal information. We may share information in the following circumstances:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>With your consent</li>
                    <li>To comply with legal obligations</li>
                    <li>With service providers who help operate our platform</li>
                    <li>In connection with a business transfer or acquisition</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-purple-600 mb-4">4. Data Security</h2>
                <p className="text-gray-700">
                  We implement appropriate security measures to protect your personal information against unauthorized access, 
                  alteration, disclosure, or destruction. However, no internet transmission is 100% secure.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-purple-600 mb-4">5. Your Rights</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Access and update your personal information</li>
                  <li>Delete your account and associated data</li>
                  <li>Control privacy settings for your profile</li>
                  <li>Opt out of marketing communications</li>
                  <li>Request a copy of your data</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-purple-600 mb-4">6. Contact Us</h2>
                <p className="text-gray-700">
                  If you have questions about this Privacy Policy, please contact us at privacy@artswarit.com
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

export default PrivacyPolicy;

