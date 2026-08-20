import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { STARTUP_FLOW_STAGES } from "./StartupFlow";

export default function StartupFlowPreview() {
  return (
    <section className="py-20 sm:py-28 border-y bg-background relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-64 -z-10 bg-gradient-to-b from-primary/5 to-transparent" />
      
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Incubation Pipeline</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            From Student Idea to Incubation
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg">
            Our structured 10-phase incubation lifecycle helps transform raw innovations into investor-ready ventures.
          </p>
        </div>

        {/* Horizontal scroll or grid of milestones */}
        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {STARTUP_FLOW_STAGES.slice(0, 8).map((stage) => {
            const Icon = stage.icon;
            return (
              <div
                key={stage.step}
                className="relative flex flex-col p-5 rounded-2xl border bg-card hover:border-primary/40 hover:shadow-md transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Icon className="size-5" />
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground font-mono">
                    Step {stage.step}
                  </span>
                </div>
                <h3 className="font-semibold text-sm line-clamp-1 mb-1 group-hover:text-primary transition-colors">
                  {stage.title}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {stage.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* View full flow CTA */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 text-center">
          <Button asChild size="lg" className="gap-2">
            <Link href="/startup-flow">
              Explore Full 10-Stage Lifecycle <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" asChild size="lg">
            <Link href="/login">Apply as a Founder</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
