import axios from 'axios'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://fueld-server.onrender.com',
  timeout: 15000,
  // ngrok-skip-browser-warning: inert header (ignored by prod backend) that
  // bypasses ngrok-free's interstitial when testing through a tunnel.
  headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
})

export default client
