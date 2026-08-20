import StartupFlow from "@/components/landing/StartupFlow";

export const metadata = {
  title: "Startup Flow | EDC NIAT X CDU",
  description: "Explore the step-by-step incubation lifecycle from initial startup idea to investor demo day and incubation.",
};

export default function StartupFlowPage() {
  return (
    <div className="pt-6 pb-12">
      <StartupFlow />
    </div>
  );
}
