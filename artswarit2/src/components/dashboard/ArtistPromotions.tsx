
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Images, Award, TrendingUp, Rocket, Paintbrush } from "lucide-react";

interface ArtistPromotionsProps {
  isLoading?: boolean;
}

const ArtistPromotions = ({ isLoading = false }: ArtistPromotionsProps) => {
  const [promotions, setPromotions] = useState([
    {
      id: "1",
      title: "Summer Sale",
      status: "active",
      startDate: "2023-07-01",
      endDate: "2023-07-31",
      discount: "20%",
    },
    {
      id: "2",
      title: "New Collection Launch",
      status: "scheduled",
      startDate: "2023-08-15",
      endDate: "2023-09-15",
      discount: "15%",
    },
    {
      id: "3",
      title: "Back to School",
      status: "ended",
      startDate: "2023-08-01",
      endDate: "2023-08-31",
      discount: "10%",
    },
  ]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 bg-gray-200 animate-pulse rounded-md"></div>
        <div className="h-64 bg-gray-200 animate-pulse rounded-md"></div>
        <div className="h-64 bg-gray-200 animate-pulse rounded-md"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Promotions</h2>
        <Button>Create New</Button>
      </div>
      <Tabs defaultValue="active" className="w-full">
        <TabsList>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="ended">Ended</TabsTrigger>
        </TabsList>
        <TabsContent value="active">
          {promotions
            .filter((promo) => promo.status === "active")
            .map((promo) => (
              <Card key={promo.id}>
                <CardHeader>
                  <CardTitle>{promo.title}</CardTitle>
                  <CardDescription>
                    {promo.startDate} - {promo.endDate}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Discount: {promo.discount}</p>
                </CardContent>
                <CardFooter>
                  <Button>View Details</Button>
                </CardFooter>
              </Card>
            ))}
        </TabsContent>
        <TabsContent value="scheduled">
          {promotions
            .filter((promo) => promo.status === "scheduled")
            .map((promo) => (
              <Card key={promo.id}>
                <CardHeader>
                  <CardTitle>{promo.title}</CardTitle>
                  <CardDescription>
                    {promo.startDate} - {promo.endDate}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Discount: {promo.discount}</p>
                </CardContent>
                <CardFooter>
                  <Button>View Details</Button>
                </CardFooter>
              </Card>
            ))}
        </TabsContent>
        <TabsContent value="ended">
          {promotions
            .filter((promo) => promo.status === "ended")
            .map((promo) => (
              <Card key={promo.id}>
                <CardHeader>
                  <CardTitle>{promo.title}</CardTitle>
                  <CardDescription>
                    {promo.startDate} - {promo.endDate}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Discount: {promo.discount}</p>
                </CardContent>
                <CardFooter>
                  <Button>View Details</Button>
                </CardFooter>
              </Card>
            ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ArtistPromotions;
