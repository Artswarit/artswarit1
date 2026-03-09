
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";

const slides = [
  {
    id: 1,
    title: "Showcase Your Creative Talent",
    subtitle: "Join thousands of artists making an impact with their work",
    imageUrl: "https://images.unsplash.com/photo-1579546929662-711aa81148cf?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
    gradient: "from-indigo-600/80 via-purple-600/80 to-blue-600/80",
  },
  {
    id: 2,
    title: "Connect With Global Clients",
    subtitle: "Expand your reach and grow your creative business",
    imageUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1469&q=80",
    gradient: "from-blue-600/80 via-violet-600/80 to-purple-600/80",
  },
  {
    id: 3,
    title: "Monetize Your Art",
    subtitle: "Turn your passion into a sustainable career",
    imageUrl: "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
    gradient: "from-purple-600/80 via-indigo-600/80 to-blue-600/80",
  },
];

const AnimatedHeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative h-[85vh] overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-black/40"></div>
      
      {/* Animated floating elements */}
      <div className="absolute -top-20 -left-20 w-96 h-96 bg-violet-600/30 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute top-40 -right-20 w-72 h-72 bg-blue-600/30 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
      <div className="absolute -bottom-20 left-1/3 w-80 h-80 bg-indigo-600/30 rounded-full blur-3xl animate-pulse animation-delay-4000"></div>
      
      {/* Slides */}
      <div className="relative h-full">
        {slides.map((slide, index) => (
          <div 
            key={slide.id}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              index === currentSlide ? "opacity-100 z-10 scale-100" : "opacity-0 z-0 scale-105"
            }`}
          >
            <div className="relative h-full">
              <img 
                src={slide.imageUrl} 
                alt={slide.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient}`}></div>
            </div>
          </div>
        ))}
        
        {/* Content */}
        <div className="relative h-full z-20 flex items-center">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl text-white">
              <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl font-bold mb-6 animate-slide-up">
                {slides[currentSlide].title}
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-xl animate-slide-up animation-delay-300">
                {slides[currentSlide].subtitle}
              </p>
              <div className="flex flex-wrap gap-4 animate-slide-up animation-delay-600">
                <Button size="lg" variant="default" className="bg-white text-violet-600 hover:bg-gray-100 btn-glow">
                  <Link to="/signup" className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Join Now
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Slider controls */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? "w-8 bg-white" 
                  : "bg-white/50 hover:bg-white/70"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            ></button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AnimatedHeroSlider;
