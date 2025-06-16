
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { EditableText, EditableH1, EditableP } from '@/components/EditableText';
import { useState, useRef, useEffect } from 'react';

const Hero = () => {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedData = () => {
      setVideoLoaded(true);
      console.log('✅ Hero video loaded successfully');
    };

    const handleError = (e: Event) => {
      setVideoError(true);
      console.error('❌ Hero video failed to load:', e);
    };

    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('error', handleError);
    };
  }, []);

  return (
    <section className="relative min-h-screen flex items-end justify-center overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0">
        <video
          ref={videoRef}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            videoLoaded && !videoError ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ 
            transform: 'translateY(5rem)', // Move video down by ~5cm (5rem = ~80px = ~5.3cm at 96dpi)
            height: 'calc(100% + 5rem)' // Extend height to avoid gaps at bottom
          }}
          autoPlay
          loop
          muted
          playsInline
          poster="/lovable-uploads/b915b2ba-9f64-45f7-b031-be6ce3816e80.png"
        >
          <source src="/videos/hero-video.mp4" type="video/mp4" />
        </video>
        
        {/* Fallback background image */}
        <div 
          className={`absolute inset-0 transition-opacity duration-1000 ${
            videoLoaded && !videoError ? 'opacity-0' : 'opacity-100'
          }`}
          style={{
            backgroundImage: "url('/lovable-uploads/b915b2ba-9f64-45f7-b031-be6ce3816e80.png')",
            backgroundPosition: "center calc(-10% + 5rem)", // Move background down to match video
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            transform: 'translateY(5rem)', // Move fallback image down by same amount
            height: 'calc(100% + 5rem)' // Extend height to avoid gaps
          }}
        ></div>
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent py-0 rounded my-0"></div>
      </div>

      {/* Content positioned lower */}
      <div className="relative z-10 container-max section-padding text-center pb-20 md:pb-32">
        <div className="max-w-4xl mx-auto animate-fade-in">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight text-white">
            <EditableText 
              field="hero_title"
              defaultValue="Change The Channel"
              className="bg-gradient-to-r from-luminous-300 to-blush-300 bg-clip-text text-transparent"
              as="span"
            />
          </h1>
          
          <EditableP 
            field="hero_subtitle"
            defaultValue="Transform your potential with neuroscience-backed strategies and heart-centered leadership. Discover the power within you to create extraordinary results."
            className="text-lg md:text-xl lg:text-2xl text-gray-100 mb-12 max-w-3xl mx-auto leading-relaxed"
          />

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link to="/contact">
              <Button className="luminous-button px-8 py-4 text-lg rounded-full">
                <EditableText 
                  field="hero_cta"
                  defaultValue="Book Violet"
                />
              </Button>
            </Link>
            <Button 
              variant="outline" 
              className="px-8 py-4 text-lg rounded-full border-2 border-white/30 hover:bg-white/10 transition-all duration-300 backdrop-blur-sm text-blush-300"
              onClick={() => window.open('https://www.youtube.com/@VioletRainwater', '_blank')}
            >
              <EditableText 
                field="hero_cta_secondary"
                defaultValue="Watch Violet in Action"
              />
            </Button>
          </div>
        </div>
      </div>

      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-4 left-4 z-50 bg-black/80 text-white p-2 rounded text-xs">
          Video Status: {videoError ? '❌ Error' : videoLoaded ? '✅ Loaded' : '⏳ Loading...'}
        </div>
      )}
    </section>
  );
};

export default Hero;
