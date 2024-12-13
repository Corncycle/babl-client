import { io } from 'socket.io-client'
import { connectChat } from './chat/chat'

const socket = io('http://localhost:9090')

connectChat(socket)
