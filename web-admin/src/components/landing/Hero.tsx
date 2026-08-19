import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-background pt-24 pb-32">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0 opacity-10 dark:opacity-20">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-secondary blur-3xl"></div>
      </div>

      <div className="container relative z-10 mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center text-center space-y-8">

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl max-w-4xl">
            Ignite Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">Startup Journey</span> at EDC
          </h1>

          <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
            The official student incubation portal to register your startup, find mentors, and get funded. Transform your ideas into reality.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center items-center">
            <a href="https://edc-student.vercel.app" target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="w-full sm:w-auto h-12 px-8 text-base group">
                Register Startup
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </a>
            <Link href="/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 px-8 text-base">
                Join a Team
              </Button>
            </Link>
          </div>
          
        </div>
      </div>
    </section>
  );
}
