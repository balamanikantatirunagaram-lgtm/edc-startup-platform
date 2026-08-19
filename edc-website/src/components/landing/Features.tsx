import { Lightbulb, Users, Building, Coins } from "lucide-react";

const features = [
  {
    name: "Mentorship",
    description: "Get 1-on-1 guidance from industry experts, alumni founders, and domain specialists who have been there and done that.",
    icon: Users,
  },
  {
    name: "Incubation Space",
    description: "Access our state-of-the-art physical incubation center, complete with meeting rooms, high-speed internet, and a collaborative environment.",
    icon: Building,
  },
  {
    name: "Funding & Grants",
    description: "Connect with angel investors, VC networks, and apply for college seed funds designed to get your startup off the ground.",
    icon: Coins,
  },
  {
    name: "Workshops & Events",
    description: "Exclusive access to masterclasses on pitching, product development, legal compliance, and more to upskill your founding team.",
    icon: Lightbulb,
  },
];

export default function Features() {
  return (
    <section className="bg-muted/50 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-primary">Everything you need</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Empowering your startup from idea to scale
          </p>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            We provide a comprehensive ecosystem designed to support student founders at every stage of their entrepreneurial journey.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-4">
            {features.map((feature) => (
              <div key={feature.name} className="flex flex-col items-start">
                <div className="rounded-lg bg-primary/10 p-3 ring-1 ring-primary/20 mb-4">
                  <feature.icon className="h-6 w-6 text-primary" aria-hidden="true" />
                </div>
                <dt className="text-xl font-semibold leading-7">
                  {feature.name}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-muted-foreground">
                  <p className="flex-auto">{feature.description}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
