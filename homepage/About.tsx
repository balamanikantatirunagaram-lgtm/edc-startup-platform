import Image from "next/image";
import { Trophy, Lightbulb, Users, Network, Target, Globe, Rocket } from "lucide-react";

export default function About() {
  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-16 sm:pt-32 sm:pb-24">
        <div className="absolute inset-x-0 top-0 h-96 -z-10 bg-gradient-to-b from-primary/10 to-transparent"></div>
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center text-center space-y-6 max-w-4xl mx-auto">
            <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl">
              About <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">EDC × NIAT</span>
            </h1>
            <p className="text-xl leading-relaxed text-muted-foreground">
              We serve as a catalyst for student-led innovation, venture creation, and technological problem-solving. We bridge the gap between academic theory and real-world execution, empowering aspiring founders to transform novel ideas into scalable, market-ready businesses.
            </p>
          </div>
        </div>
      </section>

      {/* Core Pillars - Bento Grid */}
      <section className="py-16 sm:py-24 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Core Pillars & Activities</h2>
            <p className="mt-4 text-lg text-muted-foreground">The foundation of our ecosystem, designed to accelerate your startup journey.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Bento Card 1 (Large) */}
            <div className="group relative overflow-hidden rounded-3xl bg-background border p-8 shadow-sm transition-all hover:shadow-md lg:col-span-2">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <Trophy className="h-32 w-32 text-primary" />
              </div>
              <div className="relative z-10 flex flex-col h-full">
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Trophy className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold mb-3">High-Impact Competitions</h3>
                <p className="text-muted-foreground flex-1">
                  We host structured 24- to 48-hour build sprints, ideathons, and investor-style pitch battles. These events challenge students to prototype real-world solutions, validate business models under pressure, and compete for seed grants and incubation support.
                </p>
              </div>
            </div>

            {/* Bento Card 2 */}
            <div className="group relative overflow-hidden rounded-3xl bg-background border p-8 shadow-sm transition-all hover:shadow-md">
              <div className="relative z-10 flex flex-col h-full">
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/10 text-secondary">
                  <Lightbulb className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Tech Masterclasses</h3>
                <p className="text-muted-foreground text-sm">
                  Our interactive bootcamps dive deep into critical startup skills, covering product development, lean business modeling, go-to-market strategies, tech architecture, unit economics, and venture fundraising.
                </p>
              </div>
            </div>

            {/* Bento Card 3 */}
            <div className="group relative overflow-hidden rounded-3xl bg-background border p-8 shadow-sm transition-all hover:shadow-md">
              <div className="relative z-10 flex flex-col h-full">
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent-foreground">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Investor Mentorship</h3>
                <p className="text-muted-foreground text-sm">
                  We connect founders directly with seasoned entrepreneurs, angel investors, venture capitalists, and domain experts through one-on-one office hours, product teardowns, and portfolio reviews.
                </p>
              </div>
            </div>

            {/* Bento Card 4 (Large) */}
            <div className="group relative overflow-hidden rounded-3xl bg-primary text-primary-foreground p-8 shadow-md lg:col-span-2 flex items-center">
              <div className="absolute -right-12 -bottom-12 opacity-20">
                <Network className="h-64 w-64" />
              </div>
              <div className="relative z-10 max-w-lg">
                <h3 className="text-3xl font-bold mb-4">Founder Ecosystem</h3>
                <p className="text-primary-foreground/80 text-lg">
                  EDC cultivates an active network of engineers, designers, and business strategists. We facilitate cross-disciplinary collaboration, helping students find co-founders, assemble founding teams, and build collaborative ventures from the ground up.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Join Section */}
      <section className="py-16 sm:py-24 relative">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            
            <div className="lg:w-1/2 space-y-12">
              <div>
                <h2 className="text-4xl font-bold tracking-tight">Why Join the Ecosystem?</h2>
                <p className="mt-4 text-lg text-muted-foreground">Everything you need to launch and scale your venture.</p>
              </div>
              
              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="mt-1 bg-primary/10 p-2 rounded-lg h-fit">
                    <Rocket className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold mb-2">From Zero to One</h4>
                    <p className="text-muted-foreground">Access resources, frameworks, and peer feedback to take projects from initial whiteboard concepts to functional Minimum Viable Products (MVPs).</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="mt-1 bg-primary/10 p-2 rounded-lg h-fit">
                    <Globe className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold mb-2">Network & Capital</h4>
                    <p className="text-muted-foreground">Gain direct exposure to external incubators, startup accelerators, and angel networks actively looking to back collegiate founders.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="mt-1 bg-primary/10 p-2 rounded-lg h-fit">
                    <Target className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold mb-2">Execution Mindset</h4>
                    <p className="text-muted-foreground">Develop leadership, resilience, and operational capabilities that prepare you to lead early-stage ventures or drive innovation inside fast-growing tech companies.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:w-1/2 flex justify-center">
              <div className="relative aspect-square w-full max-w-md">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl opacity-50 mix-blend-multiply"></div>
                <div className="relative bg-background/50 backdrop-blur-xl border shadow-2xl rounded-3xl p-12 h-full flex items-center justify-center">
                  <Image src="/logo.png" alt="EDC Logo" width={300} height={300} className="object-contain hover:scale-105 transition-transform duration-500" />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
