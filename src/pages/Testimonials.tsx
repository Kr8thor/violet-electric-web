import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import EditableText from '@/components/EditableText';

const Testimonials = () => {
  const testimonials = [{
    quote: "Violet's presentation was nothing short of transformative. Her Channel V framework has become an essential part of our leadership development program, resulting in measurable improvements in communication, innovation, and team cohesion.",
    author: "Sarah Chen",
    position: "Chief People Officer, TechVision Global",
    company: "TechVision Global",
    featured: true
  }, {
    quote: "I've brought in hundreds of speakers over my 15-year career in events, and Violet stands in the top 1%. Her ability to combine cutting-edge neuroscience with practical, actionable strategies had our audience completely engaged from start to finish.",
    author: "Michael Rodriguez",
    position: "VP of Events",
    company: "Future Forward Summit",
    featured: false
  }, {
    quote: "Months after Violet's keynote, our team still references her Channel V framework in our daily operations. The shifts in mindset and communication have been remarkable. We've seen a 23% increase in employee engagement and a significant boost in cross-functional collaboration.",
    author: "Alexandra Washington",
    position: "CEO",
    company: "Innovate Health Systems",
    featured: true
  }, {
    quote: "Violet has that rare ability to make complex neuroscience concepts not just understandable but immediately applicable. Her energy is contagious, and her methods work. Our leadership team is still feeling the impact of her training six months later.",
    author: "James Thornton",
    position: "Director of Talent Development",
    company: "Elevation Financial",
    featured: false
  }, {
    quote: "Working with Violet was the best decision we made for our annual conference. Her preparation was meticulous, her delivery was flawless, and the value she provided extended well beyond her time on stage. We've already booked her for next year.",
    author: "Rachel Miyamoto",
    position: "Conference Director",
    company: "Transform Leadership Summit",
    featured: false
  }];
  
  const videoTestimonials = [{
    id: "AG2emkNGwVY",
    title: "Client Success Story - Leadership Transformation",
    description: "See how Violet's Channel V framework transformed this organization's leadership team."
  }, {
    id: "-VNT0WBwTy0",
    title: "Event Organizer Testimonial - Impact & Results",
    description: "Event organizers share their experience working with Violet and the lasting impact on attendees."
  }, {
    id: "Ip39wsKoaH0",
    title: "Violet Rainwater Keynote - Transform Your Leadership",
    description: "Experience Violet's powerful keynote presentation on transformative leadership strategies."
  }, {
    id: "Vo5xmmhBnkU",
    title: "Channel V Framework in Action",
    description: "Watch as Violet demonstrates the practical application of her Channel V methodology."
  }, {
    id: "srMxk7XY-XA",
    title: "Neuroscience-Based Leadership Insights",
    description: "Discover how neuroscience principles can revolutionize your approach to leadership and communication."
  }];

  // Separate featured testimonials
  const featuredTestimonials = testimonials.filter(t => t.featured);
  const regularTestimonials = testimonials.filter(t => !t.featured);
  
  return <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container-max section-padding text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-800">
            <EditableText field="testimonials_hero_title" defaultValue="Client Success Stories" />
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-violet-500 to-luminous-400 mx-auto mb-8"></div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            <EditableText field="testimonials_hero_subtitle" defaultValue={"Real results from organizations that have experienced Violet's transformative approach."} />
          </p>
        </div>
      </section>

      {/* Video Testimonials Section */}
      <section className="py-16 bg-gradient-to-r from-violet-50 to-luminous-50">
        <div className="container-max section-padding">
          <h2 className="text-3xl font-bold mb-12 text-center text-gray-800">
            <EditableText field="testimonials_video_title" defaultValue="Video Testimonials" />
          </h2>
          
          {/* Video grid with centered bottom row */}
          <div className="mb-12">
            {/* Top 3 videos */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
              {videoTestimonials.slice(0, 3).map((video, index) => (
                <Card key={index} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardContent className="p-0">
                    <div className="aspect-video">
                      <iframe src={`https://www.youtube.com/embed/${video.id}`} title={video.title} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="w-full h-full"></iframe>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-semibold mb-2 text-gray-800">
                        <EditableText field={`testimonials_video_${index+1}_title`} defaultValue={video.title} />
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        <EditableText field={`testimonials_video_${index+1}_desc`} defaultValue={video.description} />
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Bottom 2 videos - centered */}
            <div className="flex justify-center">
              <div className="grid md:grid-cols-2 gap-8 max-w-4xl">
                {videoTestimonials.slice(3, 5).map((video, index) => (
                  <Card key={index + 3} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <CardContent className="p-0">
                      <div className="aspect-video">
                        <iframe src={`https://www.youtube.com/embed/${video.id}`} title={video.title} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="w-full h-full"></iframe>
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-semibold mb-2 text-gray-800">
                          <EditableText field={`testimonials_video_${index+4}_title`} defaultValue={video.title} />
                        </h3>
                        <p className="text-gray-600 leading-relaxed">
                          <EditableText field={`testimonials_video_${index+4}_desc`} defaultValue={video.description} />
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Image Gallery */}
          <div className="grid md:grid-cols-3 gap-6">
            <img src="/lovable-uploads/df91c47d-18ff-4d95-a356-c490edd044d7.png" alt="Violet speaking on stage" className="rounded-lg shadow-md w-full h-48 object-contain" />
            <img src="/lovable-uploads/29a03ec4-c15c-4c54-978d-bd7897ed2055.png" alt="Violet in professional setting" className="rounded-lg shadow-md w-full h-48 object-scale-down" />
            <img src="/lovable-uploads/87e9efae-1889-4106-be44-4eef8be7cab8.png" alt="Violet in corporate environment" className="rounded-lg shadow-md w-full h-48 object-contain" />
          </div>
        </div>
      </section>

      {/* Featured Testimonials */}
      {featuredTestimonials.length > 0 && <section className="py-16 bg-white">
          <div className="container-max section-padding">
            <h2 className="text-3xl font-bold mb-12 text-center text-gray-800">
              <EditableText field="testimonials_featured_title" defaultValue="Featured Testimonials" />
            </h2>
            
            <div className="space-y-12">
              {featuredTestimonials.map((testimonial, index) => <div key={index} className="bg-gradient-to-r from-violet-50 to-luminous-50 rounded-2xl p-8 md:p-10 animate-fade-in shadow-sm">
                  <div className="text-4xl text-violet-300 mb-4">"</div>
                  <blockquote className="text-xl md:text-2xl font-light text-gray-700 mb-8 leading-relaxed italic">
                    <EditableText field={`testimonials_featured_${index+1}_quote`} defaultValue={testimonial.quote} />
                  </blockquote>
                  <div className="flex items-center">
                    <div>
                      <p className="font-bold text-gray-800">
                        <EditableText field={`testimonials_featured_${index+1}_author`} defaultValue={testimonial.author} />
                      </p>
                      <p className="text-gray-600">
                        <EditableText field={`testimonials_featured_${index+1}_meta`} defaultValue={`${testimonial.position}, ${testimonial.company}`} />
                      </p>
                    </div>
                  </div>
                </div>)}
            </div>
          </div>
        </section>}

      {/* Regular Testimonials */}
      <section className="py-16 bg-white">
        <div className="container-max section-padding">
          <div className="grid md:grid-cols-2 gap-8">
            {regularTestimonials.map((testimonial, index) => <div key={index} className="border border-gray-200 rounded-xl p-6 animate-fade-in" style={{
            animationDelay: `${index * 0.1}s`
          }}>
                <div className="h-1 w-12 bg-violet-500 mb-6"></div>
                <blockquote className="text-lg text-gray-700 mb-6 leading-relaxed">
                  <EditableText field={`testimonials_regular_${index+1}_quote`} defaultValue={testimonial.quote} />
                </blockquote>
                <div>
                  <p className="font-semibold text-gray-800">
                    <EditableText field={`testimonials_regular_${index+1}_author`} defaultValue={testimonial.author} />
                  </p>
                  <p className="text-gray-600 text-sm">
                    <EditableText field={`testimonials_regular_${index+1}_meta`} defaultValue={`${testimonial.position}, ${testimonial.company}`} />
                  </p>
                </div>
              </div>)}
          </div>
        </div>
      </section>

      {/* Additional Images Section */}
      <section className="py-16 bg-gradient-to-r from-gray-50 to-violet-50">
        <div className="container-max section-padding">
          <h2 className="text-3xl font-bold mb-12 text-center text-gray-800">
            <EditableText field="testimonials_action_title" defaultValue="Violet in Action" />
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <img src="/lovable-uploads/b915b2ba-9f64-45f7-b031-be6ce3816e80.png" alt="Violet with materials in garden setting" className="rounded-lg shadow-lg w-full h-64 object-scale-down" />
            <img src="/lovable-uploads/8d50f04a-9549-473a-9acd-16d4e4e15a32.png" alt="Violet relaxing in garden" className="rounded-lg shadow-lg w-full h-64 object-scale-down" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-gray-50 to-violet-50">
        <div className="container-max section-padding text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-800">
            <EditableText field="testimonials_cta_title" defaultValue="Share This Impact With Your Audience" />
          </h2>
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
            <EditableText field="testimonials_cta_subtitle" defaultValue={"Experience the transformative power of Violet's keynotes and workshops at your next event."} />
          </p>
          <Link to="/contact">
            <Button className="luminous-button px-8 py-4 text-lg rounded-full">
              <EditableText field="testimonials_cta_btn" defaultValue="Contact to Book" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>;
};

export default Testimonials;
