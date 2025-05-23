
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';

const Keynotes = () => {
  const keynotes = [
    {
      title: "Change the Channel: The Neuroscience of Transformation",
      description: "Discover how the revolutionary Channel V™ framework can transform your organization's potential into tangible results through neuroscience-backed methodologies.",
      takeaways: [
        "Understand the five channels that drive human behavior and performance",
        "Learn practical techniques to shift mindsets at both individual and team levels",
        "Develop strategies to sustain positive change through neuroplasticity"
      ]
    },
    {
      title: "High-Voltage Leadership: Energizing Teams Through Change",
      description: "Equip leaders with cutting-edge tools to navigate complexity, foster innovation, and create resilient, high-performing teams.",
      takeaways: [
        "Master the art of energy management in leadership communication",
        "Build psychological safety that encourages innovation and risk-taking",
        "Create sustainable motivation systems that prevent burnout"
      ]
    },
    {
      title: "The Extraordinary Brain: Unlocking Your Hidden Potential",
      description: "A deep dive into the latest neuroscience research on peak performance, creativity, and human potential.",
      takeaways: [
        "Discover how to harness your brain's natural capacity for growth and innovation",
        "Learn evidence-based techniques for improved focus, creativity, and decision-making",
        "Develop personalized strategies for cognitive optimization and peak performance"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container-max section-padding text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-800">
            Transformative <span className="gradient-text">Keynotes</span>
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-violet-500 to-luminous-400 mx-auto mb-8"></div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Powerful, science-backed presentations that inspire lasting change.
            Each keynote is customized to meet your organization's specific needs and objectives.
          </p>
        </div>
      </section>

      {/* Keynotes Listing */}
      <section className="py-24">
        <div className="container-max section-padding">
          <div className="space-y-20">
            {keynotes.map((keynote, index) => (
              <div 
                key={index} 
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="space-y-6">
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
                    {keynote.title}
                  </h2>
                  <div className="w-16 h-1 bg-violet-600"></div>
                  <p className="text-xl text-gray-700 leading-relaxed">
                    {keynote.description}
                  </p>
                  
                  <div className="mt-8">
                    <h3 className="text-xl font-semibold mb-4 text-gray-800">Key Takeaways:</h3>
                    <ul className="space-y-3">
                      {keynote.takeaways.map((takeaway, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="mr-3 text-violet-600">•</span>
                          <span className="text-lg text-gray-600">{takeaway}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="pt-6">
                    <Button 
                      variant="outline" 
                      className="border-violet-200 text-violet-700 hover:bg-violet-50"
                    >
                      Inquire About This Keynote
                    </Button>
                  </div>
                </div>
                
                {index < keynotes.length - 1 && (
                  <div className="mt-16 border-b border-gray-200"></div>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-20 py-12 px-8 md:px-12 bg-gradient-to-r from-violet-50 to-luminous-50 rounded-2xl text-center shadow-sm">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800">
              Transform Your Next Event
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
              Bring Violet's electrifying presence and transformative insights to your organization. 
              All keynotes can be customized for virtual or in-person delivery.
            </p>
            <Button className="luminous-button px-8 py-4 text-lg rounded-full">
              Book Violet
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Keynotes;
