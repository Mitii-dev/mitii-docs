import DefaultTheme from 'vitepress/theme';
// @ts-expect-error - CSS side-effect import handled by Vite
import './custom.css';

export default {
  extends: DefaultTheme,
};
