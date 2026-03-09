import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Eye, Heart, DollarSign, Users } from 'lucide-react';
import { useCurrencyFormat } from '@/hooks/useCurrencyFormat';

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
  const { format: formatCurrency } = useCurrencyFormat();
  
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
      value: formatCurrency(data.totalRevenue),
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
    <Card className="rounded-[2rem] shadow-xl shadow-primary/5 border-primary/10 backdrop-blur-md overflow-hidden transition-all duration-300 hover:shadow-primary/10">
      <CardHeader className="border-b border-primary/5 pb-4">
        <CardTitle className="text-xl font-black uppercase tracking-widest text-primary/80">Performance Analytics</CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="p-4 sm:p-5 border border-primary/10 rounded-[1.5rem] bg-background/50 hover:bg-background hover:border-primary/30 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-1 group">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-xl bg-muted/50 group-hover:bg-background transition-colors ${stat.color}`}>
                  <stat.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                {formatGrowth(stat.growth)}
              </div>
              <div className="space-y-1">
                <p className="text-2xl sm:text-3xl font-black tracking-tighter text-foreground group-hover:text-primary transition-colors">{stat.value}</p>
                <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-[0.15em]">{stat.title}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ArtworkAnalytics;
