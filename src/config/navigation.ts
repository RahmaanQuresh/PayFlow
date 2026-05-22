export const siteConfig = {
  name: "PayFlow",
  description: "Invoice escalation SaaS for freelancers",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ogImage: "/og-image.png",
  links: {
    twitter: "https://twitter.com/payflow",
    github: "https://github.com/payflow",
  },
};

export const navigation = {
  main: [
    { name: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
    { name: "Invoices", href: "/invoices", icon: "FileText" },
    { name: "Clients", href: "/clients", icon: "Users" },
    { name: "Reminders", href: "/reminders", icon: "Bell" },
    { name: "Reports", href: "/reports", icon: "BarChart3" },
    { name: "Legal", href: "/legal", icon: "Scale" },
    { name: "Settings", href: "/settings", icon: "Settings" },
  ],
};
