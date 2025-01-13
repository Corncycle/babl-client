import { io } from 'socket.io-client'
import { connectChat } from './chat/chat'
import { connectCanvas } from './canvas/canvas'
import { initializeRapier } from './space/rapier.js'
;(async function initialize() {
  await initializeRapier()

  const socket = io('http://localhost:9090')

  const space = connectCanvas(socket)
  connectChat(socket, space)
})()
