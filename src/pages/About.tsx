
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';

const About = () => {
  const channels = [
    {
      number: 1,
      name: "Vision",
      description: "Clarity of purpose and direction",
      color: "from-violet-400 to-violet-600"
    },
    {
      number: 2,
      name: "Voice",
      description: "Authentic self-expression",
      color: "from-violet-500 to-violet-700"
    },
    {
      number: 3,
      name: "Vibration",
      description: "Energy and emotional state",
      color: "from-violet-600 to-violet-800"
    },
    {
      number: 4,
      name: "Value",
      description: "Core beliefs and principles",
      color: "from-violet-700 to-violet-900"
    },
    {
      number: 5,
      name: "Velocity",
      description: "Momentum and action",
      color: "from-blush-400 to-blush-600"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container-max section-padding text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-800">
            The Story of <span className="gradient-text">Transformation</span>
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-violet-600 to-blush-400 mx-auto mb-8"></div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Every transformation begins with a single decision to change the channel. 
            This is Violet's story, and the framework that's changing lives worldwide.
          </p>
        </div>
      </section>

      {/* Her Story */}
      <section className="py-24">
        <div className="container-max section-padding">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <img 
                alt="Violet's Journey" 
                className="rounded-2xl shadow-2xl" 
                src="/lovable-uploads/6a0584a7-03ac-4755-971b-23554b180595.jpg" 
              />
            </div>
            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-gray-800 mb-6">Her Journey</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                From corporate burnout to neuroscience breakthrough, Violet's journey began with a simple question: 
                "What if we could literally change the channel in our brains?"
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                After experiencing her own transformation through neuroscience-backed methodologies, 
                Violet dedicated her life to helping others unlock their extraordinary potential.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Today, she's spoken to over 100,000 people worldwide, helping organizations and 
                individuals create lasting change through the revolutionary Channel V™ framework.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Impact */}
      <section className="py-24 bg-gradient-to-r from-blush-50 to-luminous-50">
        <div className="container-max section-padding text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8 text-gray-800">
            Mission & Impact
          </h2>
          <blockquote className="text-2xl md:text-3xl font-light text-gray-700 max-w-4xl mx-auto leading-relaxed italic">
            "To empower every individual with the neuroscience tools and heart-centered wisdom 
            needed to transform their potential into extraordinary results."
          </blockquote>
        </div>
      </section>

      {/* Channel V Framework */}
      <section id="channelv" className="py-24 bg-white">
        <div className="container-max section-padding">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800">
              The <span className="gradient-text">Channel V™</span> Framework
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              A revolutionary 5-channel system that transforms how you think, feel, and perform. 
              Each channel builds upon the next, creating systematic and sustainable change.
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-violet-600 to-blush-400 mx-auto mt-6"></div>
          </div>

          <div className="grid md:grid-cols-5 gap-8 mb-16">
            {channels.map((channel, index) => (
              <div 
                key={index} 
                className="group text-center animate-fade-in hover:scale-105 transition-all duration-300" 
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`bg-gradient-to-b ${channel.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl group-hover:shadow-lg transition-all duration-300`}>
                  {channel.number}
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-800">
                  {channel.name}
                </h3>
                <p className="text-gray-600 text-sm">
                  {channel.description}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Button className="luminous-button px-8 py-4 text-lg rounded-full">
              Download the Channel V™ Guide
            </Button>
          </div>
        </div>
      </section>

      {/* Credentials */}
      <section className="py-24 bg-gray-50">
        <div className="container-max section-padding">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 text-gray-800">
              Credibility & Qualifications
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="bg-white rounded-lg p-6 shadow-lg">
                <h3 className="font-bold text-lg text-violet-700 mb-2">Neuroscience Certified</h3>
                <p className="text-gray-600">Advanced certification in applied neuroscience</p>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white rounded-lg p-6 shadow-lg">
                <h3 className="font-bold text-lg text-violet-700 mb-2">100,000+ Lives Impacted</h3>
                <p className="text-gray-600">Proven track record of transformation</p>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white rounded-lg p-6 shadow-lg">
                <h3 className="font-bold text-lg text-violet-700 mb-2">Fortune 500 Speaker</h3>
                <p className="text-gray-600">Trusted by leading organizations worldwide</p>
              </div>
            </div>
          </div>

          <div className="text-center mt-16">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="luminous-button px-8 py-4 text-lg rounded-full">
                Book Violet to Speak
              </Button>
              <Button variant="outline" className="px-8 py-4 text-lg rounded-full border-blush-200 text-violet-700 hover:bg-blush-50">
                Download Speaker Kit
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
