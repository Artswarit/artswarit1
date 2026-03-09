import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Clock, Plus, Users, Palette, Music, Video, MessageSquare, CreditCard, Star, Shield, Crown, Search, Bell, Settings, BarChart3, FileText, Camera, Headphones, Play, Download, Share, Heart, Eye, TrendingUp, Award, Gift } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface Feature {
  name: string;
  description: string;
  status: 'implemented' | 'partial' | 'missing';
  category: string;
  priority: 'high' | 'medium' | 'low';
  icon: any;
  location?: string;
}

const FeatureAudit = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const features: Feature[] = [
    // Core Platform Features
    { name: 'Artist Registration & Profiles', description: 'Complete artist onboarding with portfolios', status: 'implemented', category: 'core', priority: 'high', icon: Users, location: 'Signup & Artist Dashboard' },
    { name: 'Client Registration', description: 'Client account creation and management', status: 'implemented', category: 'core', priority: 'high', icon: Users, location: 'Signup & Client Dashboard' },
    { name: 'Admin Panel', description: 'Administrative controls and moderation', status: 'implemented', category: 'core', priority: 'high', icon: Shield, location: 'Admin Dashboard' },
    
    // Content Management
    { name: 'Artwork Upload & Management', description: 'Upload, organize, and manage artworks', status: 'implemented', category: 'content', priority: 'high', icon: Palette, location: 'Artist Dashboard' },
    { name: 'Music Upload & Streaming', description: 'Audio content upload and playback', status: 'partial', category: 'content', priority: 'high', icon: Music, location: 'Artwork Upload' },
    { name: 'Video Upload & Streaming', description: 'Video content upload and playback', status: 'partial', category: 'content', priority: 'high', icon: Video, location: 'Artwork Upload' },
    { name: 'Content Approval System', description: 'Moderation workflow for uploaded content', status: 'implemented', category: 'content', priority: 'high', icon: CheckCircle, location: 'Admin Dashboard' },
    
    // Discovery & Search
    { name: 'Artist Discovery', description: 'Browse and discover artists by category', status: 'implemented', category: 'discovery', priority: 'high', icon: Search, location: 'Explore Artists' },
    { name: 'Advanced Search & Filters', description: 'Comprehensive search with multiple filters', status: 'implemented', category: 'discovery', priority: 'high', icon: Search, location: 'Explore & Categories' },
    { name: 'Trending Content', description: 'Showcase popular and trending artworks', status: 'implemented', category: 'discovery', priority: 'medium', icon: TrendingUp, location: 'Explore Page' },
    { name: 'Recommendations Engine', description: 'Personalized content recommendations', status: 'partial', category: 'discovery', priority: 'medium', icon: Star },
    
    // Social Features
    { name: 'Artist Following', description: 'Follow favorite artists for updates', status: 'implemented', category: 'social', priority: 'high', icon: Heart, location: 'Artist Profiles' },
    { name: 'Artwork Likes & Views', description: 'Engagement metrics for content', status: 'implemented', category: 'social', priority: 'high', icon: Heart, location: 'Artwork Cards' },
    { name: 'Comments & Reviews', description: 'User feedback on artworks', status: 'implemented', category: 'social', priority: 'medium', icon: MessageSquare, location: 'Artwork Details Page' },
    { name: 'Social Sharing', description: 'Share artworks on social platforms', status: 'implemented', category: 'social', priority: 'medium', icon: Share, location: 'Artwork Details Page' },
    
    // Communication
    { name: 'Direct Messaging', description: 'Private communication between users', status: 'implemented', category: 'communication', priority: 'high', icon: MessageSquare, location: 'Messages Tab' },
    { name: 'Project Collaboration', description: 'Collaborative workspace for projects', status: 'implemented', category: 'communication', priority: 'high', icon: FileText, location: 'Projects Tab' },
    { name: 'Notifications System', description: 'Real-time notifications and alerts', status: 'implemented', category: 'communication', priority: 'high', icon: Bell, location: 'Notifications' },
    
    // Commerce
    { name: 'Artwork Sales', description: 'Buy and sell artwork directly', status: 'implemented', category: 'commerce', priority: 'high', icon: CreditCard, location: 'Artwork Cards' },
    { name: 'Commission System', description: 'Custom artwork commissions', status: 'partial', category: 'commerce', priority: 'high', icon: FileText },
    { name: 'Payment Processing', description: 'Secure payment handling', status: 'implemented', category: 'commerce', priority: 'high', icon: CreditCard, location: 'Payments Tab' },
    { name: 'Earnings Dashboard', description: 'Track income and analytics', status: 'implemented', category: 'commerce', priority: 'high', icon: BarChart3, location: 'Earnings Tab' },
    
    // Premium Features
    { name: 'Premium Memberships', description: 'Subscription-based premium features', status: 'implemented', category: 'premium', priority: 'medium', icon: Crown, location: 'Premium Tab' },
    { name: 'Exclusive Content', description: 'Premium-only artwork and features', status: 'implemented', category: 'premium', priority: 'medium', icon: Crown, location: 'Premium Content' },
    { name: 'Advanced Analytics', description: 'Detailed performance metrics', status: 'implemented', category: 'premium', priority: 'medium', icon: BarChart3, location: 'Earnings Dashboard' },
    
    // Technical Features
    { name: 'Mobile Responsive Design', description: 'Optimized for mobile devices', status: 'implemented', category: 'technical', priority: 'high', icon: Settings, location: 'All Pages' },
    { name: 'Content Delivery Network', description: 'Fast global content delivery', status: 'partial', category: 'technical', priority: 'medium', icon: TrendingUp },
    { name: 'Offline Capabilities', description: 'Offline browsing and caching', status: 'missing', category: 'technical', priority: 'low', icon: Download },
    
    // Missing Core Features
    { name: 'Live Streaming', description: 'Real-time streaming for performances', status: 'missing', category: 'content', priority: 'medium', icon: Play },
    { name: 'Portfolio Websites', description: 'Dedicated artist website creation', status: 'missing', category: 'content', priority: 'medium', icon: Camera },
    { name: 'Event Management', description: 'Create and manage artistic events', status: 'missing', category: 'social', priority: 'medium', icon: Award },
    { name: 'Contests & Challenges', description: 'Community art contests', status: 'missing', category: 'social', priority: 'low', icon: Award },
    { name: 'Merchandise Store', description: 'Physical merchandise sales', status: 'missing', category: 'commerce', priority: 'low', icon: Gift },
    { name: 'NFT Integration', description: 'Blockchain-based digital ownership', status: 'missing', category: 'commerce', priority: 'low', icon: Shield },
  ];

  const categories = [
    { id: 'all', name: 'All Features', count: features.length },
    { id: 'core', name: 'Core Platform', count: features.filter(f => f.category === 'core').length },
    { id: 'content', name: 'Content Management', count: features.filter(f => f.category === 'content').length },
    { id: 'discovery', name: 'Discovery & Search', count: features.filter(f => f.category === 'discovery').length },
    { id: 'social', name: 'Social Features', count: features.filter(f => f.category === 'social').length },
    { id: 'communication', name: 'Communication', count: features.filter(f => f.category === 'communication').length },
    { id: 'commerce', name: 'Commerce', count: features.filter(f => f.category === 'commerce').length },
    { id: 'premium', name: 'Premium Features', count: features.filter(f => f.category === 'premium').length },
    { id: 'technical', name: 'Technical', count: features.filter(f => f.category === 'technical').length },
  ];

  const filteredFeatures = selectedCategory === 'all' 
    ? features 
    : features.filter(f => f.category === selectedCategory);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'implemented':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'partial':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'implemented':
        return <Badge className="bg-green-100 text-green-800">Complete</Badge>;
      case 'partial':
        return <Badge variant="secondary">Partial</Badge>;
      default:
        return <Badge variant="destructive">Missing</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">High Priority</Badge>;
      case 'medium':
        return <Badge variant="secondary">Medium Priority</Badge>;
      default:
        return <Badge variant="outline">Low Priority</Badge>;
    }
  };

  const stats = {
    implemented: features.filter(f => f.status === 'implemented').length,
    partial: features.filter(f => f.status === 'partial').length,
    missing: features.filter(f => f.status === 'missing').length,
    total: features.length
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8 pt-24">
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">ArtSwarit Platform Feature Audit</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive review of all platform features to ensure we have everything needed for a complete art marketplace
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-green-600">{stats.implemented}</div>
                <div className="text-sm text-gray-600">Fully Implemented</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-yellow-600">{stats.partial}</div>
                <div className="text-sm text-gray-600">Partially Complete</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-red-600">{stats.missing}</div>
                <div className="text-sm text-gray-600">Missing Features</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-blue-600">{Math.round((stats.implemented / stats.total) * 100)}%</div>
                <div className="text-sm text-gray-600">Completion Rate</div>
              </CardContent>
            </Card>
          </div>

          {/* Category Filter */}
          <Card>
            <CardHeader>
              <CardTitle>Filter by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    onClick={() => setSelectedCategory(category.id)}
                    className="flex items-center gap-2"
                  >
                    {category.name}
                    <Badge variant="secondary">{category.count}</Badge>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Features List */}
          <div className="grid grid-cols-1 gap-4">
            {filteredFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <Icon className="h-5 w-5 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">{feature.name}</h3>
                            {getStatusIcon(feature.status)}
                          </div>
                          <p className="text-gray-600 mb-3">{feature.description}</p>
                          {feature.location && (
                            <p className="text-sm text-blue-600">📍 Location: {feature.location}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        {getStatusBadge(feature.status)}
                        {getPriorityBadge(feature.priority)}
                        <Badge variant="outline" className="capitalize">{feature.category}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Action Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Recommended Next Steps
              </CardTitle>
              <CardDescription>
                Priority features to implement for a complete ArtSwarit platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="font-semibold text-red-800 mb-2">High Priority Missing Features</h4>
                  <ul className="space-y-1 text-sm text-red-700">
                    {features.filter(f => f.status === 'missing' && f.priority === 'high').map((feature, i) => (
                      <li key={i}>• {feature.name}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-semibold text-yellow-800 mb-2">Partial Implementations to Complete</h4>
                  <ul className="space-y-1 text-sm text-yellow-700">
                    {features.filter(f => f.status === 'partial').map((feature, i) => (
                      <li key={i}>• {feature.name} - {feature.description}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Enhancement Opportunities</h4>
                  <ul className="space-y-1 text-sm text-blue-700">
                    <li>• Add real-time audio/video streaming capabilities</li>
                    <li>• Implement social features like comments and sharing</li>
                    <li>• Create artist portfolio website builder</li>
                    <li>• Add event management for exhibitions and shows</li>
                  </ul>
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

export default FeatureAudit;
