import EditableText from './EditableText';
import { EditableButton, EditableContainer } from '@/components/UniversalEditingComponents';

const UniqueValue = () => {
  const pillars = [
    {
      title: "Neuroscience-Backed Approach",
      description: "Every strategy is grounded in cutting-edge brain research and proven behavioral science principles.",
      field: "pillar_1"
    },
    {
      title: "Authentic Leadership Style",
      description: "Genuine, heart-centered communication that creates deep connection and lasting transformation.",
      field: "pillar_2"
    },
    {
      title: "Measurable Results",
      description: "Tangible outcomes that drive performance, engagement, and organizational success.",
      field: "pillar_3"
    },
    {
      title: "Channel V™ Framework",
      description: "A proprietary 5-channel system that creates systematic, sustainable change from within.",
      field: "pillar_4"
    }
  ];

  return (
    <EditableContainer field="unique_value_section" as="section" className="py-24 bg-gradient-to-b from-[#5e2664] to-violet-800 text-white">
      <div className="container-max section-padding">
        <div className="text-center mb-16">
          <EditableText
            field="unique_value_title"
            defaultValue="Why Choose Violet?"
            as="h2"
            className="text-4xl md:text-5xl font-bold mb-6"
          />
          <EditableText
            field="unique_value_subtitle"
            defaultValue="Four foundational pillars that set Violet apart as a transformational speaker and coach"
            as="p"
            className="text-xl text-blush-200 max-w-3xl mx-auto leading-relaxed"
          />
          <div className="w-24 h-1 bg-gradient-to-r from-luminous-400 to-blush-400 mx-auto mt-6"></div>
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
                  <div className="bg-blush-400 text-violet-900 w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 mt-1">
                    {index + 1}
                  </div>
                  <div>
                    <EditableText
                      field={`${pillar.field}_title`}
                      defaultValue={pillar.title}
                      as="h3"
                      className="text-xl font-bold mb-4 text-luminous-100"
                    />
                    <EditableText
                      field={`${pillar.field}_description`}
                      defaultValue={pillar.description}
                      as="p"
                      className="text-blush-200 leading-relaxed"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <div className="inline-flex items-center space-x-4 bg-white/10 backdrop-blur-sm rounded-full px-8 py-4 border border-white/20">
            <EditableText
              field="unique_value_cta_text"
              defaultValue="Ready to transform your event?"
              as="span"
              className="text-blush-200 font-medium"
            />
            <EditableButton
              field="unique_value_cta_button"
              textField="unique_value_cta_button_text"
              urlField="unique_value_cta_button_url"
              colorField="unique_value_cta_button_color"
              defaultText="Book Violet Today"
              defaultUrl="/contact"
              defaultColor="#f3a8b6"
              className="bg-blush-400 hover:bg-blush-500 text-violet-900 px-6 py-2 rounded-full font-semibold transition-all duration-300 hover:scale-105"
              target="_self"
            />
          </div>
        </div>
      </div>
    </EditableContainer>
  );
};

export default UniqueValue;