
import React from 'react';
import { DEFAULT_DISCLAIMER } from '../constants';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-gray-300 p-8 mt-12 text-sm">
      <div className="container mx-auto text-center">
        <p className="mb-4">{DEFAULT_DISCLAIMER}</p>
        <p>&copy; {new Date().getFullYear()} Herbal Infusion AI. All rights reserved.</p>
        <p className="mt-2 text-xs text-gray-500">
          AI-generated content. Always verify information and consult professionals.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
