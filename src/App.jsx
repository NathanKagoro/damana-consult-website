import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ExperienceSection from './components/ExperienceSection';
import TrackRecord from './components/TrackRecord';
import SisalFocusSection from './components/SisalFocusSection';
import ServicesSection from './components/ServicesSection';
import ContactCta from './components/ContactCta';
import Footer from './components/Footer';

export default function App() {
  return (
    <>
      <a className="skip-link" href="#experience">Skip to content</a>
      <Navbar />
      <main id="top">
        <Hero />
        <ExperienceSection />
        <TrackRecord />
        <SisalFocusSection />
        <ServicesSection />
        <ContactCta />
      </main>
      <Footer />
    </>
  );
}
