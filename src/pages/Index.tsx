import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FeaturedArtistCard from "@/components/FeaturedArtistCard";
import CategoryCard from "@/components/CategoryCard";
import { Music, BookOpen, Edit, Pencil } from "lucide-react";
import AnimatedHeroSlider from "@/components/AnimatedHeroSlider";
import ArtworkCarousel from "@/components/ArtworkCarousel";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

// Mock data - In a real application, this would come from an API
const allArtists = [{
  id: "1",
  name: "Alex Rivera",
  category: "Musician",
  imageUrl: "https://images.unsplash.com/photo-1549213783-8284d0336c4f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
  verified: true,
  premium: true,
  followers: 12543,
  likes: 4580,
  views: 28750,
  bio: "Multi-platinum musician with over 10 years of experience in the industry."
}, {
  id: "2",
  name: "Maya Johnson",
  category: "Writer",
  imageUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
  verified: true,
  premium: false,
  followers: 8765,
  likes: 3240,
  views: 19500,
  bio: "Award-winning author specializing in fantasy and science fiction novels."
}, {
  id: "3",
  name: "Jordan Smith",
  category: "Rapper",
  imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
  verified: false,
  premium: true,
  followers: 6421,
  likes: 2870,
  views: 16200,
  bio: "Underground hip-hop artist known for thought-provoking lyrics and innovative beats."
}, {
  id: "4",
  name: "Taylor Reed",
  category: "Editor",
  imageUrl: "https://images.unsplash.com/photo-1573496358961-3c82861ab8f4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=688&q=80",
  verified: false,
  premium: false,
  followers: 3827,
  likes: 1950,
  views: 9800,
  bio: "Professional editor with experience working with major publishing houses."
}, {
  id: "5",
  name: "Elena Rodriguez",
  category: "Photographer",
  imageUrl: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1171&q=80",
  verified: true,
  premium: true,
  followers: 11243,
  likes: 4120,
  views: 24600,
  bio: "Specializing in portrait and landscape photography with a unique artistic style."
}, {
  id: "6",
  name: "Marcus Bell",
  category: "Illustrator",
  imageUrl: "https://images.unsplash.com/photo-1610088441520-4352457e7095?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
  verified: true,
  premium: false,
  followers: 9876,
  likes: 3680,
  views: 21300,
  bio: "Digital illustrator creating vibrant fantasy scenes and character designs."
}, {
  id: "7",
  name: "Sarah Chen",
  category: "Voice Artist",
  imageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
  verified: false,
  premium: true,
  followers: 7650,
  likes: 3050,
  views: 18200,
  bio: "Versatile voice artist with experience in commercials, animation and audiobooks."
}, {
  id: "8",
  name: "Jamal Wilson",
  category: "Animator",
  imageUrl: "https://images.unsplash.com/photo-1463453091185-61582044d556?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
  verified: true,
  premium: false,
  followers: 5430,
  likes: 2340,
  views: 13800,
  bio: "3D animator creating captivating characters and environments for games and films."
}, {
  id: "9",
  name: "Lisa Zhang",
  category: "Musician",
  imageUrl: "https://images.unsplash.com/photo-1494790108755-2616c4e7e01c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
  verified: true,
  premium: true,
  followers: 8900,
  likes: 2100,
  views: 15400,
  bio: "Classical pianist turned electronic music producer."
}, {
  id: "10",
  name: "David Park",
  category: "Writer",
  imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
  verified: false,
  premium: false,
  followers: 4200,
  likes: 1800,
  views: 9200,
  bio: "Freelance journalist and creative writer focusing on technology and culture."
}, {
  id: "11",
  name: "Maria Santos",
  category: "Rapper",
  imageUrl: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
  verified: true,
  premium: false,
  followers: 7800,
  likes: 3400,
  views: 18600,
  bio: "Bilingual rapper blending Latin influences with modern hip-hop."
}];

// Testimonials
const testimonials = [{
  content: "Artswarit helped me showcase my music to a broader audience and connect with clients I never thought possible.",
  author: "Marcus Williams",
  role: "Musician"
}, {
  content: "As a writer, I was struggling to monetize my work. Artswarit provided the perfect platform to share and earn from my passion.",
  author: "Sophia Chen",
  role: "Writer"
}, {
  content: "The verification badge gave my profile the credibility it needed. Now clients trust my work before even hearing it.",
  author: "Derek Johnson",
  role: "Rapper"
}];
const Index = () => {
  const [featuredArtists, setFeaturedArtists] = useState([]);
  const [categories, setCategories] = useState([]);

  // Calculate category counts dynamically
  const calculateCategoryData = () => {
    const categoryMap = new Map();

    // Initialize with base categories and icons
    const baseCategories = [{
      title: "Musicians",
      icon: <Music size={24} />,
      slug: "musicians"
    }, {
      title: "Writers",
      icon: <BookOpen size={24} />,
      slug: "writers"
    }, {
      title: "Rappers",
      icon: <Music size={24} />,
      slug: "rappers"
    }, {
      title: "Editors",
      icon: <Edit size={24} />,
      slug: "editors"
    }, {
      title: "Photographers",
      icon: <Edit size={24} />,
      slug: "photographers"
    }, {
      title: "Illustrators",
      icon: <Pencil size={24} />,
      slug: "illustrators"
    }, {
      title: "Voice Artists",
      icon: <Music size={24} />,
      slug: "voice-artists"
    }, {
      title: "Animators",
      icon: <Edit size={24} />,
      slug: "animators"
    }, {
      title: "Scriptwriters",
      icon: <Pencil size={24} />,
      slug: "scriptwriters"
    }];
    baseCategories.forEach(cat => {
      categoryMap.set(cat.title, {
        ...cat,
        count: 0
      });
    });

    // Count artists by category
    allArtists.forEach(artist => {
      const categoryName = artist.category === "Musician" ? "Musicians" : artist.category === "Writer" ? "Writers" : artist.category === "Rapper" ? "Rappers" : artist.category === "Editor" ? "Editors" : artist.category === "Photographer" ? "Photographers" : artist.category === "Illustrator" ? "Illustrators" : artist.category === "Voice Artist" ? "Voice Artists" : artist.category === "Animator" ? "Animators" : "Others";
      if (categoryMap.has(categoryName)) {
        categoryMap.get(categoryName).count++;
      }
    });

    // Add some base numbers to make it look more realistic
    const finalCategories = Array.from(categoryMap.values()).map(cat => ({
      ...cat,
      count: cat.count + Math.floor(Math.random() * 500) + 100 // Add some base count
    }));
    return finalCategories.filter(cat => cat.count > 0);
  };

  // Effect to sort and update featured artists based on popularity metrics
  useEffect(() => {
    // Sort artists by a combined popularity score (followers, likes, views)
    const sortedArtists = [...allArtists].sort((a, b) => {
      const scoreA = a.followers * 0.4 + a.likes * 0.3 + a.views * 0.3;
      const scoreB = b.followers * 0.4 + b.likes * 0.3 + b.views * 0.3;
      return scoreB - scoreA;
    });

    // Get top artists
    setFeaturedArtists(sortedArtists.slice(0, 6));

    // Calculate and set categories
    setCategories(calculateCategoryData());

    // Update featured artists periodically (every 24 hours in production)
    const timer = setInterval(() => {
      // In a real app, this would fetch the latest data from an API
      const newRanking = [...allArtists].sort((a, b) => {
        const randomFactorA = Math.random() * 0.2;
        const randomFactorB = Math.random() * 0.2;
        const scoreA = a.followers * 0.4 + a.likes * 0.3 + a.views * 0.3 + randomFactorA;
        const scoreB = b.followers * 0.4 + b.likes * 0.3 + b.views * 0.3 + randomFactorB;
        return scoreB - scoreA;
      });
      setFeaturedArtists(newRanking.slice(0, 6));

      // Recalculate categories with slight variations
      setCategories(calculateCategoryData());
    }, 60000); // Every minute for demo purposes

    return () => clearInterval(timer);
  }, []);
  return <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />
      
      <AnimatedHeroSlider />
      
      {/* Featured Artists Section */}
      <section id="featured-artists" className="container mx-auto px-4 py-12 sm:py-16 sm:px-6 lg:px-8 mt-4 sm:mt-8">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-artswarit-purple to-blue-500">
            Featured Artists
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Discover trending creators making waves on Artswarit, updated regularly based on popularity.
          </p>
        </div>
        
        <div className="relative">
          <Carousel opts={{
          align: "start",
          loop: true
        }} className="w-full">
            <CarouselContent className="-ml-2 md:-ml-4">
              {featuredArtists.map(artist => <CarouselItem key={artist.id} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
                  <div className="h-full">
                    <FeaturedArtistCard {...artist} />
                  </div>
                </CarouselItem>)}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex left-2 bg-white/80 backdrop-blur-md border border-white/30 text-primary hover:bg-white/90" />
            <CarouselNext className="hidden sm:flex right-2 bg-white/80 backdrop-blur-md border border-white/30 text-primary hover:bg-white/90" />
          </Carousel>
        </div>
      </section>
      
      {/* Artwork Carousel Section */}
      <ArtworkCarousel />

      {/* Categories Section */}
      <section className="py-12 sm:py-16 bg-gradient-to-r from-indigo-50 to-purple-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-artswarit-purple to-blue-500">
              Popular Categories
            </h2>
            <p className="text-base sm:text-lg font-serif text-muted-foreground max-w-2xl mx-auto px-4">
              Find the perfect creative professional for your project from our diverse selection of specialized talents.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-2"></span>
              Live counts • Updated regularly
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {categories.slice(0, 6).map((category, index) => <CategoryCard key={index} {...category} />)}
          </div>
          <div className="text-center mt-8">
            <p className="text-base sm:text-lg italic text-muted-foreground mb-4 px-4">
              ...and many more categories to explore with thousands of talented artists
            </p>
            <Button asChild variant="outline" size="lg" className="border-artswarit-purple text-artswarit-purple hover:bg-artswarit-purple hover:text-white transition-all">
              <Link to="/categories">View All Categories</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container mx-auto px-4 py-12 sm:py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-artswarit-purple to-blue-500">
            How Artswarit Works
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            A simple process to showcase your talent or find the perfect creative professional.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <div className="text-center p-4 sm:p-6 bg-white/60 backdrop-blur-sm rounded-xl border border-blue-100 shadow-sm hover:shadow-md transition-all">
            <div className="bg-gradient-to-r from-artswarit-purple to-blue-500 h-12 w-12 sm:h-16 sm:w-16 rounded-full flex items-center justify-center text-white mx-auto mb-4">
              <span className="font-bold text-lg sm:text-xl">1</span>
            </div>
            <h3 className="font-heading text-lg sm:text-xl font-semibold mb-2">Create Your Profile</h3>
            <p className="text-sm sm:text-base text-muted-foreground">
              Sign up as an artist and build your custom profile showcasing your skills, portfolio, and services.
            </p>
          </div>
          <div className="text-center p-4 sm:p-6 bg-white/60 backdrop-blur-sm rounded-xl border border-blue-100 shadow-sm hover:shadow-md transition-all">
            <div className="bg-gradient-to-r from-artswarit-purple to-blue-500 h-12 w-12 sm:h-16 sm:w-16 rounded-full flex items-center justify-center text-white mx-auto mb-4">
              <span className="font-bold text-lg sm:text-xl">2</span>
            </div>
            <h3 className="font-heading text-lg sm:text-xl font-semibold mb-2">Upload Your Content</h3>
            <p className="text-sm sm:text-base text-muted-foreground">
              Share your work with the world. Upload audio, video, or text content to showcase your talent.
            </p>
          </div>
          <div className="text-center p-4 sm:p-6 bg-white/60 backdrop-blur-sm rounded-xl border border-blue-100 shadow-sm hover:shadow-md transition-all">
            <div className="bg-gradient-to-r from-artswarit-purple to-blue-500 h-12 w-12 sm:h-16 sm:w-16 rounded-full flex items-center justify-center text-white mx-auto mb-4">
              <span className="font-bold text-lg sm:text-xl">3</span>
            </div>
            <h3 className="font-heading text-lg sm:text-xl font-semibold mb-2">Connect & Earn</h3>
            <p className="text-sm sm:text-base text-muted-foreground">
              Get discovered by clients, receive project offers, and monetize your creative skills.
            </p>
          </div>
        </div>
        <div className="text-center mt-8 sm:mt-10">
          <Button asChild size="lg" className="bg-gradient-to-r from-artswarit-purple to-blue-500 border-none">
            <Link to="/signup">Get Started Now</Link>
          </Button>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12 sm:py-16 bg-gradient-to-r from-indigo-50 to-purple-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-artswarit-purple to-blue-500">
              Success Stories
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
              Hear from artists who have transformed their careers with Artswarit.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {testimonials.map((testimonial, index) => <div key={index} className="bg-white/60 backdrop-blur-sm p-4 sm:p-6 rounded-xl shadow-sm border border-blue-100 hover:shadow-md transition-all">
                <div className="mb-4">
                  {[...Array(5)].map((_, i) => <span key={i} className="text-yellow-400">★</span>)}
                </div>
                <p className="text-gray-700 mb-4 text-sm sm:text-base">"{testimonial.content}"</p>
                <div>
                  <p className="font-heading font-semibold text-sm sm:text-base">{testimonial.author}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>)}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-artswarit-purple to-blue-500 text-white py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto relative">
            <div className="absolute -top-10 -left-10 w-20 h-20 bg-white/10 rounded-full blur-xl hidden sm:block"></div>
            <div className="absolute -bottom-10 -right-10 w-20 h-20 bg-white/10 rounded-full blur-xl hidden sm:block"></div>
            
            <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold mb-4 px-4">
              Ready to Showcase Your Talent?
            </h2>
            <p className="text-lg sm:text-xl mb-6 sm:mb-8 max-w-2xl mx-auto text-white/90 px-4">
              Join thousands of creative professionals who are building their careers with Artswarit.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 px-4 w-full">
              {/* Gradient main action */}
              <Button
                asChild
                size="lg"
                variant="default"
                className="
                  bg-gradient-to-r from-artswarit-purple to-blue-500
                  text-white
                  font-bold
                  w-full sm:w-auto
                  h-14
                  rounded-xl
                  flex items-center justify-center
                  text-base sm:text-lg
                  transition-all
                  shadow-lg
                  hover:from-purple-700 hover:to-blue-700
                  hover:scale-[1.03]
                  focus-visible:ring-4
                  ring-artswarit-purple/60
                  border-none"
              >
                <Link to="/signup" className="w-full h-full flex items-center justify-center">
                  Join as Artist
                </Link>
              </Button>
              {/* Subtle glass secondary */}
              <Button
                asChild
                size="lg"
                variant="outline"
                className="
                  bg-white/20
                  border-white/40
                  text-blue-100
                  hover:bg-white/30
                  hover:text-blue-800
                  font-bold
                  w-full sm:w-auto
                  h-14
                  rounded-xl
                  flex items-center justify-center
                  text-base sm:text-lg
                  transition-all
                  shadow-md
                  backdrop-blur
                  focus-visible:ring-4
                  ring-white/30
                  "
              >
                <Link to="/client-dashboard" className="w-full h-full flex items-center justify-center">
                  Join as Client
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>;
};
export default Index;
