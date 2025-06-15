
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AdvancedCommissions from '@/components/commerce/AdvancedCommissions';

const Commissions = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 pt-24">
        <AdvancedCommissions />
      </main>

      <Footer />
    </div>
  );
};

export default Commissions;
