import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';

const AboutUs = () => {
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
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">About Artswarit</h1>
            <p className="text-xl text-gray-600">Empowering artists to showcase their talent and connect with the world</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-purple-600 mb-4">Our Vision</h2>
                <p className="text-gray-700 leading-relaxed">
                  At Artswarit, we envision a world where every artist has the opportunity to showcase their unique talent, 
                  connect with appreciative audiences, and build sustainable creative careers. We believe that art has the 
                  power to transform lives, bridge cultures, and inspire positive change in society.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-purple-600 mb-4">Our Mission</h2>
                <p className="text-gray-700 leading-relaxed">
                  Our mission is to democratize the art world by providing a comprehensive platform that empowers artists 
                  from all backgrounds to share their work, monetize their skills, and build meaningful connections with 
                  clients and fellow creators worldwide.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-12">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-purple-600 mb-6">What We Offer</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Artist Profiles</h3>
                  <p className="text-gray-700">Create comprehensive profiles to showcase your portfolio, skills, and artistic journey.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Artwork Marketplace</h3>
                  <p className="text-gray-700">Buy and sell original artworks, commission custom pieces, and discover new talent.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Community Connection</h3>
                  <p className="text-gray-700">Connect with fellow artists, collaborate on projects, and build a supportive creative network.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-purple-600 mb-4">Our Values</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Creativity & Innovation</h3>
                  <p className="text-gray-700">We celebrate creative expression in all its forms and encourage artistic innovation.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Inclusivity & Diversity</h3>
                  <p className="text-gray-700">We welcome artists from all backgrounds, cultures, and artistic disciplines.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Authenticity & Quality</h3>
                  <p className="text-gray-700">We promote genuine artistic expression and maintain high standards for content quality.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Community & Support</h3>
                  <p className="text-gray-700">We foster a supportive environment where artists can grow, learn, and thrive together.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AboutUs;
