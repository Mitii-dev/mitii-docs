<script setup lang="ts">
interface Application {
  title: string;
  description: string;
  icon: string;
  href: string;
}

const applications: Application[] = [
  {
    title: "CLI",
    description:
      "Run Mitii directly from your terminal for interactive coding and automation.",
    icon: "terminal",
    href: "/using/CLI/overview",
  },
  {
    title: "SDK",
    description:
      "Build and integrate Mitii into your own applications, workflows, and tools.",
    icon: "code",
    href: "/using/sdk",
  },
  {
    title: "VS Code",
    description:
      "Use Mitii directly inside your editor to read, plan, and modify your codebase.",
    icon: "editor",
    href: "/using/vscode/overview",
  },
  {
    title: "Autonomous",
    description:
      "Let Mitii work through complex coding tasks while keeping you in control.",
    icon: "sparkle",
    href: "/automation/examples",
  },
];
</script>

<template>
  <section class="mitii-applications">
    <div class="mitii-applications-header">
      <h2>Applications</h2>

      <p>Use Mitii wherever you build, from your terminal to your editor.</p>
    </div>

    <div class="mitii-application-grid">
      <a
        v-for="application in applications"
        :key="application.title"
        :href="application.href"
        class="mitii-application-card"
      >
        <div class="mitii-application-icon">
          <svg
            v-if="application.icon === 'terminal'"
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
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <path d="m7 9 3 3-3 3" />
            <path d="M12 15h4" />
          </svg>
          <svg
            v-else-if="application.icon === 'code'"
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
            <path d="m8 6-6 6 6 6" />
            <path d="m16 6 6 6-6 6" />
            <path d="m13.5 4-3 16" />
          </svg>
          <svg
            v-else-if="application.icon === 'editor'"
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
            <path d="m8 4-5 8 5 8" />
            <path d="m16 4 5 8-5 8" />
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
            <path d="M12 3v3" />
            <path d="M12 18v3" />
            <path d="M3 12h3" />
            <path d="M18 12h3" />
            <path d="M12 8.5 13.5 12 12 15.5 10.5 12 12 8.5z" fill="currentColor" stroke="none" />
          </svg>
        </div>

        <h3>{{ application.title }}</h3>

        <p>{{ application.description }}</p>
      </a>
    </div>
  </section>
</template>
