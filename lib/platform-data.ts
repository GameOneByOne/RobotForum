export type ProjectCard = {
  ownerId: string | null;
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
  id: string;
  authorId: string | null;
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
  creatorId: string | null;
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
  { label: "首页", href: "/" },
  { label: "项目", href: "/projects" },
  { label: "知识库", href: "/knowledge" },
  { label: "讨论", href: "/discuss" },
  { label: "资源", href: "/resources" },
];
