
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle, TrendingUp, Calendar, Eye, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useArtistDashboardStats } from "@/hooks/useArtistDashboardStats";

interface DashboardHeaderProps {
  user?: any;
  profile?: any;
  title: string;
  subtitle: string;
}

const DashboardHeader = ({ user, profile, title, subtitle }: DashboardHeaderProps) => {
  const navigate = useNavigate();
  const { stats, loading } = useArtistDashboardStats();

  return (
    <div className="space-y-4 sm:space-y-6 py-3 sm:py-[18px] my-6 sm:my-[49px]">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            {subtitle}
          </p>
        </div>
        
        <Button 
          onClick={() => navigate("/artist-dashboard/upload")} 
          className="w-full lg:w-auto bg-gradient-to-r from-artswarit-purple to-blue-500 border-none min-h-[44px]"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Artwork
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="flex items-center p-4 sm:p-6">
            <div className="mr-3 sm:mr-4 bg-purple-100 p-2 rounded-full">
              <Eye className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Views</p>
              <p className="text-xl sm:text-2xl font-bold">
                {loading ? '...' : stats.totalViews.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-4 sm:p-6">
            <div className="mr-3 sm:mr-4 bg-green-100 p-2 rounded-full">
              <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">Monthly Earnings</p>
              <p className="text-xl sm:text-2xl font-bold">
                {loading ? '...' : `₹${stats.monthlyEarnings.toLocaleString()}`}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-4 sm:p-6">
            <div className="mr-3 sm:mr-4 bg-blue-100 p-2 rounded-full">
              <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Artworks</p>
              <p className="text-xl sm:text-2xl font-bold">
                {loading ? '...' : stats.totalArtworks}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-4 sm:p-6">
            <div className="mr-3 sm:mr-4 bg-amber-100 p-2 rounded-full">
              <Users className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">Followers</p>
              <p className="text-xl sm:text-2xl font-bold">
                {loading ? '...' : stats.followers}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardHeader;
