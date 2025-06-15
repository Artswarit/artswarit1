
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ContentCollections from '@/components/collections/ContentCollections';

const Collections = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 pt-24">
        <ContentCollections />
      </main>

      <Footer />
    </div>
  );
};

export default Collections;
