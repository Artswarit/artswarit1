
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";

interface CategoryCardProps {
  title: string;
  icon: React.ReactNode;
  count: number;
  slug: string;
}

const CategoryCard = ({ title, icon, count, slug }: CategoryCardProps) => {
  return (
    <Link to={`/explore?category=${slug}`} className="block">
      <Card className="glass-card overflow-hidden hover-lift transition-all duration-300 h-full min-h-[140px] sm:min-h-[160px]">
        <CardContent className="p-4 sm:p-6 flex flex-col items-center justify-center text-center h-full">
          <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md mb-3 sm:mb-4 [&>svg]:w-5 [&>svg]:h-5 sm:[&>svg]:w-6 sm:[&>svg]:h-6">
            {icon}
          </div>
          <h3 className="font-heading font-semibold text-sm sm:text-base md:text-lg mb-1">{title}</h3>
          <p className="text-muted-foreground text-xs sm:text-sm">
            {count.toLocaleString()} artists
          </p>
        </CardContent>
      </Card>
    </Link>
  );
};

export default CategoryCard;
