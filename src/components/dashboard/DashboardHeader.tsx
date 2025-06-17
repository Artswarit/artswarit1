
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle, TrendingUp, Calendar, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface DashboardHeaderProps {
  user?: any;
  profile?: any;
  title: string;
  subtitle: string;
}

const DashboardHeader = ({ user, profile, title, subtitle }: DashboardHeaderProps) => {
  const navigate = useNavigate();
  const [artistStats, setArtistStats] = useState({
    totalViews: 12463,
    monthlyEarnings: 24500,
    totalArtworks: 32,
    followers: 548
  });

  return (
    <div className="space-y-4 sm:space-y-6 py-4 sm:py-6 my-6 sm:my-8 lg:my-12">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            {subtitle}
          </p>
        </div>
        
        <Button 
          onClick={() => navigate("/artist-dashboard/upload")} 
          className="bg-gradient-to-r from-artswarit-purple to-blue-500 border-none w-full sm:w-auto touch-target"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          <span className="text-sm sm:text-base">Add New Artwork</span>
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="flex items-center p-3 sm:p-4 lg:p-6">
            <div className="mr-3 sm:mr-4 bg-purple-100 p-2 rounded-full">
              <Eye className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Views</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold">{artistStats.totalViews.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-3 sm:p-4 lg:p-6">
            <div className="mr-3 sm:mr-4 bg-green-100 p-2 rounded-full">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-green-600" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">Monthly Earnings</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold">₹{artistStats.monthlyEarnings.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-3 sm:p-4 lg:p-6">
            <div className="mr-3 sm:mr-4 bg-blue-100 p-2 rounded-full">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Artworks</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold">{artistStats.totalArtworks}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-3 sm:p-4 lg:p-6">
            <div className="mr-3 sm:mr-4 bg-amber-100 p-2 rounded-full">
              <svg className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">Followers</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold">{artistStats.followers}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardHeader;
