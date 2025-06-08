/**
 * Example Implementation Guide
 * 
 * This shows how to update any component to use editable content
 */

// BEFORE: Hardcoded content
const OldComponent = () => {
  return (
    <div>
      <h2>Our Mission</h2>
      <p>We help transform lives through coaching.</p>
      <button>Get Started</button>
    </div>
  );
};

// AFTER: Using editable content
import { EditableText, EditableH2, EditableP, EditableButton } from '@/components/EditableText';

const NewComponent = () => {
  return (
    <div>
      <EditableH2 
        field="mission_title"
        defaultValue="Our Mission"
        className="text-2xl font-bold"
      />
      <EditableP 
        field="mission_description"
        defaultValue="We help transform lives through coaching."
        className="text-gray-600"
      />
      <EditableButton 
        field="mission_cta"
        defaultValue="Get Started"
        className="btn-primary"
      />
    </div>
  );
};

// For inline text spans:
const InlineExample = () => {
  return (
    <p>
      Contact us at{' '}
      <EditableText 
        field="contact_email"
        defaultValue="hello@violetrainwater.com"
        as="a"
        href="mailto:hello@violetrainwater.com"
        className="text-blue-500"
      />
    </p>
  );
};

// For complex nested content:
const ComplexExample = () => {
  return (
    <div className="hero">
      <h1>
        <EditableText field="hero_line1" defaultValue="Change the Channel." as="span" />
        <br />
        <EditableText field="hero_line2" defaultValue="Change Your Life." as="span" />
      </h1>
    </div>
  );
};

export { OldComponent, NewComponent, InlineExample, ComplexExample };
