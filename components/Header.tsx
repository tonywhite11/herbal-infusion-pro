
import React from 'react';
import { LeafIcon } from './Icons';

const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-6 shadow-lg">
      <div className="container mx-auto flex items-center justify-center">
        <LeafIcon className="h-10 w-10 mr-3 text-green-300" />
        <h1 className="text-4xl font-bold tracking-tight">Herbal Infusion AI</h1>
      </div>
    </header>
  );
};

export default Header;
