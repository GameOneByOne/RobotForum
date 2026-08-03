export type ProjectCard = {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  author: string;
  githubUrl: string;
  views: number;
  likes: number;
};

export type KnowledgeItem = {
  slug: string;
  title: string;
  summary: string;
  content: string;
  type:
    | "Tutorial"
    | "Guide"
    | "Best Practice"
    | "Reference"
    | "FAQ"
    | "Engineering Note";
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  tags: string[];
  views: number;
  likes: number;
};

export type ResourceItem = {
  slug: string;
  title: string;
  description: string;
  type:
    | "Github Repository"
    | "Paper"
    | "Book"
    | "Dataset"
    | "Hardware"
    | "Tool"
    | "Course"
    | "Reference";
  url: string;
  tags: string[];
  views: number;
  likes: number;
};

export const globalNavigation = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "/projects" },
  { label: "Knowledge", href: "/knowledge" },
  { label: "Discuss", href: "/discuss" },
  { label: "Resources", href: "/resources" },
];
