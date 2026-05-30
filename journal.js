import { supabase } from './supabase.js'

const uploadPanel = document.getElementById('upload-panel')
uploadPanel.style.display = 'none'

const adminBtn = document.createElement('button')
adminBtn.textContent = 'Admin'
adminBtn.className = 'admin-btn'
document.body.appendChild(adminBtn)

adminBtn.addEventListener('click', async () => {
  const email = prompt('Email:')
  const password = prompt('Password:')
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    alert('Wrong credentials')
  } else {
    uploadPanel.style.display = 'flex'
    adminBtn.style.display = 'none'
    uploadPanel.scrollIntoView({ behavior: 'smooth' })
  }
})

function formatDate(dateStr) {
  const d = new Date(dateStr)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}.${m}.${day}`
}

async function translateToJapanese(fields) {
  const prompt = `Translate the following fields to natural Japanese. Return ONLY a JSON object with keys: title_jp, description_jp, location_jp, content_jp. No markdown, no explanation.

title: ${fields.title}
description: ${fields.description}
location: ${fields.location}
content: ${fields.content}`

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }]
    })
  })

  const data = await response.json()
  const text = data.content.map(i => i.text || '').join('')
  const clean = text.replace(/```json|```/g, '').trim()
  return JSON.parse(clean)
}

async function loadJournals() {
  const { data, error } = await supabase
    .from('journals')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) { console.error(error); return }

  const container = document.getElementById('journal-grid')
  container.innerHTML = ''

  if (!data || data.length === 0) {
    container.innerHTML = '<div class="empty-state">No entries yet.</div>'
    return
  }

data.forEach(post => {
  const card = document.createElement('div')
  card.className = 'journal-card'
  card.dataset.id = post.id
  card.innerHTML = `
    <div class="card-image">
      <img src="${post.image}" alt="${post.title}" loading="lazy" />
    </div>
    <div class="card-body">
      <div class="card-meta">
        <span class="card-date">${formatDate(post.created_at)}</span>
        <span class="card-tag">${post.location || 'Journal'}</span>
      </div>
      <h3 class="card-title">${post.title}</h3>
      <p class="card-desc">${post.description}</p>
      <span class="card-arrow">→</span>
    </div>
  `
  card.addEventListener('click', () => {
    window.location.href = `/journal-post.html?id=${post.id}`
  })
  container.appendChild(card)
})

}

const uploadBtn = document.getElementById('upload-btn')

uploadBtn.addEventListener('click', async () => {
  const title = document.getElementById('title').value.trim()
  const location = document.getElementById('location').value.trim()
  const description = document.getElementById('description').value.trim()
  const content = document.getElementById('content').value.trim()
  const image = document.getElementById('image').value.trim()

  if (!title || !image) { alert('Title and image are required.'); return }

  uploadBtn.textContent = 'Translating...'
  uploadBtn.disabled = true

  let translated = { title_jp: title, description_jp: description, location_jp: location, content_jp: content }

  try {
    translated = await translateToJapanese({ title, description, location, content })
  } catch (e) {
    console.error('Translation failed, saving EN only', e)
  }

  uploadBtn.textContent = 'Publishing...'

  const { error } = await supabase
    .from('journals')
    .insert([{
      title,
      description,
      location,
      content,
      image,
      title_jp: translated.title_jp,
      description_jp: translated.description_jp,
      location_jp: translated.location_jp,
      content_jp: translated.content_jp
    }])

  uploadBtn.textContent = 'Publish →'
  uploadBtn.disabled = false

  if (error) { console.error(error); alert(error.message); return }

  document.getElementById('title').value = ''
  document.getElementById('location').value = ''
  document.getElementById('description').value = ''
  document.getElementById('content').value = ''
  document.getElementById('image').value = ''

  loadJournals()
})

loadJournals()