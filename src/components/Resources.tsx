import { FileText, Video, Download, ExternalLink } from 'lucide-react';

const resources = [
  {
    icon: FileText,
    title: 'Farming Guides',
    count: '150+ Guides',
    description: 'Detailed guides on crop cultivation, soil management, and seasonal planning.',
    color: 'from-rose-500 to-pink-500'
  },
  {
    icon: Video,
    title: 'Video Tutorials',
    count: '200+ Videos',
    description: 'Step-by-step video tutorials covering all aspects of modern agriculture.',
    color: 'from-rose-600 to-rose-700'
  },
  {
    icon: Download,
    title: 'Templates & Tools',
    count: '50+ Resources',
    description: 'Business plans, crop calendars, and financial planning templates.',
    color: 'from-pink-500 to-rose-500'
  },
  {
    icon: ExternalLink,
    title: 'Market Access',
    count: '30+ Partners',
    description: 'Connect with buyers, suppliers, and distributors in your region.',
    color: 'from-rose-700 to-rose-800'
  }
];

export default function Resources() {
  return (
    <section id="resources" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            <span className="text-rose-600">Resources</span> at Your Fingertips
          </h2>
          <p className="text-lg text-gray-600">
            Access a comprehensive library of resources designed to help you succeed in agriculture.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {resources.map((resource, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-2xl p-8 text-white cursor-pointer hover:scale-105 transition-transform shadow-lg"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${resource.color}`}></div>
              <div className="relative z-10">
                <resource.icon className="h-10 w-10 mb-4 opacity-90" />
                <div className="text-sm font-medium opacity-90 mb-2">{resource.count}</div>
                <h3 className="text-xl font-bold mb-2">{resource.title}</h3>
                <p className="text-sm opacity-90 leading-relaxed">{resource.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-gradient-to-br from-rose-50 to-pink-50 rounded-3xl p-8 md:p-12 text-center">
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Ready to Access All Resources?
          </h3>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Join our community today and unlock access to all our resources, training programs, and support network.
          </p>
          <button className="bg-rose-600 text-white px-8 py-4 rounded-full hover:bg-rose-700 transition-all hover:scale-105 shadow-lg">
            Get Full Access
          </button>
        </div>
      </div>
    </section>
  );
}
