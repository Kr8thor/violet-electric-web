import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'react-router-dom';
import { useWordPressSiteContent } from '@/hooks/useWordPressSiteContent';
import { EditableImage, EditableLink } from './UniversalEditingComponents';
import EditableText from './EditableText';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { siteTitle, loading } = useWordPressSiteContent();
  const location = useLocation();
  
  // CRITICAL FIX: Preserve query parameters for editing mode
  const preserveQueryParams = (path: string) => {
    // Get current query parameters
    const currentParams = location.search;
    // Return the path with preserved query parameters
    return `${path}${currentParams}`;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-violet-600 w-full">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo - Now fully editable */}
          <Link to={preserveQueryParams("/")} className="flex items-center space-x-3">
            <EditableImage
              field="nav_logo"
              defaultSrc="/lovable-uploads/4a037212-f4a5-420d-ad52-9064e5032e1d.png"
              alt="Violet Rainwater Logo"
              className="h-12 w-auto"
            />
            <span className="text-2xl font-bold gradient-text text-slate-50">
              <EditableText
                field="nav_site_title"
                defaultValue={loading ? 'Violet Rainwater' : siteTitle || 'Violet Rainwater'}
                as="span"
                className="text-2xl font-bold gradient-text text-slate-50"
              />
            </span>
          </Link>

          {/* Desktop Navigation - Fixed to use Link and preserve params */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to={preserveQueryParams("/")}
              className="text-white hover:text-white font-medium transition-colors duration-200 relative group"
            >
              <EditableText field="nav_home" defaultValue="Home" />
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-violet-700 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link
              to={preserveQueryParams("/about")}
              className="text-white hover:text-white font-medium transition-colors duration-200 relative group"
            >
              <EditableText field="nav_about" defaultValue="About" />
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-violet-700 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link
              to={preserveQueryParams("/keynotes")}
              className="text-white hover:text-white font-medium transition-colors duration-200 relative group"
            >
              <EditableText field="nav_keynotes" defaultValue="Keynotes" />
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-violet-700 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link
              to={preserveQueryParams("/testimonials")}
              className="text-white hover:text-white font-medium transition-colors duration-200 relative group"
            >
              <EditableText field="nav_testimonials" defaultValue="Testimonials" />
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-violet-700 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link
              to={preserveQueryParams("/contact")}
              className="text-white hover:text-white font-medium transition-colors duration-200 relative group"
            >
              <EditableText field="nav_contact" defaultValue="Contact" />
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-violet-700 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link
              to={preserveQueryParams("/contact")}
              className="luminous-button px-6 py-2 rounded-full"
              style={{ backgroundColor: '#fbbf24', color: '#fff' }}
            >
              <EditableText field="nav_book_violet" defaultValue="Book Violet" />
            </Link>
          </div>

          {/* Mobile Menu Button - Keep exactly the same */}
          <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <div className="w-6 h-6 flex flex-col justify-center items-center">
              <span className={`bg-white block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${isMenuOpen ? 'rotate-45 translate-y-1' : '-translate-y-0.5'}`}></span>
              <span className={`bg-white block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm my-0.5 ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
              <span className={`bg-white block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${isMenuOpen ? '-rotate-45 -translate-y-1' : 'translate-y-0.5'}`}></span>
            </div>
          </button>
        </div>

        {/* Mobile Menu - Also fixed to preserve params */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-violet-700">
            <Link
              to={preserveQueryParams("/")}
              className="block py-3 text-white hover:text-violet-200 font-medium transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              <EditableText field="nav_home_mobile" defaultValue="Home" />
            </Link>

            <Link
              to={preserveQueryParams("/about")}
              className="block py-3 text-white hover:text-violet-200 font-medium transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              <EditableText field="nav_about_mobile" defaultValue="About" />
            </Link>

            <Link
              to={preserveQueryParams("/keynotes")}
              className="block py-3 text-white hover:text-violet-200 font-medium transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              <EditableText field="nav_keynotes_mobile" defaultValue="Keynotes" />
            </Link>

            <Link
              to={preserveQueryParams("/testimonials")}
              className="block py-3 text-white hover:text-violet-200 font-medium transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              <EditableText field="nav_testimonials_mobile" defaultValue="Testimonials" />
            </Link>

            <Link
              to={preserveQueryParams("/contact")}
              className="block py-3 text-white hover:text-violet-200 font-medium transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              <EditableText field="nav_contact_mobile" defaultValue="Contact" />
            </Link>

            <Link to={preserveQueryParams("/contact")} onClick={() => setIsMenuOpen(false)}>
              <Button className="luminous-button w-full mt-4 rounded-full">
                <EditableText
                  field="nav_cta_button_mobile"
                  defaultValue="Book Violet"
                  as="span"
                />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;