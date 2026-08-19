const teamMembers = [
  { role: "President", id: "N25H01A1042", name: "KORLAPALLY JASHWANTH", initials: "KJ" },
  { role: "Vice President", id: "N25H01A0165", name: "RANGA BALA VIGNESH", initials: "RV" },
  { role: "Operations Head", id: "N25H01A0317", name: "CHINTADA JOSHNA", initials: "CJ" },
  { role: "Social Media Head", id: "N25H01A0665", name: "ABBAGOUNI PRAMOD SRI GOUD", initials: "AP" },
  { role: "Outreach Head", id: "N25H01A0331", name: "MANNE SATHWIKA", initials: "MS" },
  { role: "Finance Head", id: "N25H01A0159", name: "RANGU VARUN", initials: "RV" },
  { role: "Research Head", id: "N25H01A0493", name: "DASARI ADITRI", initials: "DA" },
];

export default function Team() {
  return (
    <section className="py-24 sm:py-32 bg-background relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-10 dark:opacity-20 pointer-events-none">
        <div className="absolute -top-40 right-1/4 h-96 w-96 rounded-full bg-primary blur-3xl"></div>
        <div className="absolute top-1/2 -left-40 h-96 w-96 rounded-full bg-secondary blur-3xl"></div>
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-base font-semibold leading-7 text-primary tracking-wide uppercase">Our Team</h2>
          <p className="mt-2 text-4xl font-extrabold tracking-tight sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            Meet the Visionaries
          </p>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            The dedicated student leaders driving innovation and entrepreneurship at EDC × NIAT.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mx-auto max-w-7xl">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="group relative flex flex-col items-center p-8 rounded-3xl bg-background/50 backdrop-blur-xl border border-border/50 shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10 flex flex-col items-center w-full">
                <div className="h-28 w-28 rounded-full bg-muted/80 flex items-center justify-center mb-6 shadow-inner border border-background/50 group-hover:scale-105 transition-transform duration-300">
                  <span className="text-2xl font-bold text-muted-foreground/50">{member.initials}</span>
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-bold leading-7 text-foreground capitalize">
                    {member.name.toLowerCase()}
                  </h3>
                  <p className="text-sm font-semibold leading-6 text-primary uppercase tracking-wider">
                    {member.role}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono bg-muted/50 inline-block px-2 py-1 rounded-md">
                    ID: {member.id}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
