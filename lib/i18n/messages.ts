export type Locale = "zh" | "en";
export type TranslationParams = Record<string, string | number>;

// Keys describe UI only. User-authored titles, Markdown, tags and comments are
// never passed through this dictionary.
export const en: Record<string, string> = {
  创建者: "Author",
  创建时间: "Created",
  最新修改时间: "Last updated",
  北京时间: "Beijing time (UTC+8)",
  时间显示: "Time zone",
  搜索知识库: "Search the knowledge base",
  "搜索标题、简介或标签…": "Search titles, summaries or tags…",
  "显示 {0} 篇知识库": "{0} articles",
  "暂无匹配的知识库。": "No matching articles.",
  "ROBOTICS KNOWLEDGE BASE": "ROBOTICS KNOWLEDGE BASE",
  "从开发环境到机器人实践，查找需要的知识与操作方法。":
    "Find knowledge and practical guides, from development tools to building robots.",
  项目概况: "Project overview",
  卡片简介: "Card summary",
  "简要说明要做出什么，以及适合谁。":
    "Briefly describe what readers will build and who it is for.",
  项目难度: "Difficulty",
  预计用时: "Estimated time",
  "例如：约 30 分钟": "For example: about 30 minutes",
  "用逗号分隔，例如 ROS 2, 仿真":
    "Separate tags with commas, e.g. ROS 2, simulation",
  前置要求: "Prerequisites",
  "先说明运行环境和所需资源，让读者判断是否可以开始。":
    "Describe the environment and resources readers need before they start.",
  操作系统: "Operating system",
  "硬件要求（每行一项）": "Hardware requirements (one per line)",
  "例如：一台电脑、键盘；无需实体机器人":
    "For example: a computer and keyboard; no physical robot needed",
  "软件要求（每行一项）": "Software requirements (one per line)",
  "已有知识（每行一项）": "Prior knowledge (one per line)",
  "例如：能打开终端并运行命令":
    "For example: opening a terminal and running commands",
  项目说明与操作内容: "Project guide and instructions",
  "支持 Markdown、代码、图片和公式，已有内容不会被翻译。":
    "Supports Markdown, code, images and math. Authored content keeps its original language.",
  配置学习路线: "Build the learning path",
  "按实践顺序添加阶段，为每个阶段关联知识与验收目标。":
    "Add stages in practical order, then link articles and define an outcome for each stage.",
  添加阶段: "Add stage",
  "尚未添加阶段，点击“添加阶段”开始配置。":
    "No stages yet. Select Add stage to start.",
  未命名阶段: "Untitled stage",
  上移阶段: "Move stage up",
  下移阶段: "Move stage down",
  删除阶段: "Delete stage",
  阶段名称: "Stage title",
  阶段说明: "Stage description",
  "实践成果 / 验收目标": "Outcome / acceptance criteria",
  "例如：用键盘控制小海龟，并看到速度消息。":
    "For example: control the turtle with the keyboard and observe velocity messages.",
  "阶段操作步骤（Markdown）": "Stage instructions (Markdown)",
  关联知识库文章: "Linked knowledge articles",
  选择要关联的文章: "Select an article to link",
  选择一篇文章添加到本阶段: "Select an article for this stage",
  "暂无可关联的已发布文章，仍可编写阶段操作步骤。":
    "No published articles are available. You can still write stage instructions.",
  文章暂不可用: "Article unavailable",
  文章学习类型: "Article role",
  必学: "Required",
  按需补充: "Learn as needed",
  移除关联: "Unlink",
  自主安排: "Self-paced",
  项目学习路线: "Project learning path",
  "另有 {0} 个阶段": "{0} more stages",
  "{0} 个学习阶段": "{0} learning stages",
  查看学习路线: "Explore the path",
  查看项目: "View project",
  硬件要求: "Hardware",
  软件环境: "Software",
  已有知识: "Prior knowledge",
  开始之前: "Before you start",
  项目说明: "Project guide",
  从实践走向理解: "LEARN BY BUILDING",
  "{0} 个阶段 · 按需补充理论": "{0} stages · theory when you need it",
  学习阶段: "Learning stages",
  "阶段 {0} / {1}": "Stage {0} / {1}",
  本阶段验收目标: "Stage acceptance criteria",
  操作步骤: "Instructions",
  阶段切换: "Stage navigation",
  "← 上一阶段": "← Previous stage",
  "下一阶段 →": "Next stage →",
  "作者尚未配置学习路线。": "The author has not added a learning path yet.",
  "选择一个想做的项目，按阶段学习并完成实践。":
    "Choose a project to build, then follow its stages from learning to practice.",
  "项目字段格式不正确或内容过长。": "A project field is invalid or too long.",
  "每项前置要求最多填写 40 条。":
    "Each requirement group supports up to 40 entries.",
  "项目标签最多 20 个，每个不超过 60 字。":
    "Use up to 20 tags, with at most 60 characters each.",
  "学习路线最多包含 30 个阶段。": "A learning path supports up to 30 stages.",
  "学习路线格式不正确。": "The learning path is invalid.",
  "每个阶段都需要名称和实践成果。": "Each stage needs a title and an outcome.",
  "每个阶段最多关联 30 篇知识库文章。":
    "Link up to 30 knowledge articles per stage.",
  "关联文章格式不正确。": "A linked article is invalid.",
  "关联文章无效、重复或学习类型不正确。":
    "A linked article is invalid, duplicated or has an invalid role.",
  "项目名称和介绍不能为空。": "Project title and summary are required.",
  "项目链接必须使用 HTTP 或 HTTPS 地址。": "Use an HTTP or HTTPS project URL.",
  "项目难度不正确。": "The project difficulty is invalid.",
  "项目保存暂不可用，请稍后再试。":
    "Project saving is unavailable. Please try again later.",
  "项目标识无效。": "The project ID is invalid.",
  "项目保存失败，请检查关联文章是否仍可用后重试。":
    "Could not save the project. Check that linked articles are still available, then try again.",
  "项目保存失败，请稍后重试。":
    "Could not save the project. Please try again later.",
  资源分享: "Shared resources",
  沉浸式阅读: "Immersive reading",
  退出沉浸式: "Exit immersive mode",
  "Esc 退出": "Esc to exit",
  塔洛维恩: "Talovryn",
  "塔洛维恩 · 机器人开发者社区": "A community for robot builders.",
  机器人开发者社区: "A community for robot builders.",
  "让你的想法，拥有行动的能力": "Build Your Own Robot",
  "语言切换失败，请重试。": "Could not switch languages. Please try again.",
  "\n| 字段 | 说明 |\n| --- | --- |\n| 示例 | 内容 |\n":
    "\n| Field | Description |\n| --- | --- |\n| Example | Content |\n",
  "Cloudinary 图床未配置": "Image hosting is not configured",
  请选择有效图片文件: "Choose a valid image file",
  "请先登录后再进行此操作。": "Please sign in to continue.",
  "学习顺序请输入 1 至 9999 的整数，或留空。":
    "Enter a lesson order from 1 to 9999, or leave it blank.",
  "知识库名称和正文不能为空。": "Article title and content are required.",
  "缺少知识库标识，无法更新。":
    "The article ID is missing. Refresh and try again.",
  "Supabase 环境变量未配置，暂时无法更新知识库内容。":
    "Article updates are unavailable until the database is configured.",
  "标签保存失败：{0}": "Could not save tags: {0}",
  "标签读取失败：{0}": "Could not load tags: {0}",
  "标签关联失败：{0}": "Could not link tags: {0}",
  "更新失败：{0}": "Update failed: {0}",
  "发布失败：{0}": "Publishing failed: {0}",
  "未找到要更新的知识库，请刷新后重试":
    "Article not found. Refresh and try again.",
  首页: "Home",
  项目: "Projects",
  知识库: "Knowledge",
  讨论: "Discuss",
  资源: "Resources",
  主导航: "Main navigation",
  查看全部: "View all",
  项目展示: "Projects",
  最新讨论: "Latest discussions",
  资源目录: "Resources",
  "数据库中暂无知识库数据。": "No knowledge articles yet.",
  "数据库中暂无项目数据。": "No projects yet.",
  "数据库中暂无讨论数据。": "No discussions yet.",
  "数据库中暂无资源数据。": "No resources yet.",
  "搜索知识、项目、讨论和资源":
    "Search knowledge, projects, discussions and resources",
  "搜索知识、项目或问题…": "Search knowledge, projects or questions…",
  提交搜索: "Submit search",
  搜索: "Search",
  全站搜索: "Search Talovryn",
  "搜索知识正文、标题、简介和标签，发现相关项目、讨论与资源。":
    "Search article text, titles, summaries and tags to discover projects, discussions and resources.",
  "输入关键词开始搜索，例如 ROS2、Linux 或机械臂。":
    "Start with a keyword, such as ROS2, Linux or robot arms.",
  "· 已返回 {0} 条结果，每类最多显示 {1} 条":
    "· {0} results, up to {1} per category",
  "尚未连接内容数据库，暂时无法搜索。":
    "Search is unavailable until the content database is connected.",
  "部分内容暂时无法搜索，请稍后重试。下方保留已成功加载的结果。":
    "Some sources could not be searched. Available results are shown below. Please try again later.",
  "没有匹配的内容，试试更短的关键词或相关标签。":
    "No matches. Try a shorter keyword or a related tag.",
  工程知识库: "Engineering knowledge",
  "从开发基础到完整机器人项目，沿着初级、中级、高级三个阶段逐步学习。":
    "Learn step by step, from development fundamentals to complete robot projects, across beginner, intermediate and advanced stages.",
  发布知识库: "Publish article",
  登录后发布: "Sign in to publish",
  返回知识库: "Back to knowledge",
  返回知识库详情: "Back to article",
  机器人学习路线: "Robotics learning path",
  学习等级筛选: "Filter by learning level",
  全部: "All",
  初级: "Beginner",
  中级: "Intermediate",
  高级: "Advanced",
  "建立开发环境、编程、数学与硬件基础。":
    "Build a foundation in development tools, programming, mathematics and hardware.",
  "目标：准备好独立开发所需的基础工具与知识。":
    "Goal: gain the tools and knowledge to develop independently.",
  "连接 ROS 2、模型、仿真、感知与闭环控制。":
    "Connect ROS 2, models, simulation, perception and closed-loop control.",
  "目标：让各个机器人模块在仿真中协同工作。":
    "Goal: bring robot modules together in simulation.",
  "掌握运动学、规划、导航与完整系统实践。":
    "Explore kinematics, planning, navigation and complete robotic systems.",
  "目标：完成可验证、可复现的机器人任务。":
    "Goal: complete robot tasks with verifiable, reproducible results.",
  搜索学习路线中的课程: "Search lessons in the learning path",
  "搜索课程名称、简介或标签…": "Search lesson titles, summaries or tags…",
  "显示 {0} 篇课程 · 按学习顺序排列": "{0} lessons · in learning order",
  "第 {0} 课": "Lesson {0}",
  拓展阅读: "Further reading",
  "该等级没有匹配的课程，请尝试其他关键词。":
    "No matching lessons at this level. Try another keyword.",
  "该等级暂无课程。": "No lessons at this level yet.",
  暂无章节内容: "No chapters yet",
  章节导航: "Chapters",
  阅读设置: "Reading settings",
  章节: "Chapter",
  正文字号: "Text size",
  小: "Small",
  标准: "Medium",
  大: "Large",
  "{0}字号": "{0} text size",
  浅色阅读: "Light theme",
  深色阅读: "Dark theme",
  "本节目录 · {0} 个标题": "On this page · {0} headings",
  本节目录: "On this page",
  章节翻页: "Chapter navigation",
  "← 上一章": "← Previous chapter",
  "下一章 →": "Next chapter →",
  编辑本章节: "Edit chapter",
  新建子章节: "Add subchapter",
  新建章节: "Add chapter",
  机器人开发资源目录: "Robotics resources",
  "精选开源工具、论文、硬件与课程，连接你的下一步工程实践。":
    "Discover open-source tools, papers, hardware and courses for your next project.",
  发布资源: "Share resource",
  编辑资源: "Edit resource",
  返回资源目录: "Back to resources",
  打开资源链接: "Open resource",
  "从工程想法到真实作品，探索机器人开发者的开源实践。":
    "Explore open-source robotics projects, from engineering ideas to working creations.",
  发布项目: "Share project",
  编辑项目: "Edit project",
  返回项目列表: "Back to projects",
  "打开 GitHub": "View on GitHub",
  讨论分类: "Categories",
  全部帖子: "All posts",
  机器人硬件: "Robot hardware",
  "ROS 与算法": "ROS & algorithms",
  资料分享: "Resource sharing",
  问题求助: "Help & questions",
  发布帖子: "New post",
  返回讨论列表: "Back to discussions",
  返回帖子详情: "Back to post",
  编辑帖子: "Edit post",
  删除帖子: "Delete post",
  "还没有相关讨论，分享你的第一个工程问题吧。":
    "No discussions yet. Start with your first engineering question.",
  一起解决工程问题: "Solve engineering problems together",
  "分享背景、复现步骤和代码片段，让其他开发者更快理解你的问题。":
    "Share context, steps to reproduce and code snippets to help other developers understand your question.",
  "浏览工程知识库 →": "Explore engineering knowledge →",
  查看: "View",
  "作者：": "Author: ",
  "发布时间：": "Published: ",
  "回复：": "Replies: ",
  "阅读：": "Views: ",
  "点赞：": "Likes: ",
  评论: "Comments",
  "写下你的想法...": "Share your thoughts…",
  发表评论: "Post comment",
  "暂无评论。": "No comments yet.",
  注册账号: "Sign up",
  邮箱登录: "Email sign-in",
  创建论坛账号: "Join Talovryn",
  登录塔洛维恩: "Sign in to Talovryn",
  "游客可以浏览内容；登录后可以发布内容，并管理自己发布的帖子、项目、知识库和资源。":
    "Browse as a guest, or sign in to publish and manage your posts, projects, articles and resources.",
  邮箱: "Email",
  密码: "Password",
  "至少 6 位": "At least 6 characters",
  注册: "Sign up",
  登录: "Sign in",
  去登录: "Sign in",
  "已有账号？去登录": "Already have an account? Sign in",
  "没有账号？去注册": "New here? Sign up",
  我的账号: "My account",
  游客: "Guest",
  注册用户: "Member",
  账号: "Account",
  等级: "Level",
  积分: "Points",
  暂未开通: "Not available yet",
  退出登录: "Sign out",
  温馨提示: "A friendly reminder",
  "当前处于游客状态，可以评论、留言、点赞，但不能发布内容。":
    "You are browsing as a guest. You can comment, leave messages and like content, but cannot publish posts.",
  "{0}的头像": "Avatar of {0}",
  "{0}{1}的账号信息": "{0} account details for {1}",
  收起: "Hide",
  查看账号: "View",
  今日访问人数: "Visitors today",
  当前在线人数: "Online now",
  正在统计: "Updating",
  实时: "Live",
  暂不可用: "Unavailable",
  站点实时访问概览: "Live site traffic",
  访客统计更新失败: "Could not update visitor statistics",
  内容暂时无法加载: "Content could not be loaded",
  "请稍后重试，或返回其他页面继续浏览。":
    "Please try again later, or explore another page.",
  重新加载: "Try again",
  正在加载内容: "Loading content",
  暂时找不到这页内容: "Page not found",
  "内容可能已移动、删除，或暂未开放。你可以回到知识库继续探索。":
    "This page may have moved, been removed or is not available yet. Continue exploring the knowledge library.",
  "浏览知识库 →": "Explore knowledge →",
  返回首页: "Back to home",
  发布知识库内容: "Publish a knowledge article",
  "章节式 Markdown 编辑器": "Chapter-based Markdown editor",
  "左侧维护章节结构，右侧编辑当前章节正文；每个章节都是独立 Markdown 文档。":
    "Organize chapters on the left and edit the selected chapter on the right. Each chapter is a separate Markdown document.",
  "发布知识库需要先登录。": "Sign in to publish an article.",
  编辑知识库: "Edit article",
  删除知识库: "Delete article",
  "修改知识库名称、章节结构和正文后，点击更新发布即可覆盖当前内容。":
    "Edit the title, chapter structure and text, then publish your changes.",
  更新发布: "Publish changes",
  知识库名称: "Article title",
  知识库简介: "Summary",
  "用一两句话说明这篇知识库适合解决什么问题。":
    "Briefly describe what readers will learn or solve.",
  学习等级: "Learning level",
  学习顺序: "Lesson order",
  留空作为拓展阅读: "Leave blank for further reading",
  知识库标签: "Article tags",
  点击删除标签: "Remove tag",
  "输入标签后按 Enter": "Type a tag and press Enter",
  展开章节导航: "Show chapters",
  隐藏章节导航: "Hide chapters",
  "右键空白处新建章节，拖拽同级章节排序。":
    "Right-click empty space to add a chapter. Drag sibling chapters to reorder them.",
  当前章节名称: "Chapter title",
  "Markdown 正文": "Markdown content",
  "每个章节拥有独立 Markdown 文档，按 Tab 切换右侧预览。":
    "Each chapter has its own Markdown document. Press Tab to toggle the preview.",
  关闭预览: "Close preview",
  分屏预览: "Split preview",
  "{0} 个章节": "{0} chapters",
  "词数：{0}": "{0} words",
  删除章节: "Delete chapter",
  未命名章节: "Untitled chapter",
  未命名知识库: "Untitled article",
  新章节: "New chapter",
  "请在这里编写章节内容。": "Write your chapter here.",
  "正在保存...": "Saving…",
  保存失败: "Could not save",
  已保存: "Saved",
  图片上传失败: "Image upload failed",
  "正在上传 {0} 张图片...": "Uploading {0} images…",
  图片已上传: "Images uploaded",
  未识别到可插入的图片: "No supported images found",
  图片已插入: "Image inserted",
  二级标题: "Heading 2",
  标题: "Title",
  加粗: "Bold",
  加粗文本: "Bold text",
  斜体: "Italic",
  斜体文本: "Italic text",
  行内代码: "Inline code",
  代码块: "Code block",
  引用: "Quote",
  引用内容: "Quoted text",
  无序列表: "Bullet list",
  列表项: "List item",
  有序列表: "Numbered list",
  任务列表: "Task list",
  待办项: "Task",
  表: "Table",
  表格: "Table",
  链: "Link",
  链接: "Link",
  链接文本: "Link text",
  "Markdown 编辑器": "Markdown editor",
  "修改标题、分类和正文后，点击更新发布即可覆盖当前帖子内容。":
    "Edit the title, category and content, then publish your changes.",
  "按 Tab 打开或关闭右侧预览，编辑区会保持当前滚动位置。":
    "Press Tab to toggle the preview. Your editor scroll position is preserved.",
  "正文支持 CommonMark 和 GFM 语法，包括表格、任务列表、删除线、代码块和自动链接。":
    "Use CommonMark and GFM, including tables, task lists, strikethrough, code blocks and automatic links.",
  "发布帖子需要先登录。": "Sign in to publish a post.",
  "例如：机械臂舵机选型经验": "For example: choosing servos for a robot arm",
  分类: "Category",
  分享你的机器人项目: "Share your robot project",
  "发布项目需要先登录。": "Sign in to share a project.",
  项目名称: "Project name",
  项目介绍: "Project description",
  "GitHub 链接": "GitHub URL",
  标签: "Tags",
  "ROS, 机械臂, SLAM": "ROS, robot arms, SLAM",
  更新项目: "Update project",
  分享机器人开发资源: "Share a robotics resource",
  "发布资源需要先登录。": "Sign in to share a resource.",
  资源名称: "Resource name",
  资源链接: "Resource URL",
  类型: "Type",
  介绍: "Description",
  "仿真, 论文, 传感器": "simulation, papers, sensors",
  更新资源: "Update resource",
  工具: "Tool",
  "GitHub 仓库": "GitHub repository",
  论文: "Paper",
  书籍: "Book",
  数据集: "Dataset",
  硬件: "Hardware",
  课程: "Course",
  参考资料: "Reference",
  "Supabase 环境变量未配置，发布按钮会在提交时失败；配置完成后可直接写入 knowledge 表。":
    "Publishing is unavailable until the database is configured.",
  "Supabase 环境变量未配置，更新按钮会在提交时失败；配置完成后可直接写入 knowledge 表。":
    "Updates are unavailable until the database is configured.",
  "Supabase 环境变量未配置，发布按钮会在提交时失败；配置完成后可直接写入数据库。":
    "Publishing is unavailable until the database is configured.",
  "Supabase 环境变量未配置，更新按钮会在提交时失败；配置完成后可直接写入数据库。":
    "Updates are unavailable until the database is configured.",
  说明: "Note",
  提示: "Tip",
  注意: "Warning",
  概念解释: "Concept",
  具体例子: "Example",
  常见误解: "Common misconception",
  "数据表格，可横向滚动": "Data table, scroll horizontally",
  图片预览: "Image preview",
  "关闭预览 ×": "Close preview ×",
  "该图片来源暂不支持重播，可以继续播放或放大查看。":
    "Replay is unavailable for this image source. You can continue playback or enlarge the image.",
  "放大图片：{0}": "Enlarge image: {0}",
  图解: "Illustration",
  "点击放大 ↗": "Enlarge ↗",
  "图解 ·": "Illustration ·",
  播放动图: "Play animation",
  暂停动图: "Pause animation",
  "加载中…": "Loading…",
  重播: "Replay",
  已复制: "Copied",
  "复制失败，请选择代码后复制":
    "Could not copy. Select the code and copy it manually.",
  终端命令: "Terminal",
  "文本 / 输出": "Text / output",
  代码示例: "Code example",
  取消换行: "No wrap",
  自动换行: "Wrap lines",
  复制: "Copy",
  "代码内容，可滚动": "Code content, scrollable",
  收起代码: "Collapse code",
  "展开完整代码 · {0} 行": "Show full code · {0} lines",
  阅读样式预览: "Reading preview",
  "机器人知识库 · 图文阅读": "Robotics knowledge · reading preview",
  "查看文字、图解、代码、表格与公式的统一排版，也可以从目录打开现有 Linux 章节。":
    "Preview text, illustrations, code, tables and formulas, or open an existing Linux chapter.",
  知识库内容不存在: "Article not found",
  帖子不存在: "Post not found",
  "Supabase 环境变量未配置，暂时无法注册。":
    "Sign-up is unavailable until authentication is configured.",
  "请输入邮箱，并设置至少 6 位密码。":
    "Enter your email and a password of at least 6 characters.",
  "注册失败：{0}": "Sign-up failed: {0}",
  "注册成功。请查看邮箱完成验证后登录。":
    "Account created. Verify your email before signing in.",
  "Supabase 环境变量未配置，暂时无法登录。":
    "Sign-in is unavailable until authentication is configured.",
  "请输入邮箱和密码。": "Enter your email and password.",
  "登录失败：{0}": "Sign-in failed: {0}",
  "登录链接已失效，请重新登录。":
    "This sign-in link has expired. Please sign in again.",
};

// Decorative English labels also follow the selected UI language.
const zh: Record<string, string> = {
  "CONNECTION INTERRUPTED": "连接中断",
  "404 / NOT FOUND": "404 / 页面不存在",
  "404 / KNOWLEDGE NOT FOUND": "404 / 内容不存在",
  "404 · SIGNAL NOT FOUND": "404 · 页面不存在",
  "ROBOTICS LEARNING PATH": "机器人学习路线",
  "Github Repository": "GitHub 仓库",
  Paper: "论文",
  Book: "书籍",
  Dataset: "数据集",
  Hardware: "硬件",
  Tool: "工具",
  Course: "课程",
  Reference: "参考资料",
  "BUILD INTELLIGENT TOGETHER": "一起探索与创造",
  Knowledge: "知识",
  Projects: "项目",
  Discuss: "讨论",
  Resources: "资源",
  COMMUNITY: "社区",
  "SEARCH THE PLATFORM": "搜索塔洛维恩",
  "KNOWLEDGE PATH": "学习路线",
  "LEARNING PATH": "学习路线",
  "PROJECT SHOWCASE": "项目展示",
  "RESOURCE DIRECTORY": "资源目录",
  "LOADING KNOWLEDGE": "正在加载",
  "STAGE {0}": "阶段 {0}",
};

export function resolveLocale(value?: string): Locale {
  return value === "en" ? "en" : "zh";
}

export function createTranslator(locale: Locale) {
  const dictionary = locale === "en" ? en : zh;
  return (key: string, params: TranslationParams = {}): string => {
    let translated = Object.hasOwn(dictionary, key)
      ? dictionary[key]
      : undefined;
    // Server and API feedback may arrive as already formatted messages. Match
    // only known templates at these explicit UI translation boundaries.
    if (translated === undefined && locale === "en") {
      for (const [template, target] of Object.entries(en)) {
        if (!template.includes("{0}")) continue;
        const slots: string[] = [];
        const pattern = template
          .split(/(\{\w+\})/)
          .map((part) => {
            if (/^\{\w+\}$/.test(part)) {
              slots.push(part.slice(1, -1));
              return "([\\s\\S]*?)";
            }
            return part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          })
          .join("");
        const match = new RegExp(`^${pattern}$`).exec(key);
        if (match) {
          translated = target.replace(
            /\{(\w+)\}/g,
            (token, slot: string) => match[slots.indexOf(slot) + 1] ?? token,
          );
          break;
        }
      }
    }
    return (translated ?? key).replace(/\{(\w+)\}/g, (token, slot: string) =>
      String(params[slot] ?? token),
    );
  };
}
