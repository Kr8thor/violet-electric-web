import { Button } from '@/components/ui/button';
const Hero = () => {
  return <section className="relative min-h-screen flex items-end justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-cover bg-center" style={{
        backgroundImage: "url('/lovable-uploads/693ead34-c2b8-464b-b462-5fac93257ea3.png')"
      }}></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent py-0 rounded my-0"></div>
      </div>

      {/* Content positioned lower */}
      <div className="relative z-10 container-max section-padding text-center pb-20 md:pb-32">
        <div className="max-w-4xl mx-auto animate-fade-in">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight text-white">
            <span className="bg-gradient-to-r from-violet-300 to-violet-100 bg-clip-text text-transparent">Change the Channel.</span>
            <br />
            <span className="text-white">Change Your Life.</span>
          </h1>
          
          <p className="text-lg md:text-xl lg:text-2xl text-gray-100 mb-12 max-w-3xl mx-auto leading-relaxed">
            Transform your potential with neuroscience-backed strategies and heart-centered leadership. 
            Discover the power within you to create extraordinary results.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button className="luminous-button px-8 py-4 text-lg rounded-full">
              Book Violet
            </Button>
            <Button variant="outline" className="px-8 py-4 text-lg rounded-full border-2 border-white/30 hover:bg-white/10 transition-all duration-300 backdrop-blur-sm text-purple-300">
              Watch Violet in Action
            </Button>
          </div>
        </div>
      </div>

      {/* Decorative scroll indicator */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>;
};
export default Hero;