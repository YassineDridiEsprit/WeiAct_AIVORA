import { ArrowRight } from 'lucide-react';

export default function Hero() {
  return (
    <section id="home" className="relative bg-gradient-to-br from-rose-50 to-white py-20 lg:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-block bg-rose-100 text-rose-700 px-4 py-2 rounded-full text-sm font-medium">
              Empowering Women in Agriculture
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Growing Together,
              <span className="text-rose-600"> Thriving Together</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
              Join a community of women farmers and agricultural entrepreneurs who are transforming
              the future of sustainable farming. Access resources, training, and support to grow your agricultural business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="bg-rose-600 text-white px-8 py-4 rounded-full hover:bg-rose-700 transition-all hover:scale-105 flex items-center justify-center space-x-2 shadow-lg">
                <span>Get Started</span>
                <ArrowRight className="h-5 w-5" />
              </button>
              <button className="border-2 border-rose-600 text-rose-600 px-8 py-4 rounded-full hover:bg-rose-50 transition-colors">
                Learn More
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-square bg-gradient-to-br from-rose-200 to-rose-100 rounded-3xl shadow-2xl overflow-hidden">
              <img
                src="https://images.pexels.com/photos/4505447/pexels-photo-4505447.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Woman farmer in field"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl max-w-xs">
              <div className="flex items-center space-x-4">
                <div className="bg-rose-100 p-3 rounded-xl">
                  <Sprout className="h-6 w-6 text-rose-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">15,000+</div>
                  <div className="text-gray-600">Women Farmers</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Sprout({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
    </svg>
  );
}
