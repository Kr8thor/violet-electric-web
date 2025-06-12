import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import EditableText from '@/components/EditableText';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">
          <EditableText field="notfound_title" defaultValue="404" />
        </h1>
        <p className="text-xl text-gray-600 mb-4">
          <EditableText field="notfound_subtitle" defaultValue="Oops! Page not found" />
        </p>
        <a href="/" className="text-blue-500 hover:text-blue-700 underline">
          <EditableText field="notfound_return_home" defaultValue="Return to Home" />
        </a>
      </div>
    </div>
  );
};

export default NotFound;
