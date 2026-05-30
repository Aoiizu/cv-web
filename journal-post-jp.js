import { supabase } from './supabase.js'

async function loadPost() {
  const params = new URLSearchParams(window.location.search)
  const id = params.get('id')

  if (!id) { window.location.href = '/journal.html'; return }

  const { data, error } = await supabase
    .from('journals')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) { window.location.href = '/journal.html'; return }

  const d = new Date(data.created_at)
  const date = `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`

  document.title = `${data.title_jp || data.title} — 蒼`
  document.getElementById('post-img').src = data.image
  document.getElementById('post-img').alt = data.title_jp || data.title
  document.getElementById('post-date').textContent = date
  document.getElementById('post-location').textContent = data.location_jp || data.location || '記録'
  document.getElementById('post-title').textContent = data.title_jp || data.title
  document.getElementById('post-content').textContent = data.content_jp || data.content
}

<meta http-equiv="Content-Security-Policy" content="script-src 'self' 'unsafe-eval' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com; font-src 'self' https://fonts.gstatic.com;"></meta>

loadPost()