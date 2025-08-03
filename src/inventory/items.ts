import { Socket } from 'socket.io-client'
import { Space } from '../space/space.js'
import { randInt } from 'three/src/math/MathUtils.js'

const canvasContainer: HTMLDivElement = document.querySelector(
  '.game-canvas-container'
)!
const sidePanel = document.querySelector('.side-panel')!

let localItems: Item[] = []

interface Item {
  id: number
  name: string
  attributes?: {}
}

export const connectItemPane = (socket: Socket, space: Space) => {
  const addItemLocally = (id: number, name: string = '') => {
    if (localItems.find((i) => i.id === id)) {
      return
    }

    localItems.push({ id, name })

    sidePanel.appendChild(createItemElement(id, name))
  }

  const removeItemLocally = (id: number) => {
    localItems = localItems.filter((i) => i.id !== id)

    const elm = sidePanel.querySelector(`[data-item-id='${id}']`)

    // couldn't find item, might not exist on the client side
    if (!elm) {
      return
    }

    elm.replaceChildren()
    elm.remove()
  }

  const createItemElement = (itemId: number, name: string = '') => {
    const containerElm = document.createElement('div')
    containerElm.classList.add('item-container')
    containerElm.dataset.itemId = '' + itemId

    const iconElm = document.createElement('div')
    iconElm.classList.add('item-icon')

    const descriptionElm = document.createElement('span')
    descriptionElm.classList.add('item-description')
    descriptionElm.innerText = name

    const itemButtonsContainer = document.createElement('div')
    itemButtonsContainer.classList.add('item-buttons-container')

    containerElm.append(iconElm, descriptionElm, itemButtonsContainer)

    const itemUseButton = document.createElement('span')
    itemUseButton.classList.add('item-button', 'item-button-use')
    itemUseButton.innerText = 'use'
    itemUseButton.dataset.itemId = '' + itemId

    itemUseButton.addEventListener('click', () => {
      removeItemLocally(itemId)
      socket.emit('useItem', itemId)
      canvasContainer.focus()
    })

    const itemDropButton = document.createElement('span')
    itemDropButton.classList.add('item-button', 'item-button-drop')
    itemDropButton.innerText = 'drop'
    itemDropButton.dataset.itemId = '' + itemId

    itemDropButton.addEventListener('click', () => {
      removeItemLocally(itemId)
      socket.emit('dropItem', itemId)
      canvasContainer.focus()
    })

    itemButtonsContainer.append(itemUseButton, itemDropButton)

    return containerElm
  }

  // TODO: define interfaces for all event payloads
  socket.on('giveItem', (item: Item) => {
    addItemLocally(item.id, item.name)
  })

  socket.on('removeItem', (item: Item) => {
    removeItemLocally(item.id)
  })
}
