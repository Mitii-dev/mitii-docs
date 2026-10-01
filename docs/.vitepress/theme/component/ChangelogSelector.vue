<template>
  <div class="changelog-accordion" ref="rootEl"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';

const rootEl = ref<HTMLElement | null>(null);

interface ReleaseSection {
  heading: HTMLElement;
  body: HTMLElement;
  id: string;
  label: string;
}

let sections: ReleaseSection[] = [];
let expandedId: string | null = null;

function buildSections(doc: HTMLElement): ReleaseSection[] {
  const headings = Array.from(doc.querySelectorAll<HTMLElement>('h2[id]'));
  const result: ReleaseSection[] = [];

  headings.forEach((h) => {
    const text = h.textContent?.trim() ?? '';
    const match = text.match(/^\[([^\]]+)\](?:\s*-\s*(.+))?$/);
    if (!match) return;

    // Collect sibling elements until next h2 or end
    const body = document.createElement('div');
    body.className = 'changelog-release-body';
    let sibling = h.nextElementSibling as HTMLElement | null;
    while (sibling && sibling.tagName !== 'H2') {
      const next = sibling.nextElementSibling as HTMLElement | null;
      body.appendChild(sibling);
      sibling = next;
    }

    // Insert body right after heading
    h.insertAdjacentElement('afterend', body);

    result.push({
      heading: h,
      body,
      id: h.id,
      label: text.replace(/^\[?\]?\s*-\s*/, ''),
    });
  });

  return result;
}

function collapseAll() {
  sections.forEach((s) => {
    s.body.classList.remove('expanded');
    s.heading.classList.remove('active');
  });
  expandedId = null;
}

function toggleSection(section: ReleaseSection) {
  if (expandedId === section.id) {
    section.body.classList.remove('expanded');
    section.heading.classList.remove('active');
    expandedId = null;
  } else {
    collapseAll();
    section.body.classList.add('expanded');
    section.heading.classList.add('active');
    expandedId = section.id;
  }
}

function init() {
  const doc = document.querySelector('.vp-doc') as HTMLElement | null;
  if (!doc) return;

  sections = buildSections(doc);
  collapseAll();

  sections.forEach((s) => {
    s.heading.classList.add('changelog-release-header');

    // Add chevron indicator
    const chevron = document.createElement('span');
    chevron.className = 'changelog-chevron';
    chevron.innerHTML = '&#9662;';
    s.heading.appendChild(chevron);

    s.heading.addEventListener('click', () => toggleSection(s));
  });
}

onMounted(async () => {
  await nextTick();
  requestAnimationFrame(() => {
    init();
  });
});
</script>

<style>
/* Global styles for changelog accordion (injected into .vp-doc) */
.changelog-release-header {
  cursor: pointer;
  user-select: none;
  transition: color 0.2s ease;
  padding: 0.25rem 0;
}

.changelog-release-header:hover {
  color: var(--vp-c-brand-1, #ff751f);
}

.changelog-release-header.active {
  color: var(--vp-c-brand-1, #ff751f);
}

.changelog-chevron {
  display: inline-block;
  margin-left: 0.5rem;
  transition: transform 0.25s ease;
  vertical-align: middle;
}

.changelog-release-header.active .changelog-chevron {
  transform: rotate(180deg);
}

.changelog-release-body {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.35s ease, opacity 0.25s ease;
  opacity: 0;
}

.changelog-release-body.expanded {
  max-height: 5000px;
  opacity: 1;
}
</style>
