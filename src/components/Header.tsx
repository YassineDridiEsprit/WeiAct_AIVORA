import { Sprout, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <Sprout className="h-8 w-8 text-rose-600" />
            <span className="text-xl font-bold text-gray-900">Zitounti</span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a href="#home" className="text-gray-700 hover:text-rose-600 transition-colors">Home</a>
            <a href="#about" className="text-gray-700 hover:text-rose-600 transition-colors">About</a>
            <a href="#programs" className="text-gray-700 hover:text-rose-600 transition-colors">Programs</a>
            <a href="#resources" className="text-gray-700 hover:text-rose-600 transition-colors">Resources</a>
            <a href="#community" className="text-gray-700 hover:text-rose-600 transition-colors">Community</a>
            <Link to="/trace" className="text-gray-700 hover:text-rose-600 transition-colors">
                Check Olive Oil Batch
              </Link>
            <Link to="/signup" className="bg-rose-600 text-white px-6 py-2 rounded-full hover:bg-rose-700 transition-colors">
              Join Us
            </Link>
          </div>

          <button
            className="md:hidden text-gray-700"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col space-y-4">
              <a href="#home" className="text-gray-700 hover:text-rose-600 transition-colors">Home</a>
              <a href="#about" className="text-gray-700 hover:text-rose-600 transition-colors">About</a>
              <a href="#programs" className="text-gray-700 hover:text-rose-600 transition-colors">Programs</a>
              <a href="#resources" className="text-gray-700 hover:text-rose-600 transition-colors">Resources</a>
              <a href="#community" className="text-gray-700 hover:text-rose-600 transition-colors">Community</a>
              <Link to="/trace" className="text-gray-700 hover:text-rose-600 transition-colors">
                check Olive Oil Batch
              </Link>
              <Link to="/signup" className="bg-rose-600 text-white px-6 py-2 rounded-full hover:bg-rose-700 transition-colors w-full text-center">
                Join Us
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
