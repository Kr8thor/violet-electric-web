
const KeyHighlights = () => {
  const highlights = [
    {
      title: "Channel V™ Framework",
      description: "A revolutionary 5-channel system that transforms how you think, feel, and perform.",
      icon: "⚡",
      link: "/about#channelv"
    },
    {
      title: "Keynote Speaking",
      description: "Electrifying presentations that inspire transformation and drive measurable results.",
      icon: "🎤",
      link: "/keynotes"
    },
    {
      title: "Neuroscience-Backed",
      description: "Evidence-based strategies rooted in the latest brain research and behavioral science.",
      icon: "🧠",
      link: "/about"
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="container-max section-padding">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800">
            Where Science Meets <span className="gradient-text">Transformation</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-violet-500 to-luminous-400 mx-auto"></div>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          {highlights.map((highlight, index) => (
            <div 
              key={index}
              className="group text-center animate-fade-in hover:scale-105 transition-all duration-300"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div className="bg-gradient-to-br from-violet-50 to-luminous-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg transition-all duration-300">
                <span className="text-3xl">{highlight.icon}</span>
              </div>
              
              <h3 className="text-2xl font-bold mb-4 text-gray-800 group-hover:text-violet-700 transition-colors duration-300">
                {highlight.title}
              </h3>
              
              <p className="text-gray-600 leading-relaxed mb-6">
                {highlight.description}
              </p>
              
              <a 
                href={highlight.link}
                className="inline-flex items-center text-violet-600 hover:text-violet-800 font-medium transition-colors duration-200"
              >
                Learn More 
                <span className="ml-2 transform transition-transform group-hover:translate-x-1">→</span>
              </a>
            </div>
          ))}
        </div>

        {/* Enhanced Testimonial Preview with Image */}
        <div className="mt-24 bg-gradient-to-r from-gray-50 to-violet-50 rounded-3xl p-12">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="text-left">
                <blockquote className="text-2xl md:text-3xl font-light text-gray-700 mb-8 leading-relaxed italic">
                  "Violet's Channel V™ framework didn't just change our team's performance—it transformed 
                  how we see ourselves and our potential. The results were immediate and lasting."
                </blockquote>
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-12 h-12 bg-violet-200 rounded-full"></div>
                  <div>
                    <p className="font-semibold text-gray-800">Sarah Chen</p>
                    <p className="text-gray-600">CEO, Innovation Labs</p>
                  </div>
                </div>
                <a 
                  href="/testimonials"
                  className="inline-flex items-center text-violet-600 hover:text-violet-800 font-medium transition-colors duration-200"
                >
                  Explore Impact Stories
                  <span className="ml-2">→</span>
                </a>
              </div>
              <div className="relative">
                <img 
                  src="/lovable-uploads/19e5a6ae-fc42-49a0-a27b-c0c680d038f5.png" 
                  alt="Violet in professional setting"
                  className="rounded-2xl shadow-lg w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default KeyHighlights;
