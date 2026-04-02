const API_PREFIX = '/api'

async function postForm(url, payload) {
  const response = await fetch(`${API_PREFIX}${url}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
    },
    body: new URLSearchParams(payload).toString()
  })

  if (!response.ok) {
    throw new Error(`请求失败：${response.status}`)
  }

  return response.json()
}

export function login(payload) {
  return postForm('/login', payload)
}

export function register(payload) {
  return postForm('/register', payload)
}
