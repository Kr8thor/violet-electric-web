import { Link } from 'react-router-dom';
import EditableText from './EditableText';
import { EditableImage, EditableLink, EditableButton, EditableContainer } from '@/components/UniversalEditingComponents';

const Footer = () => {
  return (
    <EditableContainer field="footer_section" as="footer" className="bg-gray-900 text-white py-16">
      <div className="container-max section-padding">
        <div className="grid md:grid-cols-4 gap-12">
          {/* Brand - Now fully editable */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <EditableImage
                field="footer_logo"
                defaultSrc="/lovable-uploads/4a037212-f4a5-420d-ad52-9064e5032e1d.png"
                alt="Violet Rainwater Logo"
                className="h-10 w-auto"
              />
              <EditableText
                field="footer_brand_title"
                defaultValue="Violet Rainwater"
                as="h3"
                className="text-2xl font-bold gradient-text"
              />
            </div>
            
            <EditableText
              field="footer_description"
              defaultValue="Transforming potential with neuroscience and heart. Change the channel. Change your life."
              as="p"
              className="text-gray-400 leading-relaxed mb-6"
            />
            
            <div className="flex space-x-4">
              <EditableLink
                field="footer_linkedin"
                textField="footer_linkedin_text"
                urlField="footer_linkedin_url"
                defaultText="LinkedIn"
                defaultUrl="#"
                className="text-gray-400 hover:text-violet-400 transition-colors duration-200"
                target="_blank"
              />
              
              <EditableLink
                field="footer_instagram"
                textField="footer_instagram_text"
                urlField="footer_instagram_url"
                defaultText="Instagram"
                defaultUrl="#"
                className="text-gray-400 hover:text-violet-400 transition-colors duration-200"
                target="_blank"
              />
              
              <EditableLink
                field="footer_youtube"
                textField="footer_youtube_text"
                urlField="footer_youtube_url"
                defaultText="YouTube"
                defaultUrl="#"
                className="text-gray-400 hover:text-violet-400 transition-colors duration-200"
                target="_blank"
              />
            </div>
          </div>

          {/* Quick Links - Now editable */}
          <div>
            <EditableText
              field="footer_quicklinks_title"
              defaultValue="Quick Links"
              as="h4"
              className="font-semibold mb-4 text-violet-300"
            />
            <div className="space-y-3">
              <EditableLink
                field="footer_about_link"
                textField="footer_about_text"
                urlField="footer_about_url"
                defaultText="About Violet"
                defaultUrl="/about"
                className="block text-gray-400 hover:text-white transition-colors duration-200"
                target="_self"
              />
              
              <EditableLink
                field="footer_keynotes_link"
                textField="footer_keynotes_text"
                urlField="footer_keynotes_url"
                defaultText="Keynote Topics"
                defaultUrl="/keynotes"
                className="block text-gray-400 hover:text-white transition-colors duration-200"
                target="_self"
              />
              
              <EditableLink
                field="footer_testimonials_link"
                textField="footer_testimonials_text"
                urlField="footer_testimonials_url"
                defaultText="Success Stories"
                defaultUrl="/testimonials"
                className="block text-gray-400 hover:text-white transition-colors duration-200"
                target="_self"
              />
              
              <EditableLink
                field="footer_contact_link"
                textField="footer_contact_text"
                urlField="footer_contact_url"
                defaultText="Get in Touch"
                defaultUrl="/contact"
                className="block text-gray-400 hover:text-white transition-colors duration-200"
                target="_self"
              />
            </div>
          </div>

          {/* Resources - Now editable */}
          <div>
            <EditableText
              field="footer_resources_title"
              defaultValue="Resources"
              as="h4"
              className="font-semibold mb-4 text-violet-300"
            />
            <div className="space-y-3">
              <EditableLink
                field="footer_channel_guide"
                textField="footer_channel_guide_text"
                urlField="footer_channel_guide_url"
                defaultText="Channel V™ Guide"
                defaultUrl="#"
                className="block text-gray-400 hover:text-white transition-colors duration-200"
                target="_blank"
              />
              
              <EditableLink
                field="footer_speaker_kit"
                textField="footer_speaker_kit_text"
                urlField="footer_speaker_kit_url"
                defaultText="Speaker Kit"
                defaultUrl="#"
                className="block text-gray-400 hover:text-white transition-colors duration-200"
                target="_blank"
              />
              
              <EditableLink
                field="footer_blog"
                textField="footer_blog_text"
                urlField="footer_blog_url"
                defaultText="Blog"
                defaultUrl="#"
                className="block text-gray-400 hover:text-white transition-colors duration-200"
                target="_blank"
              />
              
              <EditableLink
                field="footer_media_kit"
                textField="footer_media_kit_text"
                urlField="footer_media_kit_url"
                defaultText="Media Kit"
                defaultUrl="#"
                className="block text-gray-400 hover:text-white transition-colors duration-200"
                target="_blank"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <EditableText
              field="footer_copyright"
              defaultValue="© 2025 Violet Rainwater. All rights reserved."
              as="p"
              className="text-gray-400 mb-4 md:mb-0"
            />
            
            <EditableButton
              field="footer_cta_button"
              textField="footer_cta_text"
              urlField="footer_cta_url"
              colorField="footer_cta_color"
              defaultText="Book Violet"
              defaultUrl="/contact"
              defaultColor="#8b5cf6"
              className="luminous-button px-6 py-2 rounded-full"
              target="_self"
            />
          </div>
        </div>
      </div>
    </EditableContainer>
  );
};

export default Footer;
