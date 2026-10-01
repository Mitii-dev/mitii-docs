<script setup lang="ts">
interface BlogPost {
  title: string;
  excerpt: string;
  date: string;
  author: string;
  tag: string;
  href: string;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const posts: BlogPost[] = [
  {
    title:
      "Benchmark Results: Mitii AI Agent with Qwen 3.8 27B (45k Context Window)",
    excerpt:
      "We pushed Mitii through 170 non-trivial, full-stack engineering tasks with a 45,000-token context window. Overall pass rate: 89.41% — a GO signal on the overall gate.",
    date: "2026-01-15",
    author: "codewithshinde",
    tag: "Show & Tell",
    href: "/blog/benchmark-qwen-3.8-27b",
  },
];
</script>

<template>
  <section class="mitii-blog" aria-label="Blog posts">
    <div class="mitii-blog-list">
      <article
        v-for="post in posts"
        :key="post.href"
        class="mitii-blog-item"
      >
        <h3 class="mitii-blog-title">
          <a :href="post.href">{{ post.title }}</a>
        </h3>

        <time class="mitii-blog-date" :datetime="post.date">
          {{ formatDate(post.date) }}
        </time>

        <p class="mitii-blog-excerpt">{{ post.excerpt }}</p>

        <a :href="post.href" class="mitii-blog-read">Read more</a>
      </article>
    </div>
  </section>
</template>
