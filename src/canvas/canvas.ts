import * as THREE from 'three'
import { Socket } from 'socket.io-client'
import { World } from '../world/world.js'
import { TextHelper } from '../world/text/text.js'

export const connectCanvas = (socket: Socket) => {
  const container: HTMLDivElement = document.querySelector(
    '.game-canvas-container'
  )!
  const renderer = new THREE.WebGLRenderer({ logarithmicDepthBuffer: true })
  renderer.setSize(container.offsetWidth, container.offsetHeight)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  container.appendChild(renderer.domElement)

  const textHelper = new TextHelper(container)

  const world = new World(container, renderer, socket, textHelper)

  const clock = new THREE.Clock()
  function animate() {
    const delta = Math.min(clock.getDelta(), 0.1)

    world.process(delta)
    world.render()

    world.inputHelper.clearJustPressedAndReleased()

    requestAnimationFrame(animate)
  }

  animate()

  return world
}
