
import { Button } from '@/components/ui/button';

const IntroBrief = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="container-max section-padding">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="animate-fade-in">
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Violet Rainwater"
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-violet-100 rounded-full opacity-60"></div>
              <div className="absolute -top-6 -left-6 w-16 h-16 bg-luminous-100 rounded-full opacity-60"></div>
            </div>
          </div>
          
          <div className="space-y-8 animate-fade-in">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800">
                Violet Rainwater
              </h2>
              <div className="w-20 h-1 bg-gradient-to-r from-violet-500 to-luminous-400 mb-6"></div>
              <p className="text-xl text-gray-600 leading-relaxed">
                Transforming potential with neuroscience and heart. Violet combines cutting-edge research 
                with authentic leadership to help individuals and organizations unlock their extraordinary capabilities.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <div className="bg-white px-4 py-2 rounded-full border border-violet-100 text-violet-700 font-medium">
                Neuroscience Expert
              </div>
              <div className="bg-white px-4 py-2 rounded-full border border-violet-100 text-violet-700 font-medium">
                Keynote Speaker
              </div>
              <div className="bg-white px-4 py-2 rounded-full border border-violet-100 text-violet-700 font-medium">
                Transformation Coach
              </div>
            </div>
            
            <Button 
              variant="outline" 
              className="border-violet-200 text-violet-700 hover:bg-violet-50 px-6 py-3 rounded-full transition-all duration-300"
            >
              Learn More About Violet
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default IntroBrief;
