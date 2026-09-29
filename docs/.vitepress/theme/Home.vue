<script setup lang="ts">
import { useData } from "vitepress";
import Video from "./component/video.vue";
import Applications from "./component/Applications.vue";
import Community from "./component/community.vue";

const { isDark } = useData();
interface Action {
  text: string;
  href: string;
  variant: "primary" | "secondary";
}

interface Stat {
  value: string;
  label: string;
}

const actions: Action[] = [
  {
    text: "Install Mitii",
    href: "/getting-started/#install",
    variant: "primary",
  },
  {
    text: "Quick Start",
    href: "/getting-started/",
    variant: "secondary",
  },
];

const stats: Stat[] = [
  {
    value: "45k+",
    label: "GitHub stars",
  },
  {
    value: "500+",
    label: "Contributors",
  },
  {
    value: "70+",
    label: "MCP extensions",
  },
];
</script>

<template>
  <main class="mitii-home">
    <section class="mitii-hero">
      <!-- Badge -->
      <div class="mitii-eyebrow">Open Source · AGPL-3.0 · Agentic AI</div>

      <!-- Logo -->
      <img
        :src="isDark ? '/mitii-full-logo-dark.png' : '/mitii-full-logo.png'"
        alt="Mitii"
        class="mitii-logo"
      />

      <!-- Description -->
      <p class="mitii-tagline">
        Mitii, a local-first AI coding agent. Reads your repository. Plans
        changes. Executes with your approval.
      </p>

      <!-- Actions -->
      <div class="mitii-actions">
        <a
          v-for="action in actions"
          :key="action.text"
          :href="action.href"
          :class="['mitii-button', `mitii-button--${action.variant}`]"
        >
          {{ action.text }}
        </a>
      </div>

      <!-- Stats -->
      <div class="mitii-stats">
        <template v-for="(stat, index) in stats" :key="stat.label">
          <div class="mitii-stat">
            <strong>{{ stat.value }}</strong>
            <span>{{ stat.label }}</span>
          </div>

          <div v-if="index < stats.length - 1" class="mitii-stat-divider" />
        </template>
      </div>
    </section>
    <Video />
    <Applications />
    <Community />
  </main>
</template>
