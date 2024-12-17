import { io } from 'socket.io-client'
import { connectChat } from './chat/chat'
import { connectCanvas } from './canvas/canvas'

const socket = io('http://localhost:9090')

connectChat(socket)

connectCanvas(socket)
