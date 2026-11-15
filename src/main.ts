import '@fontsource-variable/space-grotesk';
import '@fontsource/archivo-black';
import '@fontsource/inter/400.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/600.css';
import '@fontsource/noto-sans-javanese/400.css';
import '@fontsource/noto-sans-javanese/700.css';
import './app.css';
import { mount } from 'svelte';
import App from './ui/App.svelte';

const target = document.getElementById('app');
if (target) {
  mount(App, { target });
}
