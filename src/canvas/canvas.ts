import * as THREE from 'three'
import { Socket } from 'socket.io-client'
import { Space } from '../world/space.js'
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

  const space = new Space(container, renderer, socket, textHelper)

  const clock = new THREE.Clock()
  function animate() {
    const delta = Math.min(clock.getDelta(), 0.1)

    space.process(delta)
    space.render()

    space.inputHelper.clearJustPressedAndReleased()

    requestAnimationFrame(animate)
  }

  animate()

  return space
}
