import { io } from 'socket.io-client'
import { connectChat } from './chat/chat'
import { connectCanvas } from './canvas/canvas'
import { initializeRapier } from './space/rapier.js'
import { loadResources } from './loader.js'
;(async function initialize() {
  await initializeRapier()

  await loadResources()

  const socket = io('http://localhost:9090')

  socket.on('connect_error', (err) => {
    console.log('failed to connect to socket server')
    console.log(err)
  })

  const space = connectCanvas(socket)
  connectChat(socket, space)
})()
