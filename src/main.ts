import '@fontsource-variable/space-grotesk/wght.css';
import '@fontsource/archivo-black/latin-400.css';
import '@fontsource/archivo-black/latin-ext-400.css';
import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-ext-400.css';
import '@fontsource/inter/latin-600.css';
import '@fontsource/inter/latin-ext-600.css';
import '@fontsource/inter/latin-700.css';
import '@fontsource/inter/latin-ext-700.css';
import '@fontsource/jetbrains-mono/latin-400.css';
import '@fontsource/jetbrains-mono/latin-ext-400.css';
import '@fontsource/jetbrains-mono/latin-600.css';
import '@fontsource/jetbrains-mono/latin-ext-600.css';
import '@fontsource/noto-sans-javanese/javanese-400.css';
import '@fontsource/noto-sans-javanese/javanese-700.css';
import './app.css';
import { mount } from 'svelte';
import { daftarkanServiceWorker, inisialisasiPendengarPwa } from './lib/pwa.ts';
import App from './ui/App.svelte';

inisialisasiPendengarPwa();

const target = document.getElementById('app');
if (target) {
  mount(App, { target });
}

void daftarkanServiceWorker();
