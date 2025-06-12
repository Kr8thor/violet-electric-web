import { Button } from '@/components/ui/button';
import EditableText, { RichEditableP } from './EditableText';
import { EditableImage, EditableButton, EditableContainer } from '@/components/UniversalEditingComponents';

const IntroBrief = () => {
  return (
    <EditableContainer field="intro_brief_section" as="section" className="py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="container-max section-padding">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="animate-fade-in">
            <div className="relative">
              <EditableImage
                field="intro_violet_photo"
                defaultSrc="/lovable-uploads/420a7493-73b2-4bfe-9a3a-9ad3693c0b9a.jpg"
                alt="Violet Rainwater"
                className="rounded-2xl shadow-2xl w-full"
              />
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-blush-100 rounded-full opacity-60"></div>
              <div className="absolute -top-6 -left-6 w-16 h-16 bg-luminous-100 rounded-full opacity-60"></div>
            </div>
          </div>
          
          <div className="space-y-8 animate-fade-in">
            <div>
              <EditableText
                field="intro_title"
                defaultValue="Violet Rainwater"
                as="h2"
                className="text-4xl md:text-5xl font-bold mb-6 text-gray-800"
                richText={false}
                maxLength={100}
                placeholder="Enter title..."
              />
              <div className="w-20 h-1 bg-gradient-to-r from-violet-600 to-blush-400 mb-6 mx-[150px]"></div>
              
              {/* 🎯 UPGRADED TO RICH TEXT EDITING */}
              <RichEditableP
                field="intro_description"
                defaultValue="Transforming potential with neuroscience and heart. Violet combines cutting-edge research with authentic leadership to help individuals and organizations unlock their extraordinary capabilities."
                className="text-xl text-gray-600 leading-relaxed"
                maxLength={1000}
                placeholder="Enter detailed description with rich formatting..."
                preferredEditor="lexical"
                allowedFormats={['bold', 'italic', 'underline', 'link']}
              />
            </div>
            
            <div className="flex flex-wrap gap-4">
              <div className="bg-white px-4 py-2 rounded-full border border-blush-200 text-violet-700 font-medium">
                <EditableText
                  field="intro_tag_1"
                  defaultValue="Neuroscience Expert"
                  as="span"
                  richText={false}
                  maxLength={30}
                  placeholder="Expertise tag..."
                />
              </div>
              <div className="bg-white px-4 py-2 rounded-full border border-blush-200 text-violet-700 font-medium">
                <EditableText
                  field="intro_tag_2"
                  defaultValue="Keynote Speaker"
                  as="span"
                  richText={false}
                  maxLength={30}
                  placeholder="Speaking tag..."
                />
              </div>
              <div className="bg-white px-4 py-2 rounded-full border border-blush-200 text-violet-700 font-medium">
                <EditableText
                  field="intro_tag_3"
                  defaultValue="Transformation Coach"
                  as="span"
                  richText={false}
                  maxLength={30}
                  placeholder="Coaching tag..."
                />
              </div>
            </div>
            
            <div className="flex justify-center">
              {/* 🎯 UPGRADED TO EDITABLE BUTTON COMPONENT */}
              <EditableButton
                field="intro_cta"
                textField="intro_cta_text"
                urlField="intro_cta_url"
                defaultText="Learn More About Violet"
                defaultUrl="/about"
                className="border-blush-300 px-6 py-3 rounded-full transition-all duration-300 mx-[150px] bg-violet-600 hover:bg-violet-500 text-slate-50 font-semibold text-lg text-center"
                style={{ display: 'inline-block', minWidth: 220 }}
                target="_self"
              />
            </div>
          </div>
        </div>
      </div>
    </EditableContainer>
  );
};

export default IntroBrief;