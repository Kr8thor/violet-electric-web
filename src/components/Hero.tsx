import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { EditableText } from '@/components/EditableTextFixed';
import { EditableImage, EditableButton, EditableColor, EditableContainer } from '@/components/UniversalEditingComponents';
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
    <EditableContainer field="hero_section" as="section" className="relative min-h-screen flex items-end justify-center overflow-hidden">
      {/* Video Background - Now editable */}
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
        
        {/* Fallback background image - Now editable */}
        <EditableImage
          field="hero_fallback_image"
          defaultSrc="/lovable-uploads/b915b2ba-9f64-45f7-b031-be6ce3816e80.png"
          alt="Hero background"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            videoLoaded && !videoError ? 'opacity-0' : 'opacity-100'
          }`}
        />
        
        {/* Gradient overlay - Now with editable colors */}
        <EditableColor
          field="hero_overlay_color"
          defaultColor="rgba(0,0,0,0.6)"
          property="backgroundColor"
          className="absolute inset-0 py-0 rounded my-0"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent py-0 rounded my-0"></div>
        </EditableColor>
      </div>

      {/* Content positioned lower - All text now editable */}
      <div className="relative z-10 container-max section-padding text-center pb-20 md:pb-32">
        <div className="max-w-4xl mx-auto animate-fade-in">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight text-white">
            <EditableText 
              field="hero_title"
              defaultValue="Change Your Life."
              className="bg-gradient-to-r from-luminous-300 to-blush-300 bg-clip-text text-transparent"
              as="span"
            />
            <br />
            <EditableText 
              field="hero_subtitle_line2"
              defaultValue="Transform your potential."
              className="text-white"
              as="span"
            />
          </h1>
          
          <EditableText 
            field="hero_subtitle"
            defaultValue="Transform your potential into reality with our innovative solutions"
            className="text-lg md:text-xl lg:text-2xl text-gray-100 mb-12 max-w-3xl mx-auto leading-relaxed"
            as="p"
          />

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            {/* Primary CTA Button - Now fully editable */}
            <EditableButton
              field="hero_primary_cta"
              textField="hero_cta"
              urlField="hero_cta_url"
              colorField="hero_cta_color"
              defaultText="Book a Discovery Call"
              defaultUrl="/contact"
              defaultColor="#8b5cf6"
              className="luminous-button px-8 py-4 text-lg rounded-full"
              target="_self"
            />

            {/* Secondary CTA Button - Now fully editable */}
            <EditableButton
              field="hero_secondary_cta"
              textField="hero_cta_secondary"
              urlField="hero_cta_secondary_url"
              colorField="hero_cta_secondary_color"
              defaultText="Watch Violet in Action"
              defaultUrl="https://www.youtube.com/@VioletRainwater"
              defaultColor="rgba(255,255,255,0.1)"
              className="px-8 py-4 text-lg rounded-full border-2 border-white/30 hover:bg-white/10 transition-all duration-300 backdrop-blur-sm text-blush-300"
              target="_blank"
            />
          </div>

          {/* Optional: Editable hero image/illustration below the text */}
          <div className="mt-16">
            <EditableImage
              field="hero_main_image"
              defaultSrc=""
              alt="Hero illustration"
              className="max-w-4xl mx-auto rounded-lg shadow-2xl"
            />
          </div>
        </div>
      </div>

      {/* Debug info in development - Keep as is */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-4 left-4 z-50 bg-black/80 text-white p-2 rounded text-xs">
          Video Status: {videoError ? '❌ Error' : videoLoaded ? '✅ Loaded' : '⏳ Loading...'}
        </div>
      )}
    </EditableContainer>
  );
};

export default Hero;
