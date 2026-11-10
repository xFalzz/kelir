import '@fontsource-variable/fraunces';
import '@fontsource/atkinson-hyperlegible/400.css';
import '@fontsource/atkinson-hyperlegible/700.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/600.css';
import '@fontsource/noto-sans-javanese/400.css';
import '@fontsource/noto-sans-javanese/700.css';
import './app.css';
import { mount } from 'svelte';
import App from './ui/App.svelte';

const target = document.getElementById('app');
if (!target) {
  throw new Error('Elemen #app tidak ditemukan di index.html.');
}

mount(App, { target });
