import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
const AboutUs = () => {
  return <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 pt-24">
        <div className="max-w-4xl mx-auto">
          {/* Logo and name */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <img src="/lovable-uploads/eec23911-0863-40d6-84da-ea787a8759c1.png" alt="Artswarit Logo" className="h-14 w-14 md:h-20 md:w-20 rounded-full object-cover shadow" />
            <span className="font-bold text-2xl md:text-3xl text-purple-700 tracking-tight font-heading">Artswarit</span>
          </div>
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">About Artswarit</h1>
            <p className="text-xl text-gray-600">Empowering artists to showcase their talent and connect with the world</p>
          </div>

          <Card className="mb-12">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold text-purple-600 mb-6 text-center">Who We Are</h2>
              <p className="text-lg text-gray-700 leading-relaxed text-center max-w-4xl mx-auto mb-8">Artswarit is more than just a platform it's a global community dedicated to celebrating creativity and empowering artists to thrive in the digital age. Founded in 2025, we recognized the need for a comprehensive space where artists could not only showcase their work but also build sustainable careers through meaningful connections with clients, collectors, and fellow creators.</p>
              <p className="text-lg text-gray-700 leading-relaxed text-center max-w-4xl mx-auto">
                Our team consists of passionate individuals from diverse backgrounds including technology, arts, design, 
                and business, all united by a shared vision of making art more accessible and artists more successful.
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-purple-600 mb-4">Our Vision</h2>
                <p className="text-gray-700 leading-relaxed">
                  At Artswarit, we envision a world where every artist has the opportunity to showcase their unique talent, 
                  connect with appreciative audiences, and build sustainable creative careers. We believe that art has the 
                  power to transform lives, bridge cultures, and inspire positive change in society. Our goal is to become 
                  the premier destination where creativity meets opportunity.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-purple-600 mb-4">Our Mission</h2>
                <p className="text-gray-700 leading-relaxed">
                  Our mission is to democratize the art world by providing a comprehensive platform that empowers artists 
                  from all backgrounds to share their work, monetize their skills, and build meaningful connections with 
                  clients and fellow creators worldwide. We strive to remove barriers and create opportunities for artistic 
                  expression and commercial success.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-12">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-purple-600 mb-6">What We Offer</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Artist Profiles</h3>
                  <p className="text-gray-700">Create comprehensive profiles to showcase your portfolio, skills, and artistic journey with professional presentation tools.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Artwork Marketplace</h3>
                  <p className="text-gray-700">Buy and sell original artworks, commission custom pieces, and discover new talent through our curated marketplace.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Community Connection</h3>
                  <p className="text-gray-700">Connect with fellow artists, collaborate on projects, and build a supportive creative network worldwide.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">AI-Powered Tools</h3>
                  <p className="text-gray-700">Leverage cutting-edge AI technology for content detection, recommendations, and creative assistance.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Live Streaming</h3>
                  <p className="text-gray-700">Engage with your audience in real-time through live streaming capabilities and interactive experiences.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-12">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-purple-600 mb-6">Our Impact (Target)</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
                <div>
                  <h3 className="text-3xl font-bold text-purple-600 mb-2">10,000+</h3>
                  <p className="text-gray-700">Active Artists</p>
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-purple-600 mb-2">50,000+</h3>
                  <p className="text-gray-700">Artworks Showcased</p>
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-purple-600 mb-2">100+</h3>
                  <p className="text-gray-700">Countries Reached</p>
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-purple-600 mb-2">$2M+</h3>
                  <p className="text-gray-700">Artist Earnings</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-12">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-purple-600 mb-4">Our Values</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Creativity & Innovation</h3>
                  <p className="text-gray-700">We celebrate creative expression in all its forms and encourage artistic innovation through cutting-edge technology and tools.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Inclusivity & Diversity</h3>
                  <p className="text-gray-700">We welcome artists from all backgrounds, cultures, and artistic disciplines, creating a truly global creative community.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Authenticity & Quality</h3>
                  <p className="text-gray-700">We promote genuine artistic expression and maintain high standards for content quality while respecting individual creative voices.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Community & Support</h3>
                  <p className="text-gray-700">We foster a supportive environment where artists can grow, learn, and thrive together through collaboration and mutual support.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Transparency & Trust</h3>
                  <p className="text-gray-700">We maintain transparent practices in all our operations and build trust through honest communication and fair policies.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Sustainability & Growth</h3>
                  <p className="text-gray-700">We are committed to sustainable business practices and creating long-term value for our artist community.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-purple-600 mb-4">Join Our Journey</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                Whether you're an emerging artist looking to share your first creation or an established professional 
                seeking new opportunities, Artswarit is here to support your creative journey. Join thousands of artists 
                who have already discovered the power of our platform to transform their passion into success.
              </p>
              <div className="text-center">
                <p className="text-lg font-semibold text-purple-600 mb-2">Ready to start your artistic journey?</p>
                <p className="text-gray-700">Contact us at <a href="mailto:hello@artswarit.com" className="text-purple-600 hover:underline">hello@artswarit.com</a></p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>;
};
export default AboutUs;