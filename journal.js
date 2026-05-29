import { supabase } from './supabase.js'

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

  data.forEach(post => {

    container.innerHTML += `

      <div class="journal-card">

        <div class="card-image">
          <img src="${post.image}" alt="">
        </div>

        <div class="card-body">

          <div class="card-meta">
            <p class="card-tag">JOURNAL</p>
          </div>

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

loadJournals()