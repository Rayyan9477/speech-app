import React from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4 py-6">
        <nav className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-gray-800">
            AI Language Processor
          </Link>
          <div className="space-x-4">
            <Link to="/" className="text-gray-600 hover:text-gray-800">
              Home
            </Link>
            <a
              href="https://github.com/yourusername/ai-language-processor"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-800"
            >
              GitHub
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;

