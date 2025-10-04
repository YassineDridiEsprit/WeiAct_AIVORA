import Header from '../components/Header';
import Hero from '../components/Hero';
import About from '../components/About';
import Programs from '../components/Programs';
import Resources from '../components/Resources';
import Community from '../components/Community';
import Footer from '../components/Footer';

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <Hero />
        <About />
        <Programs />
        <Resources />
        <Community />
      </main>
      <Footer />
    </div>
  );
}
