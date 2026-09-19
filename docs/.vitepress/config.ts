import { withMermaid } from "vitepress-plugin-mermaid";
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
  CONTRIBUTING_URL,
} from "../../brand";

export default withMermaid({
  title: AGENT_FULL_NAME,
  description: AGENT_DESCRIPTION,
  lang: "en-US",
  cleanUrls: true,
  lastUpdated: true,
  appearance: "dark",
  themeConfig: {
    logo: "/mitii-logo.svg",
    siteTitle: AGENT_NAME,
    hero: "center",
    features: [
      {
        title: "Repository Understanding",
        details:
          "Deep code navigation, context indexing, and dependency analysis that gives Mitii full awareness of your codebase.",
        icon: "<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><circle cx='12' cy='12' r='3'/><path d='M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83'/></svg>",
      },
      {
        title: "Agent Intelligence",
        details:
          "Memory checkpoints, skills, and task planning that let Mitii reason through complex multi-step workflows.",
        icon: "<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M12 2a4 4 0 0 1 4 4c0 1.95-1.4 3.58-3.25 3.93L12 10v2l3.25.07A4 4 0 0 1 16 16a4 4 0 0 1-8 0 4 4 0 0 1 .75-3.93L12 12v-2l-.75-.07A4 4 0 0 1 8 6a4 4 0 0 1 4-4z'/><path d='M12 16v6'/></svg>",
      },
      {
        title: "Multi-Platform",
        details:
          "Works seamlessly across CLI, VS Code, and SDK integrations — one agent, every surface you code in.",
        icon: "<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><rect x='2' y='3' width='20' height='14' rx='2' ry='2'/><line x1='8' y1='21' x2='16' y2='21'/><line x1='12' y1='17' x2='12' y2='21'/></svg>",
      },
    ],
    nav: [
      { text: "Blog", link: "/blog" },
      { text: "Website", link: WEBSITE_URL },
      {
        text: "Community",
        items: [
          { text: "GitHub", link: AGENT_REPO_URL },
          { text: "Discord", link: DISCORD_URL },
          { text: "Issues", link: AGENT_ISSUES_URL },
          { text: "Contributing", link: CONTRIBUTING_URL },
        ],
      },
    ],
    search: {
      provider: "local",
      options: {
        locales: {
          root: {
            translations: {
              button: {
                buttonText: "Search Documentation...",
                buttonAriaLabel: "Search Documentation...",
              },
            },
          },
        },
      },
    },
    sidebar: [
      {
        text: "Introduction",
        items: [
          { text: "Overview", link: "/" },
          { text: "Why Mitii?", link: "/why-mitii" },
          { text: "Getting Started", link: "/getting-started/" },
          { text: "Features", link: "/features" },
        ],
      },
      {
        text: "Using Mitii",
        items: [
          {
            text: "CLI",
            collapsed: true,
            items: [
              { text: "Overview", link: "/using/CLI/overview" },
              { text: "Setup & Providers", link: "/using/CLI/setup" },
              { text: "Commands & Options", link: "/using/CLI/commands" },
              { text: "Providers", link: "/using/CLI/providers" },
              { text: "Skills", link: "/using/CLI/skills" },
              { text: "Development", link: "/using/CLI/development" },
            ],
          },
          {
      text: "VS Code",
      collapsed: true,
      items: [
        { text: "Overview", link: "/using/VSCode/overview" },
        { text: "Settings", link: "/using/VSCode/settings" },
        { text: "Skills", link: "/using/VSCode/skills" },
        { text: "Development", link: "/using/VSCode/development" },
        { text: "Troubleshooting", link: "/using/VSCode/troubleshooting" },
      ],
    },
          { text: "Configuration", link: "/using/configuration" },
          { text: "Connect a Model", link: "/using/connect-model" },
          { text: "SDK", link: "/using/sdk" },
          { text: "Skills", link: "/using/skills" },
          { text: "ACP", link: "/using/acp" },
          { text: "Daemon", link: "/using/daemon" },
          { text: "Skills Engineering Pack", link: "/using/skills-engineering-pack" },
        ],
      },
      {
        text: "Understanding",
        items: [
          {
            text: "Architecture",
            collapsed: true,
            items: [
              {
                text: "System Architecture",
                link: "/understanding/architecture/system-architecture",
              },
              {
                text: "Agent Runtime",
                link: "/understanding/architecture/agent-runtime",
              },
              {
                text: "Request → Decision → Execution",
                link: "/understanding/architecture/request-decision-execution",
              },
              {
                text: "Run Lifecycle",
                link: "/understanding/architecture/run-lifecycle",
              },
              {
                text: "ADR: Review Module",
                link: "/understanding/architecture/adr-review-module",
              },
            ],
          },
          {
            text: "Repository Understanding",
            collapsed: true,
            items: [
              {
                text: "Context Indexing",
                link: "/understanding/repository-understanding/context-indexing",
              },
              {
                text: "Code Navigation",
                link: "/understanding/repository-understanding/code-navigation",
              },
              {
                text: "Change Impact",
                link: "/understanding/repository-understanding/change-impact",
              },
              {
                text: "Repository Context",
                link: "/understanding/repository-understanding/repository-context",
              },
              {
                text: "Repository State",
                link: "/understanding/repository-understanding/repository-state",
              },
            ],
          },
          {
            text: "Agent Intelligence",
            collapsed: true,
            items: [
              {
                text: "Planning",
                link: "/understanding/agent-intelligence/planning",
              },
              {
                text: "Plan-Act",
                link: "/understanding/agent-intelligence/plan-act",
              },
              {
                text: "Decision Policy",
                link: "/understanding/agent-intelligence/decision-policy",
              },
              {
                text: "Request Intake",
                link: "/understanding/agent-intelligence/request-intake",
              },
              {
                text: "Request Understanding",
                link: "/understanding/agent-intelligence/request-understanding",
              },
              {
                text: "Memory",
                link: "/understanding/agent-intelligence/memory",
              },
              {
                text: "Memory Checkpoints",
                link: "/understanding/agent-intelligence/memory-checkpoints",
              },
              {
                text: "Memory Leases",
                link: "/understanding/agent-intelligence/memory-leases",
              },
              {
                text: "Review",
                link: "/understanding/agent-intelligence/review",
              },
              {
                text: "Memory Checkpoints (cont.)",
                link: "/understanding/agent-intelligence/memory-checkpoints",
              },
              {
                text: "Skills",
                link: "/understanding/agent-intelligence/skills",
              },
              {
                text: "Task List",
                link: "/understanding/agent-intelligence/task-list",
              },
              {
                text: "Safety",
                link: "/understanding/agent-intelligence/safety",
              },
            ],
          },
          {
            text: "Execution",
            collapsed: true,
            items: [
              {
                text: "Prompt Construction",
                link: "/understanding/execution/prompt-construction",
              },
              {
                text: "Model Gateway",
                link: "/understanding/execution/model-gateway",
              },
              {
                text: "Tool Runtime",
                link: "/understanding/execution/tool-runtime",
              },
              {
                text: "Window Budget",
                link: "/understanding/execution/window-budget",
              },
              {
                text: "Verification",
                link: "/understanding/execution/verification",
              },
              {
                text: "MCP Attach",
                link: "/understanding/execution/mcp-attach",
              },
            ],
          },
        ],
      },
      {
        text: "Integrations",
        items: [
          { text: "LLM Providers", link: "/integrations/providers" },
          { text: "MCP", link: "/integrations/mcp" },
          { text: "MCP Web Server", link: "/integrations/mcp-web" },
          { text: "Search Kit", link: "/integrations/search-kit" },
        ],
      },
      {
        text: "Automation",
        items: [
          { text: "Overview", link: "/automation/" },
          {
            text: "Design & Testing",
            link: "/automation/DESIGN_AND_TESTING",
          },
          { text: "Shipping", link: "/automation/SHIP" },
          {
            text: "Agents",
            collapsed: true,
            items: [
              { text: "Post-commit Cover", link: "/automation/agents/post-commit-cover" },
              { text: "PR Review", link: "/automation/agents/pr-review" },
              { text: "Incident from Logs", link: "/automation/agents/incident-from-logs" },
            ],
          },
          { text: "Cron & Events", link: "/automation/cron" },
          { text: "Smoke Scripts", link: "/automation/smoke" },
          { text: "Examples", link: "/automation/examples" },
        ],
      },
      {
        text: "Development",
        items: [
          { text: "Development Setup", link: "/development/development-setup" },
        ],
      },
      {
        text: "Reference",
        items: [
          { text: "Built-in Tools", link: "/reference/tools" },
          { text: "Log Viewer", link: "/reference/log-viewer" },
          { text: "Policy Admin", link: "/reference/policy-admin" },
        ],
      },
      {
        text: "Changelog",
        items: [
          {
            text: "Recent Improvements",
            link: "/changelog/recent-improvements",
          },
        ],
      },
    ],
    socialLinks: [
      { icon: "github", link: DOCS_REPO_URL },
      { icon: "discord", link: DISCORD_URL },
    ],
    footer: {
      message: `${AGENT_FULL_NAME} — ${AGENT_TAGLINE}`,
      copyright: `Copyright © ${new Date().getFullYear()} codewithshinde · ${AGENT_DOMAIN}`,
    },
    editLink: {
      pattern: `${DOCS_REPO_URL}/edit/main/docs/:path`,
      text: "Edit this page on GitHub",
    },
    outline: { label: "On this page", depth: 3 },
  },
  head: [
    ["meta", { name: "description", content: AGENT_DESCRIPTION }],
    ["meta", { name: "theme-color", content: "#000000" }],
    ["meta", { property: "og:title", content: AGENT_FULL_NAME }],
    ["meta", { property: "og:description", content: AGENT_DESCRIPTION }],
    ["link", { rel: "icon", type: "image/svg+xml", href: "/mitii-logo.svg" }],
  ],
});
