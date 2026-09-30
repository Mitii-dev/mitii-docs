<script setup lang="ts">
import {AGENT_REPO_URL, DISCORD_URL} from "../../../../brand.ts";

interface CommunityLink {
  title: string;
  description: string;
  icon: string;
  href: string;
}

const communityLinks: CommunityLink[] = [
  {
    title: "Discord",
    description:
      "Ask questions, share what you build, and connect with other Mitii users.",
    icon: "discord",
    href: DISCORD_URL,
  },
  {
    title: "GitHub",
    description:
      "Explore the source, contribute code, report issues, and build with Mitii.",
    icon: "github",
    href: AGENT_REPO_URL,
  },
  {
    title: "Extensions",
    description:
      "Discover MCP extensions and integrations that extend what Mitii can do.",
    icon: "puzzle",
    href: "/integrations/mcp",
  },
  {
    title: "Blog",
    description:
      "Follow updates, technical deep dives, releases, and what we are building.",
    icon: "pen",
    href: "/blog",
  },
];
</script>

<template>
  <section class="mitii-community">
    <div class="mitii-community-header">
      <h2>Community</h2>

      <p>
        Join the people building, extending, and exploring what Mitii can do.
      </p>
    </div>

    <div class="mitii-community-grid">
      <a
        v-for="item in communityLinks"
        :key="item.title"
        :href="item.href"
        class="mitii-community-card"
      >
        <div class="mitii-community-icon">
          <svg
            v-if="item.icon === 'discord'"
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.182 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
          </svg>
          <svg
            v-else-if="item.icon === 'github'"
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
          </svg>
          <svg
            v-else-if="item.icon === 'puzzle'"
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M19.439 7.85c-.049.322.059.648.289.878l1.568 1.568c.391.391.391 1.024 0 1.414l-1.568 1.568a1.06 1.06 0 0 1-.878.29 1.06 1.06 0 0 1-.878-.878v-1.568a1.06 1.06 0 0 0-1.06-1.06h-1.568a1.06 1.06 0 0 1-.878-.29 1.06 1.06 0 0 1-.29-.878V9.439c0-.282.112-.552.31-.75l1.568-1.568a1.06 1.06 0 0 1 1.414 0l1.568 1.568c.2.198.312.468.31.75z" transform="translate(-1.5 -1.5)" />
            <path d="M9.5 14.5h-2a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1z" transform="translate(0 0)" />
            <path d="M14.5 9.5h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1z" transform="translate(0 0)" />
            <path d="M9.5 9.5h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1z" transform="translate(0 0)" />
            <path d="M14.5 14.5h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1z" transform="translate(0 0)" />
          </svg>
          <svg
            v-else
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
        </div>

        <h3>{{ item.title }}</h3>

        <p>{{ item.description }}</p>
      </a>
    </div>
  </section>
</template>
