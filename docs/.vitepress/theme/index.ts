import DefaultTheme from 'vitepress/theme';
import { watch } from 'vue';
// @ts-expect-error - CSS side-effect import handled by Vite
import './custom.css';
import BlogList from './component/BlogList.vue';
import ChangelogSelector from './component/ChangelogSelector.vue';
import AnnouncementBar from './AnnouncementBar.vue';
import Layout from './Layout.vue';

// Global click-to-zoom lightbox for documentation images.
let lightboxOverlay: HTMLDivElement | null = null;

function closeLightbox() {
  if (lightboxOverlay) {
    lightboxOverlay.remove();
    lightboxOverlay = null;
  }
  document.body.style.overflow = '';
  document.removeEventListener('keydown', onKeydown);
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') closeLightbox();
}

function openLightbox(src: string) {
  closeLightbox();
  const overlay = document.createElement('div');
  overlay.className = 'img-lightbox-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');

  const img = document.createElement('img');
  img.src = src;
  img.alt = 'Full size image';

  const close = document.createElement('button');
  close.className = 'img-lightbox-close';
  close.type = 'button';
  close.setAttribute('aria-label', 'Close image');
  close.innerHTML = '&times;';

  overlay.appendChild(img);
  overlay.appendChild(close);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeLightbox();
  });
  close.addEventListener('click', closeLightbox);

  document.body.appendChild(overlay);
  lightboxOverlay = overlay;
  document.body.style.overflow = 'hidden';
  document.addEventListener('keydown', onKeydown);
}

function isZoomableImage(target: EventTarget | null): target is HTMLImageElement {
  if (!(target instanceof HTMLImageElement)) return false;
  // Skip tiny inline icons / logos that shouldn't open a lightbox.
  if (target.closest('.VPNav, .VPSidebar, .VPBadge')) return false;
  return target.matches('.vp-doc img') || target.hasAttribute('data-lightbox');
}

function createLightbox() {
  document.addEventListener('click', (e) => {
    const img = e.target as EventTarget | null;
    if (!isZoomableImage(img)) return;
    const src = img.currentSrc || img.src;
    if (src) openLightbox(src);
  }, true);
}

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app, router }: { app: any; router: any }) {
    app.component('BlogList', BlogList);
    app.component('ChangelogSelector', ChangelogSelector);
    app.component('AnnouncementBar', AnnouncementBar);

    // Wire up the global image lightbox (delegated, works across route changes).
    // Client-only: `document` does not exist during SSR (vitepress build).
    if (typeof document !== 'undefined') {
      createLightbox();

      // Add a body class on blog pages so CSS can hide the footer
      const routeRef = router.currentRoute;
      const updateClass = () => {
        const path = routeRef?.value?.path ?? '';
        document.body.classList.toggle('blog-page', path.startsWith('/blog'));
        document.body.classList.toggle('changelog-page', path.startsWith('/changelog'));
      };
      if (routeRef) {
        watch(routeRef, updateClass);
      }
      updateClass();
    }
  },
};
