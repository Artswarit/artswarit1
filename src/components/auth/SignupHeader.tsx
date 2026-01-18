import { Link, useSearchParams } from "react-router-dom";
import { Sparkles } from "lucide-react";

const SignupHeader = () => {
  const [searchParams] = useSearchParams();
  const role = searchParams.get('role');

  const getWelcomeMessage = () => {
    if (role === 'artist') {
      return {
        title: "Welcome to Artswarit ✨",
        subtitle: "Turn your creativity into meaningful work.",
        description: "Join our community of artists and start earning from your passion."
      };
    }
    if (role === 'client') {
      return {
        title: "Find Your Perfect Artist",
        subtitle: "Discover talented creators for your next idea.",
        description: "Browse verified artists, discuss your vision, and bring it to life."
      };
    }
    return {
      title: "Welcome to Artswarit ✨",
      subtitle: "Where creativity meets opportunity.",
      description: "Join as an artist or find the perfect creator for your project."
    };
  };

  const message = getWelcomeMessage();

  return (
    <div className="text-center px-2">
      <div className="flex items-center justify-center gap-2 mb-2">
        <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
          {message.title}
        </h1>
      </div>
      <p className="text-lg sm:text-xl text-primary font-medium mb-2">
        {message.subtitle}
      </p>
      <p className="text-sm sm:text-base text-gray-600 mb-4">
        {message.description}
      </p>
      
      {/* Trust indicators */}
      <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground mb-4">
        <span className="flex items-center gap-1">
          <Sparkles className="h-3 w-3 text-yellow-500" />
          Friendly
        </span>
        <span>•</span>
        <span>Supportive</span>
        <span>•</span>
        <span>Transparent</span>
        <span>•</span>
        <span>No dark patterns</span>
      </div>

      <p className="text-sm text-gray-600">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-artswarit-purple hover:text-artswarit-purple-dark underline">
          Log in
        </Link>
      </p>
    </div>
  );
};

export default SignupHeader;
