import { defineConfig } from 'vitepress';
import {
  AGENT_NAME,
  AGENT_FULL_NAME,
  AGENT_TAGLINE,
  AGENT_DESCRIPTION,
  AGENT_DOMAIN,
  AGENT_REPO_URL,
  AGENT_ISSUES_URL,
  DOCS_REPO_URL,
  DISCORD_URL,
  WEBSITE_URL,
} from '../../brand';

export default defineConfig({
  title: AGENT_FULL_NAME,
  description: AGENT_DESCRIPTION,
  lang: 'en-US',
  cleanUrls: true,
  lastUpdated: true,
  appearance: 'dark',
  themeConfig: {
    logo: '/logo.svg',
    siteTitle: AGENT_NAME,
    nav: [
      { text: 'Overview', link: '/' },
      { text: 'Why Mitii', link: '/why-mitii' },
      { text: 'Getting Started', link: '/getting-started/' },
      { text: 'Features', link: '/features/' },
      { text: 'Architecture', link: '/architecture' },
      { text: 'Website', link: WEBSITE_URL },
      {
        text: 'Community',
        items: [
          { text: 'Agent (GitHub)', link: AGENT_REPO_URL },
          { text: 'Discord', link: DISCORD_URL },
          { text: 'Issues', link: AGENT_ISSUES_URL },
        ],
      },
    ],
    sidebar: [
      {
        text: 'Introduction',
        items: [
          { text: 'Overview', link: '/' },
          { text: 'Why Mitii?', link: '/why-mitii' },
          { text: 'Getting Started', link: '/getting-started/' },
          { text: 'Connect a Model', link: '/getting-started/connect-model' },
        ],
      },
      {
        text: 'Guide',
        items: [
          { text: 'Features', link: '/features/' },
          { text: 'Configuration', link: '/configuration' },
          { text: 'Architecture', link: '/architecture' },
          { text: 'Development', link: '/development' },
        ],
      },
      {
        text: 'Implementation',
        items: [
          { text: 'Recent improvements', link: '/implementation/recent-improvements' },
          { text: 'Plan / Act workflow', link: '/implementation/plan-act' },
          { text: 'LLM providers', link: '/implementation/providers' },
          { text: 'Context & indexing', link: '/implementation/context-indexing' },
          { text: 'Safety & approvals', link: '/implementation/safety' },
          { text: 'Memory & checkpoints', link: '/implementation/memory-checkpoints' },
          { text: 'MCP integrations', link: '/implementation/mcp' },
          { text: 'Built-in tools', link: '/implementation/tools' },
        ],
      },
    ],
    socialLinks: [
      { icon: 'github', link: DOCS_REPO_URL },
      { icon: 'discord', link: DISCORD_URL },
    ],
    footer: {
      message: `${AGENT_FULL_NAME} — ${AGENT_TAGLINE}`,
      copyright: `Copyright © ${new Date().getFullYear()} codewithshinde · ${AGENT_DOMAIN}`,
    },
    editLink: {
      pattern: `${DOCS_REPO_URL}/edit/main/docs/:path`,
      text: 'Edit this page on GitHub',
    },
  },
  head: [
    ['meta', { name: 'theme-color', content: '#000000' }],
    ['meta', { property: 'og:title', content: AGENT_FULL_NAME }],
    ['meta', { property: 'og:description', content: AGENT_DESCRIPTION }],
  ],
});
