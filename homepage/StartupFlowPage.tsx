import Navbar from "@/components/landing/Navbar";
import StartupFlow from "@/components/landing/StartupFlow";
import Footer from "@/components/landing/Footer";

export default function StartupFlowPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 pt-6 pb-12">
        <StartupFlow />
      </main>
      <Footer />
    </div>
  );
}
