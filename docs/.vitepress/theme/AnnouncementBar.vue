<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import {
  ANNOUNCEMENT_BEFORE,
  ANNOUNCEMENT_LINK_TEXT,
  ANNOUNCEMENT_AFTER,
  ANNOUNCEMENT_LINK_HREF,
} from "../../../brand.ts";

const barEl = ref<HTMLElement | null>(null);
const dismissed = ref(false);
let observer: ResizeObserver | null = null;

function updateHeight() {
  const height = barEl.value?.offsetHeight ?? 0;
  document.documentElement.style.setProperty(
    "--announcement-bar-height",
    `${height}px`
  );
}

onMounted(() => {
  if (typeof ResizeObserver !== "undefined" && barEl.value) {
    observer = new ResizeObserver(() => updateHeight());
    observer.observe(barEl.value);
  }
  updateHeight();
});

onBeforeUnmount(() => {
  observer?.disconnect();
  observer = null;
  document.documentElement.style.removeProperty("--announcement-bar-height");
});

function dismiss() {
  dismissed.value = true;
  // Wait for the collapse transition to finish before clearing the offset.
  setTimeout(() => {
    document.documentElement.style.removeProperty("--announcement-bar-height");
  }, 300);
}
</script>

<template>
  <div
    v-show="!dismissed"
    ref="barEl"
    class="announcement-bar"
    role="region"
    aria-label="Announcement"
  >
    <span class="announcement-bar__text">
      "{{ ANNOUNCEMENT_BEFORE }}
      <a :href="ANNOUNCEMENT_LINK_HREF">{{ ANNOUNCEMENT_LINK_TEXT }}</a>
      {{ ANNOUNCEMENT_AFTER }}"
    </span>
    <button
      type="button"
      class="announcement-bar__close"
      aria-label="Dismiss announcement"
      @click="dismiss"
    >
      &times;
    </button>
  </div>
</template>
