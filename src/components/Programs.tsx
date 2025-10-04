import { BookOpen, Lightbulb, Handshake as HandshakeIcon, Leaf } from 'lucide-react';

const programs = [
  {
    icon: BookOpen,
    title: 'Agricultural Training',
    description: 'Comprehensive courses on modern farming techniques, sustainable practices, and crop management.',
    image: 'https://images.pexels.com/photos/4503273/pexels-photo-4503273.jpeg?auto=compress&cs=tinysrgb&w=600'
  },
  {
    icon: Lightbulb,
    title: 'Innovation Workshops',
    description: 'Learn about agri-tech, smart farming, and innovative solutions for agricultural challenges.',
    image: 'https://images.pexels.com/photos/5529604/pexels-photo-5529604.jpeg?auto=compress&cs=tinysrgb&w=600'
  },
  {
    icon: HandshakeIcon,
    title: 'Business Development',
    description: 'Marketing strategies, financial planning, and business skills tailored for agricultural ventures.',
    image: 'https://images.pexels.com/photos/4503289/pexels-photo-4503289.jpeg?auto=compress&cs=tinysrgb&w=600'
  },
  {
    icon: Leaf,
    title: 'Sustainability Practices',
    description: 'Organic farming, permaculture, and eco-friendly methods for long-term agricultural success.',
    image: 'https://images.pexels.com/photos/4503259/pexels-photo-4503259.jpeg?auto=compress&cs=tinysrgb&w=600'
  }
];

export default function Programs() {
  return (
    <section id="programs" className="py-20 bg-gradient-to-br from-rose-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Our <span className="text-rose-600">Programs</span>
          </h2>
          <p className="text-lg text-gray-600">
            Comprehensive programs designed to support women at every stage of their agricultural journey.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {programs.map((program, index) => (
            <div
              key={index}
              className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={program.image}
                  alt={program.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4">
                  <div className="bg-rose-600 w-12 h-12 rounded-xl flex items-center justify-center shadow-lg">
                    <program.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{program.title}</h3>
                <p className="text-gray-600 leading-relaxed mb-6">{program.description}</p>
                <button className="text-rose-600 font-semibold hover:text-rose-700 transition-colors flex items-center space-x-2">
                  <span>Learn More</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
