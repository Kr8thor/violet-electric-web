import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import IntroBrief from '@/components/IntroBrief';
import KeyHighlights from '@/components/KeyHighlights';
import UniqueValue from '@/components/UniqueValue';
import Newsletter from '@/components/Newsletter';
import Footer from '@/components/Footer';
import EditableText from '@/components/EditableText';

// ONLY ADD: Small WordPress status test
// import WordPressBackendStatus from '@/components/WordPressBackendStatus';

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Keep ALL your beautiful design */}
      <Navigation />
      <Hero />
      
      <IntroBrief />
      <KeyHighlights />
      <UniqueValue />
      <Newsletter />
      <Footer />
      
      {/* ONLY ADD: Small status indicator in bottom corner */}
      {/* <div className="fixed bottom-4 right-4 z-50 max-w-xs opacity-90">
        <WordPressBackendStatus />
      </div> */}
    </div>
  );
};

export default Index;
