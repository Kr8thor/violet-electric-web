import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navItems = [{
    name: 'Home',
    href: '/'
  }, {
    name: 'About',
    href: '/about'
  }, {
    name: 'Keynotes',
    href: '/keynotes'
  }, {
    name: 'Testimonials',
    href: '/testimonials'
  }, {
    name: 'Contact',
    href: '/contact'
  }];
  return <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="container-max section-padding">
        <div className="flex items-center justify-between h-20 bg-gray-400">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <img src="/lovable-uploads/4a037212-f4a5-420d-ad52-9064e5032e1d.png" alt="Violet Rainwater Logo" className="h-12 w-auto" />
            <span className="text-2xl font-bold gradient-text">Violet Rainwater</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map(item => <Link key={item.name} to={item.href} className="text-gray-600 hover:text-violet-700 font-medium transition-colors duration-200 relative group">
                {item.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-violet-700 transition-all duration-300 group-hover:w-full"></span>
              </Link>)}
            <Button className="luminous-button px-6 py-2 rounded-full">
              Book Violet
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <div className="w-6 h-6 flex flex-col justify-center items-center">
              <span className={`bg-gray-800 block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${isMenuOpen ? 'rotate-45 translate-y-1' : '-translate-y-0.5'}`}></span>
              <span className={`bg-gray-800 block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm my-0.5 ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
              <span className={`bg-gray-800 block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${isMenuOpen ? '-rotate-45 -translate-y-1' : 'translate-y-0.5'}`}></span>
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && <div className="md:hidden py-4 border-t border-gray-100">
            {navItems.map(item => <Link key={item.name} to={item.href} className="block py-3 text-gray-600 hover:text-violet-700 font-medium transition-colors duration-200" onClick={() => setIsMenuOpen(false)}>
                {item.name}
              </Link>)}
            <Button className="luminous-button w-full mt-4 rounded-full">
              Book Violet
            </Button>
          </div>}
      </div>
    </nav>;
};
export default Navigation;