
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnimatedHeroSlider from '@/components/AnimatedHeroSlider';
import FeaturedArtistCard from '@/components/FeaturedArtistCard';
import CategoryCard from '@/components/CategoryCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Palette, Users, Award, TrendingUp, Star, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  const featuredArtists = [
    {
      id: '1',
      name: 'Maya Patel',
      category: 'Digital Art',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b77c?w=400&h=400&fit=crop',
      rating: 4.9,
      projects: 47,
      verified: true,
      location: 'Mumbai, India'
    },
    {
      id: '2', 
      name: 'Arjun Singh',
      category: 'Photography',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
      rating: 4.8,
      projects: 32,
      verified: true,
      location: 'Delhi, India'
    },
    {
      id: '3',
      name: 'Priya Sharma',
      category: 'Illustration',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
      rating: 4.9,
      projects: 28,
      verified: false,
      location: 'Bangalore, India'
    }
  ];

  const categories = [
    {
      name: 'Digital Art',
      icon: '🎨',
      count: 1250,
      description: 'Modern digital creations',
      color: 'from-purple-500 to-pink-500'
    },
    {
      name: 'Photography',
      icon: '📸',
      count: 980,
      description: 'Stunning visual stories',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      name: 'Illustration',
      icon: '✏️',
      count: 750,
      description: 'Hand-drawn masterpieces',
      color: 'from-green-500 to-emerald-500'
    },
    {
      name: 'Graphic Design',
      icon: '🎭',
      count: 650,
      description: 'Brand & visual identity',
      color: 'from-orange-500 to-red-500'
    }
  ];

  const stats = [
    { icon: Users, label: 'Active Artists', value: '10K+' },
    { icon: Palette, label: 'Artworks', value: '50K+' },
    { icon: Award, label: 'Projects Completed', value: '25K+' },
    { icon: TrendingUp, label: 'Success Rate', value: '98%' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <AnimatedHeroSlider />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center glass-card hover-lift">
                <CardContent className="p-6">
                  <stat.icon className="h-8 w-8 mx-auto mb-3 text-purple-600" />
                  <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Artists Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured Artists
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover talented artists creating amazing work across various categories
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12">
            {featuredArtists.map((artist) => (
              <FeaturedArtistCard key={artist.id} artist={artist} />
            ))}
          </div>
          
          <div className="text-center">
            <Link to="/explore-artists">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3">
                View All Artists
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Popular Categories
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore diverse creative categories and find the perfect artist for your project
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <CategoryCard key={index} category={category} />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Simple steps to connect with talented artists and bring your vision to life
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Browse & Discover',
                description: 'Explore our curated collection of talented artists and their portfolios',
                icon: '🔍'
              },
              {
                step: '2',
                title: 'Connect & Commission',
                description: 'Reach out to artists directly and discuss your project requirements',
                icon: '💬'
              },
              {
                step: '3',
                title: 'Create & Collaborate',
                description: 'Work together to bring your creative vision to life with professional results',
                icon: '✨'
              }
            ].map((item, index) => (
              <Card key={index} className="text-center glass-card hover-lift">
                <CardContent className="p-8">
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <Badge variant="secondary" className="mb-4">
                    Step {item.step}
                  </Badge>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {item.title}
                  </h3>
                  <p className="text-gray-600">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Start Your Creative Journey?
          </h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Join thousands of artists and clients who trust Artswarit for their creative projects
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/signup">
              <Button size="lg" variant="secondary" className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-3">
                Get Started Free
              </Button>
            </Link>
            <Link to="/explore">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-purple-600 px-8 py-3">
                Explore Platform
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
