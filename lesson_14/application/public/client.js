const authPanel = document.getElementById('authPanel')
const chatPanel = document.getElementById('chatPanel')
const authForm = document.getElementById('authForm')
const loginModeBtn = document.getElementById('loginModeBtn')
const registerModeBtn = document.getElementById('registerModeBtn')
const authSubmitBtn = document.getElementById('authSubmitBtn')
const authMessage = document.getElementById('authMessage')
const usernameInput = document.getElementById('usernameInput')
const passwordInput = document.getElementById('passwordInput')
const currentUserEl = document.getElementById('currentUser')
const logoutBtn = document.getElementById('logoutBtn')
const roomSelect = document.getElementById('roomSelect')
const statusEl = document.getElementById('connectionStatus')
const messagesEl = document.getElementById('messages')
const typingStatusEl = document.getElementById('typingStatus')
const messageForm = document.getElementById('messageForm')
const messageInput = document.getElementById('messageInput')

let socket
let authMode = 'login'
let currentRoom = roomSelect.value
let typingTimer

const timeFormatter = new Intl.DateTimeFormat('uk-UA', {
  hour: '2-digit',
  minute: '2-digit',
})

const setAuthMode = (mode) => {
  authMode = mode
  const isLogin = mode === 'login'

  loginModeBtn.className = isLogin
    ? 'rounded-lg bg-cyan-400 px-4 py-2 font-semibold text-slate-950'
    : 'rounded-lg bg-slate-800 px-4 py-2 font-semibold text-slate-200'
  registerModeBtn.className = isLogin
    ? 'rounded-lg bg-slate-800 px-4 py-2 font-semibold text-slate-200'
    : 'rounded-lg bg-cyan-400 px-4 py-2 font-semibold text-slate-950'
  authSubmitBtn.textContent = isLogin ? 'Увійти' : 'Зареєструватися'
  passwordInput.autocomplete = isLogin ? 'current-password' : 'new-password'
  authMessage.textContent = ''
}

const setConnectionStatus = (text, className) => {
  statusEl.textContent = text
  statusEl.className = `font-medium ${className}`
}

const addMessage = ({ author, text, timestamp }) => {
  const item = document.createElement('li')
  item.className = 'rounded-xl bg-slate-800 p-3'

  const meta = document.createElement('div')
  meta.className =
    'mb-1 flex items-center justify-between text-xs text-slate-400'

  const authorEl = document.createElement('span')
  authorEl.textContent = author // innerHTML не можна

  const timeEl = document.createElement('time')
  timeEl.textContent = timeFormatter.format(new Date(timestamp))

  const textEl = document.createElement('p')
  textEl.className = 'text-slate-100'
  textEl.textContent = text

  meta.append(authorEl, timeEl)
  item.append(meta, textEl)
  messagesEl.append(item)
  messagesEl.scrollTop = messagesEl.scrollHeight
}

const addSystemMessage = (text) => {
  addMessage({
    author: 'Система',
    text,
    timestamp: Date.now(),
  })
}

const showChat = (user) => {
  currentUserEl.textContent = user.username
  authPanel.hidden = true
  chatPanel.hidden = false
}

const showAuth = () => {
  authPanel.hidden = false
  chatPanel.hidden = true
  currentUserEl.textContent = ''
  messagesEl.textContent = ''
  typingStatusEl.textContent = ''
  setConnectionStatus('не підключено', 'text-amber-300')
}

const joinRoom = (roomName) => {
  socket.emit('join room', roomName)
  addSystemMessage(`Ви приєдналися до кімнати ${roomName}`)
}

const connectSocket = () => {
  if (socket) {
    return
  }

  socket = io()

  socket.on('connect', () => {
    setConnectionStatus('підключено', 'text-emerald-300')
    joinRoom(currentRoom)
  })

  socket.on('connect_error', (error) => {
    setConnectionStatus('помилка підключення', 'text-rose-300')
    authMessage.textContent = error.message
    socket.disconnect()
    socket = undefined
    showAuth()
  })

  socket.on('disconnect', () => {
    setConnectionStatus('відключено', 'text-rose-300')
  })

  socket.on('room history', (messages) => {
    messagesEl.textContent = ''
    messages.forEach(addMessage)
  })

  socket.on('chat message', (message) => {
    console.log('Отримано від сервера:', message)
    addMessage(message)
  })

  socket.on('user joined', ({ message }) => {
    addSystemMessage(message)
  })

  socket.on('user typing', (username) => {
    typingStatusEl.textContent = `${username} набирає повідомлення...`
    clearTimeout(typingTimer)
    typingTimer = setTimeout(() => {
      typingStatusEl.textContent = ''
    }, 1500)
  })
}

const authRequest = async (path) => {
  const response = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: usernameInput.value.trim(),
      password: passwordInput.value,
    }),
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || 'Помилка авторизації')
  }

  return response.json()
}

const restoreSession = async () => {
  try {
    const response = await fetch('/auth/me')
    if (!response.ok) {
      showAuth()
      return
    }

    const user = await response.json()
    showChat(user)
    connectSocket()
  } catch {
    showAuth()
  }
}

loginModeBtn.addEventListener('click', () => setAuthMode('login'))
registerModeBtn.addEventListener('click', () => setAuthMode('register'))

authForm.addEventListener('submit', async (event) => {
  event.preventDefault()
  authMessage.textContent = ''

  try {
    const path = authMode === 'login' ? '/auth/login' : '/auth/register'
    const user = await authRequest(path)

    showChat(user)
    connectSocket()
    authForm.reset()
  } catch (error) {
    authMessage.textContent = error.message
  }
})

logoutBtn.addEventListener('click', async () => {
  await fetch('/auth/logout', { method: 'POST' })

  if (socket) {
    socket.disconnect()
    socket = undefined
  }

  showAuth()
})

roomSelect.addEventListener('change', () => {
  if (!socket) {
    return
  }

  socket.emit('leave room', currentRoom)
  currentRoom = roomSelect.value
  messagesEl.textContent = ''
  joinRoom(currentRoom)
})

messageInput.addEventListener('input', () => {
  if (!socket || !messageInput.value.trim()) {
    return
  }

  socket.emit('user typing', currentRoom)
})

messageForm.addEventListener('submit', (event) => {
  event.preventDefault()

  const text = messageInput.value.trim()

  if (!socket || !text) {
    return
  }

  socket.emit('chat message', {
    roomName: currentRoom,
    text,
  })
  messageInput.value = ''
})

setAuthMode('login')
restoreSession()
