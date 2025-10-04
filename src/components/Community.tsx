import { MessageCircle, Calendar, Users as Users2, Globe } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Organic Farmer',
    image: 'https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg?auto=compress&cs=tinysrgb&w=200',
    quote: 'Zitounti transformed my small farm into a thriving organic business. The mentorship and resources are invaluable.'
  },
  {
    name: 'Maria Santos',
    role: 'Agricultural Entrepreneur',
    image: 'https://images.pexels.com/photos/3768894/pexels-photo-3768894.jpeg?auto=compress&cs=tinysrgb&w=200',
    quote: 'The community support here is incredible. I found my business partners and lifelong friends through Zitounti.'
  },
  {
    name: 'Priya Patel',
    role: 'Sustainable Farming Advocate',
    image: 'https://images.pexels.com/photos/3831645/pexels-photo-3831645.jpeg?auto=compress&cs=tinysrgb&w=200',
    quote: 'Thanks to Zitounti, I learned sustainable farming practices that doubled my yield while protecting the environment.'
  }
];

const communityFeatures = [
  { icon: MessageCircle, title: 'Discussion Forums', description: 'Connect and share' },
  { icon: Calendar, title: 'Monthly Events', description: 'Workshops & webinars' },
  { icon: Users2, title: 'Local Chapters', description: 'Meet nearby members' },
  { icon: Globe, title: 'Global Network', description: '50+ countries' }
];

export default function Community() {
  return (
    <section id="community" className="py-20 bg-gradient-to-br from-rose-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Join Our <span className="text-rose-600">Community</span>
          </h2>
          <p className="text-lg text-gray-600">
            Be part of a global network of women farmers making a difference in agriculture.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-16">
          {communityFeatures.map((feature, index) => (
            <div key={index} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow text-center">
              <div className="bg-rose-100 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4">
                <feature.icon className="h-6 w-6 text-rose-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="mb-16">
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-12">
            Success Stories
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center mb-6">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full object-cover mr-4"
                  />
                  <div>
                    <div className="font-bold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-rose-600">{testimonial.role}</div>
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed italic">"{testimonial.quote}"</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-r from-rose-600 to-pink-600 rounded-3xl p-8 md:p-12 text-white text-center">
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            Start Your Journey Today
          </h3>
          <p className="mb-8 max-w-2xl mx-auto opacity-90">
            Join thousands of women who are transforming agriculture and building sustainable futures.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-rose-600 px-8 py-4 rounded-full hover:bg-gray-50 transition-all font-semibold hover:scale-105 shadow-lg">
              Become a Member
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-full hover:bg-white/10 transition-all font-semibold">
              Schedule a Call
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
