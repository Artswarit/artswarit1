
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TrendingAlgorithm from '@/components/discovery/TrendingAlgorithm';

const TrendingPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 pt-24">
        <TrendingAlgorithm />
      </main>
      <Footer />
    </div>
  );
};

export default TrendingPage;
