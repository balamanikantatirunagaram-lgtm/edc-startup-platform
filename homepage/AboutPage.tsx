import Navbar from "@/components/landing/Navbar";
import About from "@/components/landing/About";
import Footer from "@/components/landing/Footer";

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 pt-12 pb-12">
        <About />
      </main>
      <Footer />
    </div>
  );
}
