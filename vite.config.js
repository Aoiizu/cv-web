import { defineConfig } from 'vite'

export default defineConfig({
  root: '.',
  esbuild: {
    supported: {
      'dynamic-import': true
    }
  },
  build: {
    target: 'es2020',
    rollupOptions: {
      input: {
        main: 'index.html',
        en: 'en.html',
        journal: 'journal.html',
        enjournal: 'enjournal.html',
        journalPost: 'journal-post.html',
        journalPostJp: 'journal-post-jp.html',
      }
    }
  }
})