
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Eye, Heart, DollarSign, Users } from 'lucide-react';

interface AnalyticsData {
  totalViews: number;
  totalLikes: number;
  totalRevenue: number;
  totalFollowers: number;
  viewsGrowth: number;
  likesGrowth: number;
  revenueGrowth: number;
  followersGrowth: number;
}

interface ArtworkAnalyticsProps {
  data: AnalyticsData;
}

const ArtworkAnalytics = ({ data }: ArtworkAnalyticsProps) => {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatGrowth = (growth: number) => {
    const isPositive = growth >= 0;
    const Icon = isPositive ? TrendingUp : TrendingDown;
    const color = isPositive ? 'text-green-600' : 'text-red-600';
    
    return (
      <div className={`flex items-center gap-1 ${color}`}>
        <Icon className="h-3 w-3" />
        <span className="text-xs font-medium">{Math.abs(growth)}%</span>
      </div>
    );
  };

  const stats = [
    {
      title: 'Total Views',
      value: formatNumber(data.totalViews),
      growth: data.viewsGrowth,
      icon: Eye,
      color: 'text-blue-600'
    },
    {
      title: 'Total Likes',
      value: formatNumber(data.totalLikes),
      growth: data.likesGrowth,
      icon: Heart,
      color: 'text-red-600'
    },
    {
      title: 'Total Revenue',
      value: `$${formatNumber(data.totalRevenue)}`,
      growth: data.revenueGrowth,
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      title: 'Total Followers',
      value: formatNumber(data.totalFollowers),
      growth: data.followersGrowth,
      icon: Users,
      color: 'text-purple-600'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Performance Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="p-3 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                {formatGrowth(stat.growth)}
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-gray-600">{stat.title}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ArtworkAnalytics;
