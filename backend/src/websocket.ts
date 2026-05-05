import { WebSocketServer, WebSocket } from 'ws'
import { IncomingMessage } from 'http'
import { Server } from 'http'

let wss: WebSocketServer | null = null

export function initWebSocket(server: Server) {
  wss = new WebSocketServer({ server, path: '/ws' })

  wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
    const ip = req.socket.remoteAddress
    console.log(`WS client connected: ${ip}`)

    ws.on('close', () => console.log(`WS client disconnected: ${ip}`))
    ws.on('error', (err) => console.error('WS error:', err.message))

    // Send a welcome ping so the client knows it's connected
    ws.send(JSON.stringify({ type: 'connected', ts: new Date().toISOString() }))
  })

  console.log('WebSocket server ready at /ws')
}

export function broadcast(data: object) {
  if (!wss) return
  const payload = JSON.stringify(data)
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload)
    }
  })
}
