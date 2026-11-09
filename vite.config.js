import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        ru_home: resolve(__dirname, 'ru/index.html'),
        ru_menu: resolve(__dirname, 'ru/menu/index.html'),
        ru_reservation: resolve(__dirname, 'ru/reservation/index.html'),
        ru_order: resolve(__dirname, 'ru/order/index.html'),
        ru_track: resolve(__dirname, 'ru/order/track/index.html'),
        ru_about: resolve(__dirname, 'ru/about/index.html'),
        ru_account: resolve(__dirname, 'ru/account/index.html'),
        ru_contact: resolve(__dirname, 'ru/contact/index.html'),
        en_home: resolve(__dirname, 'en/index.html'),
        en_menu: resolve(__dirname, 'en/menu/index.html'),
        en_reservation: resolve(__dirname, 'en/reservation/index.html'),
        en_order: resolve(__dirname, 'en/order/index.html'),
        en_track: resolve(__dirname, 'en/order/track/index.html'),
        en_about: resolve(__dirname, 'en/about/index.html'),
        en_account: resolve(__dirname, 'en/account/index.html'),
        en_contact: resolve(__dirname, 'en/contact/index.html'),
        admin: resolve(__dirname, 'admin/index.html')
      }
    }
  },
  server: {
    port: 3000
  }
});
