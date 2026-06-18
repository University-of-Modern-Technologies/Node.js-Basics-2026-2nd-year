import { WebSocketServer } from 'ws'

const wss = new WebSocketServer({ port: 8080 })

const clients = []

wss.on('connection', (ws) => {
  const id = clients.length
  clients[id] = ws
  console.log(`New connection ${id}`)
  console.log(ws)

  ws.send(
    JSON.stringify({
      type: 'greeting',
      message: `Hi you id equals ${id}`,
      id: id,
    }),
  )

  ws.on('message', (message) => {
    clients.forEach((client) => {
      client.send(
        JSON.stringify({
          type: 'message',
          message: message.toString(),
          id: id,
        }),
      )
    })
  })

  ws.on('close', () => {
    delete clients[id]
    clients.forEach((client) => {
      client.send(
        JSON.stringify({
          type: 'info',
          message: `We have lost connection ${id}`,
          id: id,
        }),
      )
    })
  })
})
