import Navbar from "@/components/landing/Navbar";
import Team from "@/components/landing/Team";
import Footer from "@/components/landing/Footer";

export default function TeamPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Team />
      </main>
      <Footer />
    </div>
  );
}
