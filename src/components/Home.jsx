import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Brands from "./components/Brands";
import About from "./components/About";
import Services from "./components/Services";
import Testimonials from "./components/Testimonials";
import DIYSection from "./components/DIYSection";
import FAQ from "./components/FAQ";
import Footer from "./components/Footer";
import "./css/App.css";

export default function App() {
  return (
    <div className="app">
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
