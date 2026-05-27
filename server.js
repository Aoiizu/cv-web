require('dotenv').config()

const express = require('express')
const { createClient } = require('@supabase/supabase-js')

const app = express()

app.use(express.json())
app.use(express.static('public'))

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
)

app.listen(3000, () => 
  console.log('Running on http://localhost:3000')
)