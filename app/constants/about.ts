import kicktribeLogo from "@/assets/kicktribe-small.png";
import viardexLogo from "@/assets/viardex-small.png";

export const aboutData = {
  name: "Solomon Olatunji",
  description: "Software engineer building production-ready web and mobile products.",
};

export const activeProducts = [
  {
    label: "KickTribe",
    description: "sports predictions and betting product",
    logo: kicktribeLogo,
  },
  {
    label: "Viardex",
    description: "modern finance app",
    logo: viardexLogo,
  },
] as const;

export const profileLinks = [
  {
    label: "GitHub",
    value: "github.com/solomonolatunji",
    href: "https://github.com/solomonolatunji",
    icon: "github",
  },
  {
    label: "Email",
    value: "iamsolomonolatunj@gmail.com",
    href: "mailto:iamsolomonolatunj@gmail.com",
    icon: "email",
  },
  {
    label: "X",
    value: "@eminisolomon",
    href: "https://twitter.com/eminisolomon",
    icon: "x",
  },
  {
    label: "TikTok",
    value: "@eminiakinlabi",
    href: "https://www.tiktok.com/@eminiakinlabi",
    icon: "tiktok",
  },
  {
    label: "LinkedIn",
    value: "linkedin.com/in/realsolomon",
    href: "https://www.linkedin.com/in/realsolomon",
    icon: "linkedin",
  },
  {
    label: "WhatsApp",
    value: "+2348130690998",
    href: "https://wa.me/2348130690998",
    icon: "whatsapp",
  },
] as const;
