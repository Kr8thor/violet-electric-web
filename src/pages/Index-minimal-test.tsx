// MINIMAL WORDPRESS TEST - Keep your beautiful design!
import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import IntroBrief from '@/components/IntroBrief';
import KeyHighlights from '@/components/KeyHighlights';
import UniqueValue from '@/components/UniqueValue';
import Newsletter from '@/components/Newsletter';
import Footer from '@/components/Footer';

// Add WordPress status component ONLY
import WordPressBackendStatus from '@/components/WordPressBackendStatus';

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Keep all your beautiful components */}
      <Navigation />
      <Hero />
      
      <IntroBrief />
      <KeyHighlights />
      <UniqueValue />
      <Newsletter />
      <Footer />
      
      {/* ONLY ADD: WordPress status indicator (tiny, bottom-right corner) */}
      <div className="fixed bottom-4 right-4 z-50 max-w-xs">
        <WordPressBackendStatus />
      </div>
    </div>
  );
};

export default Index;
