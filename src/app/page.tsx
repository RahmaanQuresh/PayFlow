import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Shield, Bell, Sparkles, Star } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 dot-grid pointer-events-none" />
      <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-tl from-secondary/15 to-transparent rounded-full blur-3xl pointer-events-none" />

      <header className="border-b-2 border-foreground bg-card/80 backdrop-blur-sm relative z-10">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 max-w-6xl">
          <span className="font-display text-2xl font-black tracking-tighter bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            PayFlow
          </span>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="outline" size="sm">
                Log in
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="gradient" size="sm">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 relative z-10">
        <section className="container mx-auto px-4 py-20 sm:py-28 text-center max-w-6xl">
          <div className="inline-flex items-center gap-2 rounded-full border-2 border-foreground bg-card px-4 py-1.5 text-sm font-bold shadow-hard-sm mb-8 animate-slide-up">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              New: AI-Powered Tone Adaptation
            </span>
          </div>

          <h1 className="font-display font-black text-5xl sm:text-6xl lg:text-7xl leading-[0.9] tracking-tight max-w-4xl mx-auto animate-slide-up">
            Get paid on time,{" "}
            <span className="bg-gradient-to-r from-primary via-secondary to-tertiary bg-clip-text text-transparent">
              every time
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto font-medium animate-slide-up [animation-delay:100ms]">
            PayFlow automates invoice reminders, adapts to your communication
            style, and guides legal escalation — so you can focus on your work,
            not chasing payments.
          </p>

          <div className="mt-10 flex items-center justify-center gap-4 flex-wrap animate-slide-up [animation-delay:200ms]">
            <Link href="/register">
              <Button size="xl" variant="gradient">
                Start Free Trial{" "}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="#features">
              <Button size="xl" variant="outline">
                Learn More
              </Button>
            </Link>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-3 animate-slide-up [animation-delay:300ms]">
            <div className="flex items-center gap-3 justify-center">
              <span className="font-display font-black text-3xl text-primary">3x</span>
              <span className="text-sm text-muted-foreground font-medium">
                Faster payments
              </span>
            </div>
            <div className="flex items-center gap-3 justify-center">
              <span className="font-display font-black text-3xl text-secondary">85%</span>
              <span className="text-sm text-muted-foreground font-medium">
                Less admin time
              </span>
            </div>
            <div className="flex items-center gap-3 justify-center">
              <span className="font-display font-black text-3xl text-tertiary">10k+</span>
              <span className="text-sm text-muted-foreground font-medium">
                Freelancers trust us
              </span>
            </div>
          </div>
        </section>

        <section
          id="features"
          className="container mx-auto px-4 py-20 max-w-6xl relative"
        >
          <div className="absolute top-0 left-1/2 w-px h-full border-l-2 border-dashed border-foreground/10 hidden lg:block pointer-events-none" />

          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-center mb-4">
            Everything you need to{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              get paid
            </span>
          </h2>
          <p className="text-center text-muted-foreground mb-14 max-w-xl mx-auto font-medium">
            Powerful tools wrapped in a warm, friendly experience. No finance
            degree required.
          </p>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                icon: Bell,
                title: "Smart Reminders",
                desc: "Automated reminder sequences that adapt to your tone. Polite first, firm when needed.",
                gradient: "from-primary to-secondary",
              },
              {
                icon: Zap,
                title: "AI Tone Adaptation",
                desc: "Upload writing samples and let AI craft reminders that sound exactly like you.",
                gradient: "from-secondary to-rose-400",
              },
              {
                icon: Shield,
                title: "Legal Escalation",
                desc: "Generate formal demand letters and access small claims guides when reminders aren't enough.",
                gradient: "from-tertiary to-orange-400",
              },
            ].map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group rounded-2xl border-2 border-foreground bg-card p-6 shadow-hard-sm hover:shadow-hard-lg hover:-translate-x-[2px] hover:-translate-y-[2px] bouncy relative"
                >
                  <div
                    className={`absolute -top-6 left-6 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} border-2 border-foreground shadow-hard-sm group-hover:shadow-hard`}
                  >
                    <Icon className="h-6 w-6 text-white" strokeWidth={2.5} />
                  </div>
                  <h3 className="font-display font-extrabold text-xl mt-5">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed font-medium">
                    {feature.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="container mx-auto px-4 py-20 max-w-6xl">
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-center mb-4">
            Simple,{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              transparent pricing
            </span>
          </h2>
          <p className="text-center text-muted-foreground mb-14 max-w-xl mx-auto font-medium">
            Start free, upgrade when you&rsquo;re ready. No hidden fees, no surprises.
          </p>

          <div className="grid gap-8 md:grid-cols-3 max-w-4xl mx-auto">
            {[
              {
                name: "Free",
                price: "$0",
                desc: "Perfect for getting started",
                features: [
                  "Up to 3 invoices",
                  "5 clients",
                  "3 reminder sequences",
                  "Basic reporting",
                  "Email support",
                ],
                cta: "Start Free",
                highlight: false,
              },
              {
                name: "Premium",
                price: "$19/mo",
                desc: "For growing freelancers",
                features: [
                  "Unlimited invoices",
                  "Unlimited clients",
                  "AI tone adaptation",
                  "Advanced analytics",
                  "Priority support",
                  "Legal escalation tools",
                ],
                cta: "Go Premium",
                highlight: true,
              },
              {
                name: "Team",
                price: "$49/mo",
                desc: "For small agencies",
                features: [
                  "Everything in Premium",
                  "Up to 10 team members",
                  "Team analytics",
                  "Custom branding",
                  "API access",
                  "Dedicated support",
                ],
                cta: "Contact Sales",
                highlight: false,
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl border-2 border-foreground bg-card p-6 shadow-hard bouncy hover:-translate-y-[4px] hover:shadow-hard-lg flex flex-col ${
                  plan.highlight ? "md:scale-105 z-10" : ""
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-tertiary to-orange-400 border-2 border-foreground px-4 py-1 text-xs font-black uppercase tracking-wider text-foreground shadow-hard-sm -rotate-3">
                    <Star className="h-3 w-3 inline mr-1" />
                    Most Popular
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="font-display font-extrabold text-2xl">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 font-medium">
                    {plan.desc}
                  </p>
                </div>
                <div className="mb-6">
                  <span className="font-display font-black text-4xl">
                    {plan.price}
                  </span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2 text-sm font-medium"
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-quaternary/20 mt-0.5">
                        <svg
                          className="h-3 w-3 text-quaternary"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  variant={plan.highlight ? "gradient" : "outline"}
                  className="w-full"
                  size="lg"
                >
                  {plan.cta}
                </Button>
              </div>
            ))}
          </div>
        </section>

        <section className="container mx-auto px-4 py-20 max-w-6xl text-center">
          <div className="rounded-3xl border-2 border-foreground bg-gradient-to-br from-primary/5 to-secondary/5 p-10 sm:p-16 shadow-hard">
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl mb-4">
              Ready to stop chasing payments?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto font-medium">
              Join thousands of freelancers who get paid on time, every time.
              Start your free trial today.
            </p>
            <Link href="/register">
              <Button size="xl" variant="gradient">
                Get Started Free{" "}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t-2 border-foreground bg-muted/30 relative z-10">
        <div className="container mx-auto px-4 py-8 text-center max-w-6xl">
          <p className="text-sm text-muted-foreground font-medium">
            &copy; {new Date().getFullYear()} PayFlow. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
