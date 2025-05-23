
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';

const Testimonials = () => {
  const testimonials = [
    {
      quote: "Violet's presentation was nothing short of transformative. Her Channel V framework has become an essential part of our leadership development program, resulting in measurable improvements in communication, innovation, and team cohesion.",
      author: "Sarah Chen",
      position: "Chief People Officer, TechVision Global",
      company: "TechVision Global",
      featured: true
    },
    {
      quote: "I've brought in hundreds of speakers over my 15-year career in events, and Violet stands in the top 1%. Her ability to combine cutting-edge neuroscience with practical, actionable strategies had our audience completely engaged from start to finish.",
      author: "Michael Rodriguez",
      position: "VP of Events",
      company: "Future Forward Summit",
      featured: false
    },
    {
      quote: "Months after Violet's keynote, our team still references her Channel V framework in our daily operations. The shifts in mindset and communication have been remarkable. We've seen a 23% increase in employee engagement and a significant boost in cross-functional collaboration.",
      author: "Alexandra Washington",
      position: "CEO",
      company: "Innovate Health Systems",
      featured: true
    },
    {
      quote: "Violet has that rare ability to make complex neuroscience concepts not just understandable but immediately applicable. Her energy is contagious, and her methods work. Our leadership team is still feeling the impact of her training six months later.",
      author: "James Thornton",
      position: "Director of Talent Development",
      company: "Elevation Financial",
      featured: false
    },
    {
      quote: "Working with Violet was the best decision we made for our annual conference. Her preparation was meticulous, her delivery was flawless, and the value she provided extended well beyond her time on stage. We've already booked her for next year.",
      author: "Rachel Miyamoto",
      position: "Conference Director",
      company: "Transform Leadership Summit",
      featured: false
    }
  ];

  // Separate featured testimonials
  const featuredTestimonials = testimonials.filter(t => t.featured);
  const regularTestimonials = testimonials.filter(t => !t.featured);

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container-max section-padding text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-800">
            Client <span className="gradient-text">Success</span> Stories
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-violet-500 to-luminous-400 mx-auto mb-8"></div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Real results from organizations that have experienced Violet's transformative approach.
          </p>
        </div>
      </section>

      {/* Featured Testimonials */}
      {featuredTestimonials.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container-max section-padding">
            <h2 className="text-3xl font-bold mb-12 text-center text-gray-800">Featured Testimonials</h2>
            
            <div className="space-y-12">
              {featuredTestimonials.map((testimonial, index) => (
                <div key={index} className="bg-gradient-to-r from-violet-50 to-luminous-50 rounded-2xl p-8 md:p-10 animate-fade-in shadow-sm">
                  <div className="text-4xl text-violet-300 mb-4">"</div>
                  <blockquote className="text-xl md:text-2xl font-light text-gray-700 mb-8 leading-relaxed italic">
                    {testimonial.quote}
                  </blockquote>
                  <div className="flex items-center">
                    <div>
                      <p className="font-bold text-gray-800">{testimonial.author}</p>
                      <p className="text-gray-600">{testimonial.position}, {testimonial.company}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Regular Testimonials */}
      <section className="py-16 bg-white">
        <div className="container-max section-padding">
          <div className="grid md:grid-cols-2 gap-8">
            {regularTestimonials.map((testimonial, index) => (
              <div 
                key={index} 
                className="border border-gray-200 rounded-xl p-6 animate-fade-in" 
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="h-1 w-12 bg-violet-500 mb-6"></div>
                <blockquote className="text-lg text-gray-700 mb-6 leading-relaxed">
                  "{testimonial.quote}"
                </blockquote>
                <div>
                  <p className="font-semibold text-gray-800">{testimonial.author}</p>
                  <p className="text-gray-600 text-sm">{testimonial.position}, {testimonial.company}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-gray-50 to-violet-50">
        <div className="container-max section-padding text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-800">
            Share This Impact With Your Audience
          </h2>
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
            Experience the transformative power of Violet's keynotes and workshops at your next event.
          </p>
          <Button className="luminous-button px-8 py-4 text-lg rounded-full">
            Contact to Book
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Testimonials;
