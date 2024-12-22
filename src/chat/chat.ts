import { Socket } from 'socket.io-client'
import wordData from './le4raw.txt?raw'

const canvasContainer: HTMLDivElement = document.querySelector('.game-canvas')!
const chatContainer = document.querySelector('.chat-container')!
const messagesContainerElm = document.querySelector('.chat-messages-container')!
const inputElm: HTMLInputElement = document.querySelector('.chat-input')!
const decoratedElm: HTMLDivElement = document.querySelector(
  '.decorated-chat-display'
)!
const formElm: HTMLFormElement = document.querySelector('.chat-form')!

export const connectChat = (socket: Socket) => {
  inputElm.addEventListener('beforeinput', beforeTextInput)
  inputElm.addEventListener('input', onTextInput)
  inputElm.addEventListener('scroll', () => {
    syncScrollState()
  })

  formElm.addEventListener('submit', (e) => {
    e.preventDefault()
    socket.emit('chat', inputElm.value)
    inputElm.value = ''
    decoratedElm.innerHTML = ''
    canvasContainer.focus()
  })

  socket.on('chat', (e) => {
    pushMessage(e.msg, e.unit)

    messagesContainerElm.scrollTo(0, messagesContainerElm.scrollHeight)
  })
}

const beforeTextInput = (e: InputEvent) => {
  if (e.data && e.data.length > 1) {
    e.preventDefault()
    return
  }
  if (e.data && !/[a-zA-z ]/.test(e.data)) {
    e.preventDefault()
    return
  }
  if (e.data && inputElm.value.length >= 48) {
    e.preventDefault()
    return
  }
}

// we don't need to vet the event here because all input vetting should be done
// in `beforeTextInput`. this event just keeps the decorated elm in sync with
// the actual input elm
const onTextInput = (e?: Event) => {
  syncScrollState()
  decoratedElm.replaceChildren(...decorateText(inputElm.value))
}

// sync the scroll state between the input elm and the display elm.
// this should be done on text input (because overflow could scroll) and
// on manually scrolling the input element itself
const syncScrollState = () => {
  decoratedElm.scrollLeft = inputElm.scrollLeft
}

const decorateText = (text: string) => {
  const words = text.split(' ')
  const newChildren = []
  for (const word of words) {
    let wordElm = document.createElement('span')
    if (!wordSet.has(word.toLowerCase())) {
      if (word.length <= 4) {
        wordElm.classList.add('chat-input-invalid')
      } else {
        wordElm.classList.add('chat-input-invalid-long')
      }
    }
    wordElm.innerText = word
    newChildren.push(wordElm)
    let spaceElm = document.createElement('span')
    spaceElm.innerText = ' '
    spaceElm.classList.add('chat-input-space')
    newChildren.push(spaceElm)
  }
  return newChildren
}

const pushMessage = (msgText: string, unitName?: string) => {
  const containerElm = document.createElement('div')
  if (unitName) {
    const unitElm = document.createElement('span')
    unitElm.textContent = unitName + ': '
    unitElm.classList.add('chat-message-unit')
    containerElm.append(unitElm)
  }
  const msgElm = document.createElement('span')
  msgElm.textContent = msgText

  containerElm.append(msgElm)
  messagesContainerElm.append(containerElm)
}

export const wordSet = new Set(wordData.split(/\r?\n/))

onTextInput()
