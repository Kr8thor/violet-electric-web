import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import IntroBrief from '@/components/IntroBrief';
import KeyHighlights from '@/components/KeyHighlights';
import UniqueValue from '@/components/UniqueValue';
import Newsletter from '@/components/Newsletter';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <Hero />
      
      <IntroBrief />
      <KeyHighlights />
      <UniqueValue />
      <Newsletter />
      <Footer />
    </div>
  );
};

export default Index;
