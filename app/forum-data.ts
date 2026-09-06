export type ForumPost = {
  ownerId: string | null;
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  replies: number;
  views: number;
  likes: number;
  tags: string[];
  content: string[];
};

export const navItems = [
  "全部帖子",
  "机器人硬件",
  "ROS 与算法",
  "项目展示",
  "资料分享",
  "问题求助",
];
