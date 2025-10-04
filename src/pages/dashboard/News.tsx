import { Newspaper, ExternalLink } from 'lucide-react';

export default function News() {
  const articles = [
    {
      title: 'Sustainable Farming Practices Gain Momentum',
      source: 'AgriNews',
      date: '2 hours ago',
      image: 'https://images.pexels.com/photos/2132250/pexels-photo-2132250.jpeg?auto=compress&cs=tinysrgb&w=400',
      excerpt: 'More farmers are adopting sustainable practices to improve soil health and reduce environmental impact.',
    },
    {
      title: 'New Grant Program for Women Farmers Announced',
      source: 'Farm Journal',
      date: '5 hours ago',
      image: 'https://images.pexels.com/photos/4505447/pexels-photo-4505447.jpeg?auto=compress&cs=tinysrgb&w=400',
      excerpt: 'Government launches $50 million grant program to support women-led agricultural enterprises.',
    },
    {
      title: 'Organic Olive Oil Demand Reaches Record High',
      source: 'Food & Agriculture',
      date: '1 day ago',
      image: 'https://images.pexels.com/photos/33737/olive-oil-salad-dressing-cooking-olive.jpg?auto=compress&cs=tinysrgb&w=400',
      excerpt: 'Consumer demand for organic olive oil has increased by 45% over the past year.',
    },
    {
      title: 'Smart Farming Technology Trends for 2025',
      source: 'Tech Agriculture',
      date: '2 days ago',
      image: 'https://images.pexels.com/photos/5529604/pexels-photo-5529604.jpeg?auto=compress&cs=tinysrgb&w=400',
      excerpt: 'AI and IoT devices are revolutionizing how farmers monitor and manage their operations.',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">News</h1>
        <p className="text-gray-600 mt-1">Stay updated with the latest agriculture news</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {articles.map((article, index) => (
          <div key={index} className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden group cursor-pointer">
            <div className="relative h-48 overflow-hidden">
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            </div>
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-3 text-sm text-gray-600">
                <span className="font-medium text-rose-600">{article.source}</span>
                <span>•</span>
                <span>{article.date}</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-rose-600 transition-colors">
                {article.title}
              </h3>
              <p className="text-gray-600 mb-4">{article.excerpt}</p>
              <button className="text-rose-600 hover:text-rose-700 font-medium flex items-center space-x-2 text-sm">
                <span>Read more</span>
                <ExternalLink className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-br from-rose-50 to-purple-50 rounded-2xl p-8 text-center">
        <Newspaper className="h-12 w-12 text-rose-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">Want more news?</h3>
        <p className="text-gray-600 mb-4">Subscribe to our newsletter for daily agriculture updates</p>
        <button className="bg-gradient-to-r from-rose-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-rose-700 hover:to-purple-700 transition-all shadow-lg">
          Subscribe Now
        </button>
      </div>
    </div>
  );
}
