import {
  CSS2DObject,
  CSS2DRenderer,
} from 'three/examples/jsm/renderers/CSS2DRenderer.js'
import { Player } from '../player.js'

export class TextHelper {
  renderer: CSS2DRenderer

  playerEntityIdToMessageLabel: Map<number, CSS2DObject>
  playerEntityIdToTimeout: Map<number, NodeJS.Timeout>

  constructor(container: HTMLDivElement) {
    const renderer = new CSS2DRenderer()
    this.renderer = renderer
    renderer.setSize(container.offsetWidth, container.offsetHeight)
    renderer.domElement.classList.add('game-text-canvas')
    container.appendChild(renderer.domElement)

    this.playerEntityIdToMessageLabel = new Map()
    this.playerEntityIdToTimeout = new Map()
  }

  initializePlayerLabels(player: Player) {
    const playerNameDiv = document.createElement('div')
    playerNameDiv.classList.add(
      'user-name-tag',
      player.sendServerUpdates ? 'user-local-name-tag' : 'user-remote-name-tag'
    )
    playerNameDiv.textContent = `user ${player.entityId}`
    const playerNameLabel = new CSS2DObject(playerNameDiv)
    playerNameLabel.position.set(0, -0.8, 0)

    player.object3d.add(playerNameLabel)

    const playerMessageDiv = document.createElement('div')
    playerMessageDiv.classList.add('user-message')
    const playerMessageLabel = new CSS2DObject(playerMessageDiv)
    playerMessageLabel.position.set(0, 0.8, 0)

    player.object3d.add(playerMessageLabel)

    this.playerEntityIdToMessageLabel.set(player.entityId, playerMessageLabel)
  }

  postMessage(playerId: number, msg: string) {
    const label = this.playerEntityIdToMessageLabel.get(playerId)
    if (!label) {
      console.log('fialure')
      return
    }
    label.visible = true
    label.element.textContent = msg
    clearTimeout(this.playerEntityIdToTimeout.get(playerId))
    const timeout = setTimeout(() => {
      label.visible = false
    }, 5000)
    this.playerEntityIdToTimeout.set(playerId, timeout)
  }
}
