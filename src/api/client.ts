import axios from 'axios'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://fueld-server.onrender.com',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

export default client
