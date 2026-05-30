import { supabase } from './supabase.js'

const params = new URLSearchParams(window.location.search)
const id = params.get('id')

if (!id) window.location.href = '/enjournal.html'

const { data, error } = await supabase
  .from('journals')
  .select('*')
  .eq('id', id)
  .single()

if (error || !data) window.location.href = '/enjournal.html'

const d = new Date(data.created_at)
const date = `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`

document.title = `${data.title} — AOI`
document.getElementById('post-img').src = data.image
document.getElementById('post-img').alt = data.title
document.getElementById('post-date').textContent = date
document.getElementById('post-location').textContent = data.location || 'Journal'
document.getElementById('post-title').textContent = data.title
document.getElementById('post-content').textContent = data.content