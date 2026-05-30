import { supabase } from './supabase.js'

const uploadPanel = document.getElementById('upload-panel')
uploadPanel.style.display = 'none'

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
    container.innerHTML += `
      <div class="journal-card">
        <div class="card-image">
          <img src="${post.image}" alt="${post.title}" loading="lazy" />
        </div>
        <div class="card-body">
          <div class="card-meta">
            <span class="card-date">${formatDate(post.created_at)}</span>
            <span class="card-tag">${post.location || '記録'}</span>
          </div>
          <h3 class="card-title">${post.title}</h3>
          <p class="card-desc">${post.description}</p>
          <span class="card-arrow">→</span>
        </div>
      </div>
    `
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

  uploadBtn.textContent = '公開中...'
  uploadBtn.disabled = true

  const { error } = await supabase
    .from('journals')
    .insert([{ title, location, description, content, image }])

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