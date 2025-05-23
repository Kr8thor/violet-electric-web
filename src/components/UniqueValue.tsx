
const UniqueValue = () => {
  const pillars = [
    {
      title: "Neuroscience-Backed Approach",
      description: "Every strategy is grounded in cutting-edge brain research and proven behavioral science principles."
    },
    {
      title: "Authentic Leadership Style",
      description: "Genuine, heart-centered communication that creates deep connection and lasting transformation."
    },
    {
      title: "Measurable Results",
      description: "Tangible outcomes that drive performance, engagement, and organizational success."
    },
    {
      title: "Channel V™ Framework",
      description: "A proprietary 5-channel system that creates systematic, sustainable change from within."
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-violet-900 to-violet-800 text-white">
      <div className="container-max section-padding">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Why Choose Violet?
          </h2>
          <p className="text-xl text-violet-200 max-w-3xl mx-auto leading-relaxed">
            Four foundational pillars that set Violet apart as a transformational speaker and coach
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-luminous-400 to-luminous-500 mx-auto mt-6"></div>
        </div>

        <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {pillars.map((pillar, index) => (
            <div 
              key={index}
              className="group animate-fade-in"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 h-full border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105">
                <div className="flex items-start space-x-4">
                  <div className="bg-luminous-400 text-violet-900 w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 mt-1">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-4 text-luminous-100">
                      {pillar.title}
                    </h3>
                    <p className="text-violet-200 leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <div className="inline-flex items-center space-x-4 bg-white/10 backdrop-blur-sm rounded-full px-8 py-4 border border-white/20">
            <span className="text-luminous-200 font-medium">Ready to transform your event?</span>
            <button className="bg-luminous-400 hover:bg-luminous-500 text-violet-900 px-6 py-2 rounded-full font-semibold transition-all duration-300 hover:scale-105">
              Book Violet Today
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UniqueValue;
