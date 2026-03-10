
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TrendingAlgorithm from '@/components/discovery/TrendingAlgorithm';

const Trending = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <Navbar />
      
      <main className="w-full max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8 pt-20 sm:pt-24">
        <TrendingAlgorithm />
      </main>

      <Footer />
    </div>
  );
};

export default Trending;
