import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { User, CreditCard, Bell, Shield, Sparkles, ArrowRight } from "lucide-react";

const settingsNav = [
  { href: "/settings/profile", label: "Profile", icon: User, description: "Update your personal and business information", gradient: "from-primary to-secondary" },
  { href: "/settings/billing", label: "Billing", icon: CreditCard, description: "Manage subscription and payment methods", gradient: "from-quaternary to-emerald-400" },
  { href: "/settings/notifications", label: "Notifications", icon: Bell, description: "Configure when and how you get notified", gradient: "from-tertiary to-orange-400" },
  { href: "/settings/security", label: "Security", icon: Shield, description: "Password and account security", gradient: "from-destructive to-rose-400" },
  { href: "/settings/tone", label: "AI Tone", icon: Sparkles, description: "Upload writing samples for AI adaptation", gradient: "from-secondary to-rose-400" },
];

export default function SettingsPage() {
  return (
    <div>
      <h1 className="font-display font-extrabold text-3xl mb-8">Settings</h1>
      <div className="grid gap-4">
        {settingsNav.map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="group hover:-translate-y-[2px] hover:shadow-hard-lg cursor-pointer">
              <CardContent className="flex items-center gap-4 py-4">
                <div
                  className={`flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${item.gradient} border-2 border-foreground shadow-hard-sm group-hover:shadow-hard group-hover:animate-wiggle`}
                >
                  <item.icon className="h-6 w-6 text-white" strokeWidth={2.5} />
                </div>
                <div className="flex-1">
                  <div className="font-extrabold">{item.label}</div>
                  <div className="text-sm text-muted-foreground font-medium">
                    {item.description}
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
