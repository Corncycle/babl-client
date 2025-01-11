import { io } from 'socket.io-client'
import { connectChat } from './chat/chat'
import { connectCanvas } from './canvas/canvas'
import { rapier } from './world/rapier.js'

const socket = io('http://localhost:9090')

socket.on('message', (msg) => {
  console.log(msg)
})

const space = connectCanvas(socket)
connectChat(socket, space)
