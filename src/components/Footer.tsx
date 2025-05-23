
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="container-max section-padding">
        <div className="grid md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <h3 className="text-2xl font-bold gradient-text mb-4">Violet Rainwater</h3>
            <p className="text-gray-400 leading-relaxed mb-6">
              Transforming potential with neuroscience and heart. 
              Change the channel. Change your life.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-violet-400 transition-colors duration-200">
                LinkedIn
              </a>
              <a href="#" className="text-gray-400 hover:text-violet-400 transition-colors duration-200">
                Instagram
              </a>
              <a href="#" className="text-gray-400 hover:text-violet-400 transition-colors duration-200">
                YouTube
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-violet-300">Quick Links</h4>
            <div className="space-y-3">
              <Link to="/about" className="block text-gray-400 hover:text-white transition-colors duration-200">
                About Violet
              </Link>
              <Link to="/keynotes" className="block text-gray-400 hover:text-white transition-colors duration-200">
                Keynote Topics
              </Link>
              <Link to="/testimonials" className="block text-gray-400 hover:text-white transition-colors duration-200">
                Success Stories
              </Link>
              <Link to="/contact" className="block text-gray-400 hover:text-white transition-colors duration-200">
                Get in Touch
              </Link>
            </div>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold mb-4 text-violet-300">Resources</h4>
            <div className="space-y-3">
              <a href="#" className="block text-gray-400 hover:text-white transition-colors duration-200">
                Channel V™ Guide
              </a>
              <a href="#" className="block text-gray-400 hover:text-white transition-colors duration-200">
                Speaker Kit
              </a>
              <a href="#" className="block text-gray-400 hover:text-white transition-colors duration-200">
                Blog
              </a>
              <a href="#" className="block text-gray-400 hover:text-white transition-colors duration-200">
                Media Kit
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 mb-4 md:mb-0">
              © 2024 Violet Rainwater. All rights reserved.
            </p>
            <button className="luminous-button px-6 py-2 rounded-full">
              Book Violet
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
