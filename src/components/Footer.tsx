import { Sprout, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div>
            <div className="flex items-center space-x-2 mb-6">
              <Sprout className="h-8 w-8 text-rose-500" />
              <span className="text-xl font-bold text-white">Zitounti</span>
            </div>
            <p className="text-gray-400 leading-relaxed mb-6">
              Empowering women in agriculture through education, community, and resources for sustainable farming success.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="bg-gray-800 p-2 rounded-lg hover:bg-rose-600 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="bg-gray-800 p-2 rounded-lg hover:bg-rose-600 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="bg-gray-800 p-2 rounded-lg hover:bg-rose-600 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="bg-gray-800 p-2 rounded-lg hover:bg-rose-600 transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-white font-bold text-lg mb-6">Quick Links</h3>
            <ul className="space-y-3">
              <li><a href="#about" className="hover:text-rose-500 transition-colors">About Us</a></li>
              <li><a href="#programs" className="hover:text-rose-500 transition-colors">Programs</a></li>
              <li><a href="#resources" className="hover:text-rose-500 transition-colors">Resources</a></li>
              <li><a href="#community" className="hover:text-rose-500 transition-colors">Community</a></li>
              <li><a href="#" className="hover:text-rose-500 transition-colors">Blog</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold text-lg mb-6">Support</h3>
            <ul className="space-y-3">
              <li><a href="#" className="hover:text-rose-500 transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-rose-500 transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-rose-500 transition-colors">FAQs</a></li>
              <li><a href="#" className="hover:text-rose-500 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-rose-500 transition-colors">Terms of Service</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold text-lg mb-6">Contact Info</h3>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-rose-500 mt-0.5 flex-shrink-0" />
                <span>123 Agriculture Avenue, Green Valley, CA 94000</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-rose-500 flex-shrink-0" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-rose-500 flex-shrink-0" />
                <span>hello@zitounti.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © 2025 Zitounti. All rights reserved.
            </p>
            <p className="text-gray-400 text-sm">
              Made with <span className="text-rose-500">♥</span> for women in agriculture
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
