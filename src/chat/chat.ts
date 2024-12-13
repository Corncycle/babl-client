import { Socket } from 'socket.io-client'

const messagesContainerElm = document.querySelector('.chat-messages-container')!
const inputElm: HTMLInputElement = document.querySelector('.chat-input')!
const formElm: HTMLFormElement = document.querySelector('.chat-form')!

export const connectChat = (socket: Socket) => {
  inputElm.addEventListener('input', (e) => {})

  formElm.addEventListener('submit', (e) => {
    e.preventDefault()
    socket.emit('chat', inputElm.value)
    inputElm.value = ''
  })

  socket.on('chat', (msg) => {
    pushMessage(msg)

    messagesContainerElm.scrollTo(0, messagesContainerElm.scrollHeight)
  })
}

const pushMessage = (msgText: string) => {
  const msgElm = document.createElement('div')
  msgElm.textContent = msgText
  messagesContainerElm.append(msgElm)
}
