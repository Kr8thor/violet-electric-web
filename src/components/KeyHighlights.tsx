import { EditableText } from '@/components/EditableTextFixed';
import { EditableImage, EditableLink, EditableContainer } from '@/components/UniversalEditingComponents';

const KeyHighlights = () => {
  const highlights = [
    {
      title: "Channel V™ Framework",
      description: "A revolutionary 5-channel system that transforms how you think, feel, and perform.",
      icon: "⚡",
      link: "/about#channelv",
      field: "highlight_1"
    },
    {
      title: "Keynote Speaking",
      description: "Electrifying presentations that inspire transformation and drive measurable results.",
      icon: "🎤",
      link: "/keynotes",
      field: "highlight_2"
    },
    {
      title: "Neuroscience-Backed",
      description: "Evidence-based strategies rooted in the latest brain research and behavioral science.",
      icon: "🧠",
      link: "/about",
      field: "highlight_3"
    }
  ];

  return (
    <EditableContainer field="key_highlights_section" as="section" className="py-24 bg-white">
      <div className="container-max section-padding">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800">
            <EditableText
              field="highlights_main_title"
              defaultValue="Where Science Meets"
              as="span"
            />
            {" "}
            <span className="gradient-text">
              <EditableText
                field="highlights_title_accent"
                defaultValue="Transformation"
                as="span"
              />
            </span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-violet-600 to-blush-400 mx-auto"></div>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          {highlights.map((highlight, index) => (
            <div 
              key={index}
              className="group text-center animate-fade-in hover:scale-105 transition-all duration-300"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div className="bg-gradient-to-br from-blush-50 to-luminous-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg transition-all duration-300">
                <EditableText
                  field={`${highlight.field}_icon`}
                  defaultValue={highlight.icon}
                  as="span"
                  className="text-3xl"
                />
              </div>
              
              <EditableText
                field={`${highlight.field}_title`}
                defaultValue={highlight.title}
                as="h3"
                className="text-2xl font-bold mb-4 text-gray-800 group-hover:text-violet-700 transition-colors duration-300"
              />
              
              <EditableText
                field={`${highlight.field}_description`}
                defaultValue={highlight.description}
                as="p"
                className="text-gray-600 leading-relaxed mb-6"
              />
              
              <EditableLink
                field={`${highlight.field}_link`}
                textField={`${highlight.field}_link_text`}
                urlField={`${highlight.field}_link_url`}
                defaultText="Learn More"
                defaultUrl={highlight.link}
                className="inline-flex items-center text-violet-600 hover:text-blush-600 font-medium transition-colors duration-200"
                target="_self"
              >
                <span className="ml-2 transform transition-transform group-hover:translate-x-1">→</span>
              </EditableLink>
            </div>
          ))}
        </div>

        {/* Enhanced Testimonial Preview with Image */}
        <EditableContainer field="testimonial_preview" className="mt-24 bg-gradient-to-r from-gray-50 to-blush-50 rounded-3xl p-12">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="text-left">
                <EditableText
                  field="testimonial_quote"
                  defaultValue=""Violet's Channel V™ framework didn't just change our team's performance—it transformed how we see ourselves and our potential. The results were immediate and lasting.""
                  as="blockquote"
                  className="text-2xl md:text-3xl font-light text-gray-700 mb-8 leading-relaxed italic"
                />
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-12 h-12 bg-blush-200 rounded-full"></div>
                  <div>
                    <EditableText
                      field="testimonial_author_name"
                      defaultValue="Sarah Chen"
                      as="p"
                      className="font-semibold text-gray-800"
                    />
                    <EditableText
                      field="testimonial_author_title"
                      defaultValue="CEO, Innovation Labs"
                      as="p"
                      className="text-gray-600"
                    />
                  </div>
                </div>
                <EditableLink
                  field="testimonial_cta"
                  textField="testimonial_cta_text"
                  urlField="testimonial_cta_url"
                  defaultText="Explore Impact Stories"
                  defaultUrl="/testimonials"
                  className="inline-flex items-center text-violet-600 hover:text-blush-600 font-medium transition-colors duration-200"
                  target="_self"
                >
                  <span className="ml-2">→</span>
                </EditableLink>
              </div>
              <div className="relative">
                <EditableImage
                  field="testimonial_image"
                  defaultSrc="/lovable-uploads/19e5a6ae-fc42-49a0-a27b-c0c680d038f5.png"
                  alt="Violet in professional setting"
                  className="rounded-2xl shadow-lg w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>
        </EditableContainer>
      </div>
    </EditableContainer>
  );
};

export default KeyHighlights;