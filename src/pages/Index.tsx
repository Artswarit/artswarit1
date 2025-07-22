
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnimatedHeroSlider from '@/components/AnimatedHeroSlider';
import FeaturedArtistCard from '@/components/FeaturedArtistCard';
import CategoryCard from '@/components/CategoryCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Palette, Users, Award, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  const featuredArtists = [
    {
      id: '1',
      name: 'Maya Patel',
      category: 'Digital Art',
      imageUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b77c?w=400&h=400&fit=crop',
      verified: true,
      premium: false,
      followers: 2840,
      bio: 'Digital artist specializing in abstract compositions and vibrant color palettes'
    },
    {
      id: '2', 
      name: 'Arjun Singh',
      category: 'Photography',
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
      verified: true,
      premium: true,
      followers: 3200,
      bio: 'Portrait and street photographer capturing authentic moments and emotions'
    },
    {
      id: '3',
      name: 'Priya Sharma',
      category: 'Illustration',
      imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
      verified: false,
      premium: false,
      followers: 1950,
      bio: 'Illustrator creating whimsical characters and storytelling through art'
    }
  ];

  const categories = [
    {
      title: 'Digital Art',
      icon: '🎨',
      count: 1250,
      slug: 'digital-art'
    },
    {
      title: 'Photography',
      icon: '📸',
      count: 980,
      slug: 'photography'
    },
    {
      title: 'Illustration',
      icon: '✏️',
      count: 750,
      slug: 'illustration'
    },
    {
      title: 'Graphic Design',
      icon: '🎭',
      count: 650,
      slug: 'graphic-design'
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
      <section className="pt-20 pb-12 md:pb-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <AnimatedHeroSlider />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center glass-card hover-lift">
                <CardContent className="p-4 md:p-6">
                  <stat.icon className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 md:mb-3 text-purple-600" />
                  <div className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-1">
                    {stat.value}
                  </div>
                  <div className="text-xs md:text-sm text-gray-600">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Artists Section */}
      <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Featured Artists
            </h2>
            <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
              Discover talented artists creating amazing work across various categories
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8 mb-8 md:mb-12">
            {featuredArtists.map((artist) => (
              <FeaturedArtistCard 
                key={artist.id} 
                id={artist.id}
                name={artist.name}
                category={artist.category}
                imageUrl={artist.imageUrl}
                verified={artist.verified}
                premium={artist.premium}
                followers={artist.followers}
                bio={artist.bio}
              />
            ))}
          </div>
          
          <div className="text-center">
            <Link to="/explore-artists">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white px-6 md:px-8 py-3">
                View All Artists
                <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Popular Categories
            </h2>
            <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
              Explore diverse creative categories and find the perfect artist for your project
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {categories.map((category, index) => (
              <CategoryCard 
                key={index} 
                title={category.title}
                icon={category.icon}
                count={category.count}
                slug={category.slug}
              />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
              Simple steps to connect with talented artists and bring your vision to life
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
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
                <CardContent className="p-6 md:p-8">
                  <div className="text-3xl md:text-4xl mb-4">{item.icon}</div>
                  <Badge variant="secondary" className="mb-4">
                    Step {item.step}
                  </Badge>
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3">
                    {item.title}
                  </h3>
                  <p className="text-sm md:text-base text-gray-600">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="container mx-auto text-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4">
            Ready to Start Your Creative Journey?
          </h2>
          <p className="text-lg md:text-xl text-purple-100 mb-6 md:mb-8 max-w-2xl mx-auto">
            Join thousands of artists and clients who trust Artswarit for their creative projects
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/signup">
              <Button size="lg" variant="secondary" className="bg-white text-purple-600 hover:bg-gray-100 px-6 md:px-8 py-3 w-full sm:w-auto">
                Get Started Free
              </Button>
            </Link>
            <Link to="/explore">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-purple-600 px-6 md:px-8 py-3 w-full sm:w-auto">
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
