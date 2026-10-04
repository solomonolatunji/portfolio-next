export interface ProjectLink {
  label: string;
  href: string;
}

export interface Project {
  id: string;
  title: string;
  year: string;
  category: "web" | "mobile" | "ui" | "systems";
  description: string;
  featured?: boolean;
  technologies: string[];
  links: ProjectLink[];
}
