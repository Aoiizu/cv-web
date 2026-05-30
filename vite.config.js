import { defineConfig } from 'vite'

export default defineConfig({
  root: '.',
  build: {
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