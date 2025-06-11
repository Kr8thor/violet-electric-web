import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EditableText } from '@/components/EditableText';
import { EditableContainer } from '@/components/UniversalEditingComponents';

const Newsletter = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Newsletter signup:', email);
    setEmail('');
  };

  return (
    <EditableContainer field="newsletter_section" as="section" className="py-24 bg-gradient-to-r from-gray-50 to-blush-50">
      <div className="container-max section-padding">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800">
            <EditableText
              field="newsletter_title_main"
              defaultValue="Unlock Your"
              as="span"
            />
            {" "}
            <span className="gradient-text">
              <EditableText
                field="newsletter_title_accent"
                defaultValue="Potential"
                as="span"
              />
            </span>
          </h2>
          <EditableText
            field="newsletter_description"
            defaultValue="Get exclusive insights, neuroscience-backed strategies, and early access to Violet's transformational content. Join thousands who are already changing their channels."
            as="p"
            className="text-xl text-gray-600 mb-12 leading-relaxed"
          />

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
            <Input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-6 py-4 text-lg rounded-full border-2 border-blush-200 focus:border-violet-400 transition-colors duration-300"
              required
            />
            <Button 
              type="submit"
              className="luminous-button px-8 py-4 text-lg rounded-full flex-shrink-0"
            >
              <EditableText
                field="newsletter_button_text"
                defaultValue="Subscribe Now"
                as="span"
              />
            </Button>
          </form>

          <EditableText
            field="newsletter_disclaimer"
            defaultValue="No spam, just transformation. Unsubscribe anytime."
            as="p"
            className="text-sm text-gray-500 mt-6"
          />
        </div>
      </div>
    </EditableContainer>
  );
};

export default Newsletter;