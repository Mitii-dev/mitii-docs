/**
 * Mitii product branding. Keep in sync with mitii-website and the agent extension.
 */
export const AGENT_NAME = 'Mitii';
export const AGENT_FULL_NAME = 'Mitii AI Agent';
export const AGENT_DOMAIN = 'mitii.dev';
export const WEBSITE_URL = 'https://mitii.dev';
export const DOCS_URL = 'https://docs.mitii.dev';

export const AGENT_TAGLINE =
  'Your local-first AI coding agent for complex work. Read files, write code, run commands, all with your approval.';
export const AGENT_DESCRIPTION =
  'Local-first VS Code AI coding agent with precise repo context and safe Plan/Act workflow.';

export const CONTRIBUTING_URL = 'https://github.com/Mitii-dev/Mitii/blob/main/CONTRIBUTING.md';
export const AGENT_REPO_URL = 'https://github.com/codewithshinde/thunder-ai-agent';
export const AGENT_ISSUES_URL = 'https://github.com/codewithshinde/thunder-ai-agent/issues';
export const DOCS_REPO_URL = 'https://github.com/codewithshinde/mitii-docs';

export const DISCORD_URL = 'https://discord.gg/sa8rubf6HH';

/* ─── Announcement Bar ─── */
export const ANNOUNCEMENT_BEFORE =
  "Every page of the Mitii docs was generated using Mitii Agent. If your AI tool can't automate its own documentation, why ";
export const ANNOUNCEMENT_LINK_TEXT = 'release';
export const ANNOUNCEMENT_AFTER = ' it?';
export const ANNOUNCEMENT_LINK_HREF = '/changelog/recent-improvements';

export const AUTHOR_NAME = 'codewithshinde';
export const AUTHOR_GITHUB_URL = 'https://github.com/codewithshinde';
export const AUTHOR_EMAIL = 'codewithshinde@gmail.com';

/* ─── Theme ─── */
export const darkMode = true;

/* Brand palette: mirrors the :root tokens in docs/.vitepress/theme/custom.css */
export const brandColors = {
  primary: 'oklch(0.72 0.185 48)',
  primaryForeground: 'oklch(0.14 0.02 45)',
  signal: 'oklch(0.72 0.185 48)',
  signalSoft: 'oklch(0.84 0.13 78)',
  jade: 'oklch(0.78 0.14 155)',
  amber: 'oklch(0.84 0.13 78)',
  rose: 'oklch(0.7 0.16 25)',
  destructive: 'oklch(0.62 0.2 25)',
  destructiveForeground: 'oklch(0.98 0.005 75)',
  background: 'oklch(0.1 0.012 55)',
  foreground: 'oklch(0.97 0.005 75)',
} as const;

export const themeColors = {
  light: {
    primary: brandColors.primary,
    accent: brandColors.signalSoft,
    background: brandColors.background,
  },
  dark: {
    primary: brandColors.primary,
    accent: brandColors.signalSoft,
    background: brandColors.background,
  },
} as const;
