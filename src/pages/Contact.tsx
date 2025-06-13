import { useState } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, Download } from 'lucide-react';
import { EditableText } from '@/components/EditableText';

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    eventType: '',
    eventDate: '',
    message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, eventType: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    
    // Create mailto link with form data
    const subject = encodeURIComponent(`Speaking Inquiry from ${formData.name}`);
    const body = encodeURIComponent(`
Name: ${formData.name}
Email: ${formData.email}
Company: ${formData.company}
Phone: ${formData.phone}
Event Type: ${formData.eventType}
Event Date: ${formData.eventDate}

Message:
${formData.message}
    `);
    
    const mailtoLink = `mailto:violet@violetrainmaker.com?subject=${subject}&body=${body}`;
    window.location.href = mailtoLink;
    
    // Display success toast
    toast({
      title: "Email Client Opened!",
      description: "Your default email client should now open with the inquiry details. Please send the email to complete your request.",
    });
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      company: '',
      phone: '',
      eventType: '',
      eventDate: '',
      message: ''
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container-max section-padding text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-800">
            Book <span className="gradient-text">Violet</span>
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-violet-500 to-luminous-400 mx-auto mb-8"></div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Ready to bring transformation to your organization? Let's connect and discuss how 
            Violet can create an unforgettable experience for your audience.
          </p>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-20">
        <div className="container-max section-padding">
          <div className="grid lg:grid-cols-5 gap-12">
            {/* Form */}
            <div className="lg:col-span-3">
              <h2 className="text-3xl font-bold mb-8 text-gray-800">Send an Inquiry</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name" 
                      name="name" 
                      value={formData.name} 
                      onChange={handleInputChange} 
                      placeholder="Your name"
                      className="border-gray-200 focus:border-violet-400"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input 
                      id="email" 
                      name="email" 
                      type="email" 
                      value={formData.email} 
                      onChange={handleInputChange} 
                      placeholder="your@email.com"
                      className="border-gray-200 focus:border-violet-400"
                      required
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="company">Company / Organization</Label>
                    <Input 
                      id="company" 
                      name="company" 
                      value={formData.company} 
                      onChange={handleInputChange} 
                      placeholder="Your company"
                      className="border-gray-200 focus:border-violet-400"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input 
                      id="phone" 
                      name="phone" 
                      type="tel" 
                      value={formData.phone} 
                      onChange={handleInputChange} 
                      placeholder="Your phone number"
                      className="border-gray-200 focus:border-violet-400"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="eventType">Event Type</Label>
                    <Select onValueChange={handleSelectChange} value={formData.eventType}>
                      <SelectTrigger className="border-gray-200 focus:border-violet-400">
                        <SelectValue placeholder="Select event type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="conference">Conference</SelectItem>
                        <SelectItem value="corporate">Corporate Event</SelectItem>
                        <SelectItem value="leadership">Leadership Retreat</SelectItem>
                        <SelectItem value="workshop">Workshop</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="eventDate">Tentative Event Date</Label>
                    <Input 
                      id="eventDate" 
                      name="eventDate" 
                      type="date" 
                      value={formData.eventDate} 
                      onChange={handleInputChange}
                      className="border-gray-200 focus:border-violet-400" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Your Request</Label>
                  <Textarea 
                    id="message" 
                    name="message" 
                    value={formData.message} 
                    onChange={handleInputChange} 
                    placeholder="Tell us about your event, audience, and what you're hoping to achieve..."
                    className="min-h-[150px] border-gray-200 focus:border-violet-400"
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="luminous-button px-8 py-4 text-lg rounded-full w-full sm:w-auto"
                >
                  Submit Inquiry
                </Button>
              </form>
            </div>
            
            {/* Contact Info */}
            <div className="lg:col-span-2 space-y-12">
              <div>
                <h2 className="text-3xl font-bold mb-8 text-gray-800">Contact Details</h2>
                
                <div className="space-y-6">
                  <div className="flex items-start">
                    <Mail className="w-5 h-5 text-violet-600 mt-1 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">Email</p>
                      <EditableText 
                        field="contact_email" 
                        defaultValue="violet@violetrainmaker.com"
                        as="a"
                        href="mailto:violet@violetrainmaker.com" 
                        className="text-violet-600 hover:text-violet-800"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Phone className="w-5 h-5 text-violet-600 mt-1 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">Phone</p>
                      <EditableText 
                        field="contact_phone" 
                        defaultValue="(555) 123-4567"
                        as="a"
                        href="tel:+15551234567" 
                        className="text-violet-600 hover:text-violet-800"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-violet-50 to-luminous-50 rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-bold mb-4 text-gray-800">Speaker Materials</h3>
                <p className="text-gray-600 mb-5">
                  Download Violet's speaker kit for detailed information on her speaking topics, 
                  experience, and technical requirements.
                </p>
                <Button 
                  variant="outline" 
                  className="flex items-center border-violet-200 text-violet-700 hover:bg-violet-50"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Speaker Kit
                </Button>
              </div>
              
              <div>
                <h3 className="text-xl font-bold mb-4 text-gray-800">Response Time</h3>
                <p className="text-gray-600">
                  We typically respond to all inquiries within 24-48 hours during business days.
                  For urgent matters, please indicate so in your message.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
