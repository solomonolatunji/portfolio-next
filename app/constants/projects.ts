import type { Project } from "@/interfaces/portfolio";

export const projects: Project[] = [
  {
    id: "13",
    title: "Codedock",
    year: "2026",
    category: "systems",
    featured: true,
    description:
      "Open-source self-hosted PaaS. Turns any VPS into your own private Vercel or Railway in 60 seconds with 1-click database provisioning and Docker/Nixpacks deployments.",
    technologies: ["Go", "Docker", "TypeScript", "React", "Echo", "PostgreSQL", "Redis"],
    links: [
      {
        label: "Live",
        href: "https://codedock.run",
      },
      {
        label: "GitHub",
        href: "https://github.com/buildwithtechx/codedock",
      },
    ],
  },
  {
    id: "12",
    title: "Outpipe",
    year: "2026",
    category: "systems",
    featured: true,
    description:
      "High-performance tunneling platform for exposing local and private services through secure public endpoints with Go relays, CLI, React dashboard, and Tauri desktop client.",
    technologies: [
      "Go",
      "WebSockets",
      "Fiber",
      "TypeScript",
      "React",
      "Tauri",
      "PostgreSQL",
      "Redis",
    ],
    links: [
      {
        label: "Live",
        href: "https://outpipe.dev",
      },
      {
        label: "GitHub",
        href: "https://github.com/buildwithtechx/outpipe",
      },
    ],
  },
  {
    id: "11",
    title: "DevPulse",
    year: "2026",
    category: "mobile",
    featured: true,
    description: "Open-source WakaTime mobile client built with React Native and Expo.",
    technologies: ["React Native", "Expo", "TypeScript", "WakaTime API"],
    links: [
      {
        label: "Google Play",
        href: "https://play.google.com/store/apps/details?id=com.techx.devpulse&hl=en",
      },
      {
        label: "GitHub",
        href: "https://github.com/solomonolatunji/DevPulse.git",
      },
      {
        label: "WakaTime",
        href: "https://wakatime.com/",
      },
    ],
  },
  {
    id: "1",
    title: "TakeNTrade",
    year: "2024",
    category: "mobile",
    featured: true,
    description:
      "Fintech product for payments, savings, loans, and investments across web and mobile.",
    technologies: ["React", "React Native", "NestJS", "TypeScript", "PostgreSQL"],
    links: [
      { label: "Live", href: "https://takentrade.com" },
      {
        label: "Google Play",
        href: "https://play.google.com/store/apps/details?id=com.takentrade.app",
      },
      {
        label: "App Store",
        href: "https://apps.apple.com/ng/app/xpress-takentrade/id6748635694",
      },
    ],
  },
  {
    id: "10",
    title: "XDrive",
    year: "2025",
    category: "mobile",
    description: "Vehicle marketplace app and backend for listings, search, and real-time updates.",
    technologies: ["React Native", "Expo", "TypeScript", "Laravel", "MySQL", "WebSockets"],
    links: [
      { label: "Live", href: "https://www.xdriveautos.com" },
      {
        label: "Google Play",
        href: "https://play.google.com/store/apps/details?id=com.xdrive.app",
      },
    ],
  },
  {
    id: "8",
    title: "Tercescrow",
    year: "2025",
    category: "mobile",
    description: "Gift card and crypto trading app focused on speed, trust, and ease of use.",
    technologies: ["React Native", "TypeScript", "Node.js", "Express", "MongoDB"],
    links: [
      { label: "Live", href: "https://tercescrow.com" },
      {
        label: "Google Play",
        href: "https://play.google.com/store/apps/details?id=com.tercescrow.app",
      },
      {
        label: "App Store",
        href: "https://apps.apple.com/ng/app/tercescrow/id6743555204",
      },
    ],
  },
  {
    id: "6",
    title: "Tickvo",
    year: "2025",
    category: "web",
    description: "Event operations platform for contests, awards, causes, and ticketing.",
    technologies: ["Laravel", "React", "Tailwind CSS", "PostgreSQL"],
    links: [{ label: "Live", href: "https://tickvo.com/" }],
  },
  {
    id: "9",
    title: "Kulipal",
    year: "2025",
    category: "mobile",
    description: "Lifestyle app for food orders, bookings, rentals, and event discovery.",
    technologies: ["React Native", "TypeScript", "Node.js", "Express", "MongoDB"],
    links: [
      { label: "Live", href: "https://kulipal.com" },
      {
        label: "Google Play",
        href: "https://play.google.com/store/apps/details?id=com.kulipamegaglobal.kulipal",
      },
      {
        label: "App Store",
        href: "https://apps.apple.com/ng/app/kulipal/id6456947840",
      },
    ],
  },
  {
    id: "2",
    title: "Estudylab",
    year: "2023",
    category: "mobile",
    description: "Learning platform for educational content, progress tracking, and delivery.",
    technologies: ["React", "React Native", "NestJS"],
    links: [{ label: "Live", href: "http://e-studylab.com/" }],
  },
  {
    id: "3",
    title: "Martsity",
    year: "2023",
    category: "web",
    description: "Ecommerce platform with product management, checkout, and order workflows.",
    technologies: ["PHP", "Laravel", "Bootstrap", "MySQL"],
    links: [{ label: "Live", href: "https://martsity.com/" }],
  },
  {
    id: "4",
    title: "Learnmonie",
    year: "2022",
    category: "web",
    description: "Affiliate platform for partnerships, commissions, and performance tracking.",
    technologies: ["PHP", "Bootstrap", "JavaScript", "MySQL"],
    links: [{ label: "Live", href: "https://learnmonie.com/" }],
  },
];
