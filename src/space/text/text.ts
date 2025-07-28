import {
  CSS2DObject,
  CSS2DRenderer,
} from 'three/examples/jsm/renderers/CSS2DRenderer.js'
import { Player } from '../entity/player.js'

export class TextHelper {
  renderer: CSS2DRenderer

  playerNameToNameLabel: Map<string, CSS2DObject>
  playerNameToMessageLabel: Map<string, CSS2DObject>
  playerNameToTimeout: Map<string, NodeJS.Timeout>

  constructor(container: HTMLDivElement) {
    const renderer = new CSS2DRenderer()
    this.renderer = renderer
    renderer.setSize(container.offsetWidth, container.offsetHeight)
    renderer.domElement.classList.add('game-text-canvas')
    container.appendChild(renderer.domElement)

    this.playerNameToNameLabel = new Map()
    this.playerNameToMessageLabel = new Map()
    this.playerNameToTimeout = new Map()
  }

  initializePlayerLabels(player: Player) {
    const playerNameDiv = document.createElement('div')
    playerNameDiv.classList.add(
      'user-name-tag',
      player.isLocalPlayer ? 'user-local-name-tag' : 'user-remote-name-tag'
    )
    playerNameDiv.textContent = player.name
    const playerNameLabel = new CSS2DObject(playerNameDiv)
    playerNameLabel.position.set(0, -0.8, 0)

    player.object3d.add(playerNameLabel)

    const playerMessageDiv = document.createElement('div')
    playerMessageDiv.classList.add('user-message')
    const playerMessageLabel = new CSS2DObject(playerMessageDiv)
    playerMessageLabel.position.set(0, 0.8, 0)

    player.object3d.add(playerMessageLabel)

    this.playerNameToNameLabel.set(player.name, playerNameLabel)
    this.playerNameToMessageLabel.set(player.name, playerMessageLabel)
  }

  postMessage(name: string, msg: string) {
    const label = this.playerNameToMessageLabel.get(name)
    if (!label) {
      return
    }
    label.visible = true
    label.element.textContent = msg
    clearTimeout(this.playerNameToTimeout.get(name))
    const timeout = setTimeout(() => {
      label.visible = false
    }, 5000)
    this.playerNameToTimeout.set(name, timeout)
  }

  removePlayerLabels(player: Player) {
    const nameLabel = this.playerNameToNameLabel.get(player.name)
    if (nameLabel) {
      player.object3d.remove(nameLabel)
    }
    const messageLabel = this.playerNameToMessageLabel.get(player.name)
    if (messageLabel) {
      player.object3d.remove(messageLabel)
    }
  }
}
