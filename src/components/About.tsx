import { Heart, Users, TrendingUp, Award } from 'lucide-react';

const features = [
  {
    icon: Heart,
    title: 'Passionate Community',
    description: 'Connect with like-minded women who share your passion for sustainable agriculture and rural development.'
  },
  {
    icon: Users,
    title: 'Mentorship Programs',
    description: 'Learn from experienced women farmers and agricultural experts who guide you through every step.'
  },
  {
    icon: TrendingUp,
    title: 'Business Growth',
    description: 'Access tools, resources, and funding opportunities to scale your agricultural business.'
  },
  {
    icon: Award,
    title: 'Recognition & Support',
    description: 'Celebrate achievements and receive recognition for your contributions to agriculture.'
  }
];

export default function About() {
  return (
    <section id="about" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Why Choose <span className="text-rose-600">Ztounti</span>
          </h2>
          <p className="text-lg text-gray-600">
            We're dedicated to empowering women in agriculture through education, community support,
            and access to resources that make a real difference.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-rose-50 to-white p-8 rounded-2xl hover:shadow-xl transition-all hover:-translate-y-1 border border-rose-100"
            >
              <div className="bg-rose-600 w-14 h-14 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                <feature.icon className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
