import { supabase } from './supabase.js'

const uploadPanel = document.getElementById('upload-panel')
uploadPanel.style.display = 'none'

let isAdmin = false

const adminBtn = document.createElement('button')
adminBtn.textContent = '管理者'
adminBtn.className = 'admin-btn'
document.body.appendChild(adminBtn)

adminBtn.addEventListener('click', async () => {
  const email = prompt('メール:')
  const password = prompt('パスワード:')
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    alert('認証に失敗しました')
  } else {
    isAdmin = true
    uploadPanel.style.display = 'flex'
    adminBtn.style.display = 'none'
    uploadPanel.scrollIntoView({ behavior: 'smooth' })
    loadJournals()
  }
})

function formatDate(dateStr) {
  const d = new Date(dateStr)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}.${m}.${day}`
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
    container.innerHTML = '<div class="empty-state">まだ記録がありません。</div>'
    return
  }

  data.forEach(post => {
    const card = document.createElement('div')
    card.className = 'journal-card'
    card.innerHTML = `
      <div class="card-image">
        <img src="${post.image}" alt="${post.title_jp || post.title}" loading="lazy" />
      </div>
      <div class="card-body">
        <div class="card-meta">
          <span class="card-date">${formatDate(post.created_at)}</span>
          <span class="card-tag">${post.location_jp || post.location || '記録'}</span>
        </div>
        <h3 class="card-title">${post.title_jp || post.title}</h3>
        <p class="card-desc">${post.description_jp || post.description}</p>
        <div class="card-footer">
          <span class="card-arrow">→</span>
          ${isAdmin ? `<button class="delete-btn" data-id="${post.id}">削除</button>` : ''}
        </div>
      </div>
    `

    if (isAdmin) {
      card.querySelector('.delete-btn').addEventListener('click', async (e) => {
        e.stopPropagation()
        if (!confirm('この記録を削除しますか？')) return
        const { error } = await supabase.from('journals').delete().eq('id', post.id)
        if (error) { alert(error.message); return }
        loadJournals()
      })
    } else {
      card.addEventListener('click', () => {
        window.location.href = `/journal-post-jp.html?id=${post.id}`
      })
    }

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

  if (!title || !image) { alert('タイトルと画像URLは必須です。'); return }

  uploadBtn.textContent = '翻訳中...'
  uploadBtn.disabled = true

  let translated = { title_en: title, description_en: description, location_en: location, content_en: content }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: `Translate the following fields to natural English. Return ONLY a JSON object with keys: title_en, description_en, location_en, content_en. No markdown, no explanation.

title: ${title}
description: ${description}
location: ${location}
content: ${content}` }]
      })
    })
    const data = await response.json()
    const text = data.content.map(i => i.text || '').join('')
    const clean = text.replace(/```json|```/g, '').trim()
    translated = JSON.parse(clean)
  } catch (e) {
    console.error('Translation failed, saving JP only', e)
  }

  uploadBtn.textContent = '公開中...'

  const { error } = await supabase
    .from('journals')
    .insert([{
      title: translated.title_en,
      description: translated.description_en,
      location: translated.location_en,
      content: translated.content_en,
      image,
      title_jp: title,
      description_jp: description,
      location_jp: location,
      content_jp: content
    }])

  uploadBtn.textContent = '公開する →'
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