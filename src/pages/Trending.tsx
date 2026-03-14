
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TrendingAlgorithm from '@/components/discovery/TrendingAlgorithm';

const Trending = () => {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.03),transparent_50%),radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.03),transparent_50%)] pointer-events-none" />
      <Navbar />
      
      <main className="w-full max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-6 py-12 sm:py-16 pt-24 sm:pt-32">
        <TrendingAlgorithm />
      </main>

      <Footer />
    </div>
  );
};

export default Trending;
