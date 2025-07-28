import { Socket } from 'socket.io-client'
import wordData from './le4raw.txt?raw'
import { Space } from '../space/space.js'

const canvasContainer: HTMLDivElement = document.querySelector(
  '.game-canvas-container'
)!
const chatContainer: HTMLDivElement = document.querySelector('.chat-container')!
const messagesContainerElm = document.querySelector('.chat-messages-container')!
const chatInputElm: HTMLInputElement = document.querySelector('.chat-input')!
const chatDecoratedElm: HTMLDivElement = document.querySelector(
  '.decorated-chat-display'
)!
const chatFormElm: HTMLFormElement = document.querySelector('.chat-form')!

const loginInputElm: HTMLInputElement = document.querySelector('.login-input')!
const loginDecoratedElm: HTMLDivElement = document.querySelector(
  '.decorated-login-display'
)!

const inputElementsToRegister: {
  inputElm: HTMLInputElement
  decoratedElm: HTMLDivElement
  maxInputLength?: number
}[] = [
  { inputElm: chatInputElm, decoratedElm: chatDecoratedElm },
  {
    inputElm: loginInputElm,
    decoratedElm: loginDecoratedElm,
    maxInputLength: 12,
  },
]

// connects chatbox logic to game logic. everything else is generic and will be hooked up
// just by adding the relevant html elements to the array above ^^^
export const connectChat = (socket: Socket, space: Space) => {
  chatFormElm.addEventListener('submit', (e) => {
    e.preventDefault()
    socket.emit('chat', chatInputElm.value)
    chatInputElm.value = ''
    chatDecoratedElm.innerHTML = ''
    canvasContainer.focus()
  })

  socket.on('chat', (e) => {
    space.postPlayerMessage(e.name, e.msg)
  })

  socket.on('localMessage', (e) => {
    pushMessage(e.msg, e.unit)

    messagesContainerElm.scrollTo(0, messagesContainerElm.scrollHeight)
  })
}

const beforeTextInput = (
  inputElm: HTMLInputElement,
  maxInputLength: number = 48
) => {
  return (e: InputEvent) => {
    if (e.data && e.data.length > 1) {
      e.preventDefault()
      return
    }
    if (e.data && !/[a-zA-z ]/.test(e.data)) {
      e.preventDefault()
      return
    }
    if (e.data && inputElm.value.length >= maxInputLength) {
      e.preventDefault()
      return
    }
  }
}

// we don't need to vet the event here because all input vetting should be done
// in `beforeTextInput`. this event just keeps the decorated elm in sync with
// the actual input elm
const onTextInput = (
  inputElm: HTMLInputElement,
  decoratedElm: HTMLDivElement,
  syncScrollState: () => void
) => {
  return (e?: Event) => {
    syncScrollState()
    decoratedElm.replaceChildren(...decorateText(inputElm.value))
  }
}

// sync the scroll state between the input elm and the display elm.
// this should be done on text input (because overflow could scroll) and
// on manually scrolling the input element itself
const syncScrollState = (
  inputElm: HTMLInputElement,
  decoratedElm: HTMLDivElement
) => {
  return () => {
    decoratedElm.scrollLeft = inputElm.scrollLeft
  }
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

chatContainer.addEventListener('keydown', (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !(chatInputElm === document.activeElement)) {
    chatInputElm.focus()
    chatInputElm.setSelectionRange(-1, -1)
    e.preventDefault()
  }
})
canvasContainer.addEventListener('keydown', (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !(chatInputElm === document.activeElement)) {
    chatInputElm.focus()
    chatInputElm.setSelectionRange(-1, -1)
    e.preventDefault()
  }
})

for (const pair of inputElementsToRegister) {
  const syncState = syncScrollState(pair.inputElm, pair.decoratedElm)
  const onInput = onTextInput(pair.inputElm, pair.decoratedElm, syncState)

  pair.inputElm.addEventListener(
    'beforeinput',
    beforeTextInput(pair.inputElm, pair.maxInputLength)
  )
  pair.inputElm.addEventListener('input', onInput)
  pair.inputElm.addEventListener('scroll', syncState)

  onInput()
}
