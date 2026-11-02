import { defineConfig, type DefaultTheme } from 'vitepress';

const techItems: DefaultTheme.SidebarItem[] = [
  { text: 'Git 常用操作', link: '/tech/git' },
  { text: '前端构建工具链', link: '/tech/build' },
  { text: '前端状态管理', link: '/tech/state-management' },
  { text: '代码质量规范', link: '/tech/code-quality' },
  { text: '面试经验：AI 应用方向', link: '/tech/interview' },
];

const recommendItems: DefaultTheme.SidebarItem[] = [
  { text: '书单', link: '/recommend/book' },
  { text: '影视', link: '/recommend/video' },
  { text: '动漫', link: '/recommend/anime' },
  { text: '游戏', link: '/recommend/game' },
];

const lifeItems: DefaultTheme.SidebarItem[] = [
  { text: '广东周边游', link: '/life/travel' },
  { text: '金句摘抄', link: '/life/quote' },
  { text: 'ISFJ 性格介绍', link: '/life/isfj' },
];

export default defineConfig({
  title: 'Home',
  description: '技术笔记与生活记录',
  lang: 'zh-CN',
  // 仓库名为 home，GitHub Pages 地址为 https://michael-moo.github.io/home/
  base: '/home/',
  lastUpdated: true,
  themeConfig: {
    nav: [{ text: '首页', link: '/' }],
    // 统一的二级目录：所有页面都显示同一份侧边栏，一级为分类，二级为文章
    sidebar: [
      { text: '技术', collapsed: false, items: techItems },
      { text: '推荐', collapsed: false, items: recommendItems },
      { text: '生活', collapsed: false, items: lifeItems },
    ],
    socialLinks: [{ icon: 'github', link: 'https://github.com/michael-moo/home' }],
    outline: { level: [2, 3], label: '本页目录' },
    docFooter: { prev: '上一篇', next: '下一篇' },
    lastUpdated: { text: '最后更新于' },
  },
});
