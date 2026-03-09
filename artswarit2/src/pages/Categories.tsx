
import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CategoryCard from "@/components/CategoryCard";
import { Music, BookOpen, Edit, Pencil, Camera, Palette, Video, Mic, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useCategoryCounts } from "@/hooks/useCategoryCounts";

// Base categories with icons
const baseCategories = [
  {
    title: "Musicians",
    icon: <Music size={24} />,
    slug: "musicians"
  }, 
  {
    title: "Writers",
    icon: <BookOpen size={24} />,
    slug: "writers"
  }, 
  {
    title: "Rappers",
    icon: <Mic size={24} />,
    slug: "rappers"
  }, 
  {
    title: "Editors",
    icon: <Edit size={24} />,
    slug: "editors"
  }, 
  {
    title: "Scriptwriters",
    icon: <Pencil size={24} />,
    slug: "scriptwriters"
  }, 
  {
    title: "Photographers",
    icon: <Camera size={24} />,
    slug: "photographers"
  },
  {
    title: "Illustrators",
    icon: <Palette size={24} />,
    slug: "illustrators"
  },
  {
    title: "Voice Artists",
    icon: <Mic size={24} />,
    slug: "voice-artists"
  },
  {
    title: "Animators",
    icon: <Video size={24} />,
    slug: "animators"
  },
  {
    title: "UI/UX Designers",
    icon: <Monitor size={24} />,
    slug: "designers"
  },
  {
    title: "Singers",
    icon: <Mic size={24} />,
    slug: "singers"
  },
  {
    title: "Dancers",
    icon: <Music size={24} />,
    slug: "dancers"
  }
];

const Categories = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { getCount } = useCategoryCounts();
  
  // Categories with real-time counts
  const allCategories = baseCategories.map(cat => ({
    ...cat,
    count: getCount(cat.title)
  }));
  
  // Filter categories based on search term
  const filteredCategories = allCategories.filter(category => 
    category.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="font-heading text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-artswarit-purple to-blue-500">
            All Categories
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Browse our diverse selection of creative professionals across various categories
          </p>
        </div>
        
        {/* Search bar */}
        <div className="max-w-md mx-auto mb-12">
          <div className="relative">
            <Input 
              type="text" 
              placeholder="Search categories..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 shadow-sm"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <Search size={16} />
            </div>
          </div>
        </div>
        
        {/* Categories grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredCategories.map((category, index) => (
            <CategoryCard key={index} {...category} />
          ))}
        </div>
        
        {filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium mb-2">No categories found</h3>
            <p className="text-muted-foreground">Try a different search term</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Categories;
