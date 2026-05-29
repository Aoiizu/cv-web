import { supabase } from './supabase.js'

const uploadBtn = document.getElementById('upload-btn')

async function loadJournals() {

  const { data, error } = await supabase
    .from('journals')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error(error)
    return
  }

  const container = document.getElementById('journal-grid')

  container.innerHTML = ''

  data.forEach(post => {

    container.innerHTML += `

      <div class="journal-card">

        <div class="card-image">
          <img src="${post.image}">
        </div>

        <div class="card-body">

          <p class="card-tag">
            JOURNAL
          </p>

          <h3 class="card-title">
            ${post.title}
          </h3>

          <p class="card-desc">
            ${post.description}
          </p>

        </div>

      </div>

    `
  })
}

uploadBtn.addEventListener('click', async () => {

  const title = document.getElementById('title').value
  const description = document.getElementById('description').value
  const content = document.getElementById('content').value
  const image = document.getElementById('image').value

  const { error } = await supabase
    .from('journals')
    .insert([
      {
        title,
        description,
        content,
        image
      }
    ])

  if (error) {
    console.error(error)
    alert(error.message)
    return
  }

  loadJournals()

})

loadJournals()