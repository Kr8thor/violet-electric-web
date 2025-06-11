import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useWordPressSiteContent } from '@/hooks/useWordPressSiteContent';
import { EditableImage, EditableLink } from './UniversalEditingComponents';
import { EditableText } from './EditableTextFixed';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { siteTitle, loading } = useWordPressSiteContent();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-violet-600 w-full">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo - Now fully editable */}
          <Link to="/" className="flex items-center space-x-3">
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

          {/* Desktop Navigation - All links now editable */}
          <div className="hidden md:flex items-center space-x-8">
            <EditableLink
              field="nav_home"
              textField="nav_home_text"
              urlField="nav_home_url"
              defaultText="Home"
              defaultUrl="/"
              className="text-white hover:text-white font-medium transition-colors duration-200 relative group"
            >
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-violet-700 transition-all duration-300 group-hover:w-full"></span>
            </EditableLink>

            <EditableLink
              field="nav_about"
              textField="nav_about_text"
              urlField="nav_about_url"
              defaultText="About"
              defaultUrl="/about"
              className="text-white hover:text-white font-medium transition-colors duration-200 relative group"
            >
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-violet-700 transition-all duration-300 group-hover:w-full"></span>
            </EditableLink>

            <EditableLink
              field="nav_keynotes"
              textField="nav_keynotes_text"
              urlField="nav_keynotes_url"
              defaultText="Keynotes"
              defaultUrl="/keynotes"
              className="text-white hover:text-white font-medium transition-colors duration-200 relative group"
            >
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-violet-700 transition-all duration-300 group-hover:w-full"></span>
            </EditableLink>

            <EditableLink
              field="nav_testimonials"
              textField="nav_testimonials_text"
              urlField="nav_testimonials_url"
              defaultText="Testimonials"
              defaultUrl="/testimonials"
              className="text-white hover:text-white font-medium transition-colors duration-200 relative group"
            >
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-violet-700 transition-all duration-300 group-hover:w-full"></span>
            </EditableLink>

            <EditableLink
              field="nav_contact"
              textField="nav_contact_text"
              urlField="nav_contact_url"
              defaultText="Contact"
              defaultUrl="/contact"
              className="text-white hover:text-white font-medium transition-colors duration-200 relative group"
            >
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-violet-700 transition-all duration-300 group-hover:w-full"></span>
            </EditableLink>

            <Link to="/contact">
              <Button className="luminous-button px-6 py-2 rounded-full">
                <EditableText
                  field="nav_cta_button"
                  defaultValue="Book Violet"
                  as="span"
                />
              </Button>
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

        {/* Mobile Menu - Also editable */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-violet-700">
            <EditableLink
              field="nav_home_mobile"
              textField="nav_home_text"
              urlField="nav_home_url"
              defaultText="Home"
              defaultUrl="/"
              className="block py-3 text-white hover:text-violet-200 font-medium transition-colors duration-200"
              target="_self"
            />

            <EditableLink
              field="nav_about_mobile"
              textField="nav_about_text"
              urlField="nav_about_url"
              defaultText="About"
              defaultUrl="/about"
              className="block py-3 text-white hover:text-violet-200 font-medium transition-colors duration-200"
              target="_self"
            />

            <EditableLink
              field="nav_keynotes_mobile"
              textField="nav_keynotes_text"
              urlField="nav_keynotes_url"
              defaultText="Keynotes"
              defaultUrl="/keynotes"
              className="block py-3 text-white hover:text-violet-200 font-medium transition-colors duration-200"
              target="_self"
            />

            <EditableLink
              field="nav_testimonials_mobile"
              textField="nav_testimonials_text"
              urlField="nav_testimonials_url"
              defaultText="Testimonials"
              defaultUrl="/testimonials"
              className="block py-3 text-white hover:text-violet-200 font-medium transition-colors duration-200"
              target="_self"
            />

            <EditableLink
              field="nav_contact_mobile"
              textField="nav_contact_text"
              urlField="nav_contact_url"
              defaultText="Contact"
              defaultUrl="/contact"
              className="block py-3 text-white hover:text-violet-200 font-medium transition-colors duration-200"
              target="_self"
            />

            <Link to="/contact" onClick={() => setIsMenuOpen(false)}>
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
