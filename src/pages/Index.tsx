import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import IntroBrief from '@/components/IntroBrief';
import KeyHighlights from '@/components/KeyHighlights';
import UniqueValue from '@/components/UniqueValue';
import Newsletter from '@/components/Newsletter';
import Footer from '@/components/Footer';
import WordPressBackendStatus from '@/components/WordPressBackendStatus';

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <Hero />
      
      {/* WordPress Backend Status - Shows headless WordPress connection */}
      <div className="py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <WordPressBackendStatus />
        </div>
      </div>
      
      <IntroBrief />
      <KeyHighlights />
      <UniqueValue />
      <Newsletter />
      <Footer />
    </div>
  );
};

export default Index;
