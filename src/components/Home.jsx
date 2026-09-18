import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Brands from "./components/Brands";
import About from "./components/About";
import Services from "./components/Services";
import Testimonials from "./components/Testimonials";
import DIYSection from "./components/DIYSection";
import FAQ from "./components/FAQ";
import Footer from "./components/Footer";
import SEO from "./SEO";
import { SITE_URL, SITE_NAME } from "../config/seo";
import "./css/App.css";

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description:
      "Online device support and repair platform offering remote diagnostics, technician support, and device shipment repair.",
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
  },
];

export default function App() {
  return (
    <div className="app">
      <SEO
        title="Online Computer & Device Support in Nigeria"
        description="Diagnose computer, phone and device problems, connect with technicians remotely, book support or send your device in for repair — all in one place."
        path="/"
        structuredData={structuredData}
      />
      <Navbar />
      <main>
        <section id="home"><Hero /></section>
        <Brands />
        <section id="about"><About /></section>
        <section id="services"><Services /></section>
        <section id="resources"><DIYSection /></section>
        <Testimonials />
        <section id="faq"><FAQ /></section>
      </main>
      <Footer />
    </div>
  );
}
