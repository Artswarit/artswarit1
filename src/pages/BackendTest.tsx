
import React from 'react';
import { BackendTester } from '@/components/BackendTester';

const BackendTest: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Backend Integration Testing</h1>
        <BackendTester />
      </div>
    </div>
  );
};

export default BackendTest;
