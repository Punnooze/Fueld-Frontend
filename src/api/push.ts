const API = import.meta.env.VITE_API_URL || 'https://fueld-server.onrender.com'

function urlB64ToUint8Array(base64: string): Uint8Array {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(b64)
  const out = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i)
  return out
}

export type PushResult = 'ok' | 'denied' | 'unsupported' | 'error'

export async function enablePush(): Promise<PushResult> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window))
    return 'unsupported'
  const perm = await Notification.requestPermission()
  if (perm !== 'granted') return 'denied'
  try {
    const reg = await navigator.serviceWorker.ready
    const { key } = await (await fetch(`${API}/push/publicKey`)).json()
    if (!key) return 'error'
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlB64ToUint8Array(key),
    })
    await fetch(`${API}/push/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sub),
    })
    return 'ok'
  } catch {
    return 'error'
  }
}

export async function testPush(): Promise<void> {
  await fetch(`${API}/push/test`, { method: 'POST' })
}
