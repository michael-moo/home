import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'Home',
  description: '个人技术笔记',
  lang: 'zh-CN',
  // 仓库名为 home，GitHub Pages 地址为 https://michael-moo.github.io/home/
  base: '/home/',
  lastUpdated: true,
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: 'Git', link: '/git' },
    ],
    sidebar: [
      {
        text: '笔记',
        items: [{ text: 'Git 常用操作', link: '/git' }],
      },
    ],
    socialLinks: [{ icon: 'github', link: 'https://github.com/michael-moo/home' }],
    outline: { level: [2, 3], label: '本页目录' },
    docFooter: { prev: '上一篇', next: '下一篇' },
    lastUpdated: { text: '最后更新于' },
  },
});
