import Navbar from "@/components/landing/Navbar";
import Contact from "@/components/landing/Contact";
import Footer from "@/components/landing/Footer";

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
