import { supabase } from './supabase.js'

const uploadBtn = document.getElementById('upload-btn')

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
    return
  }

  location.reload()

})