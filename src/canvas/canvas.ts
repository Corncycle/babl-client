import * as THREE from 'three'
import { Socket } from 'socket.io-client'
import { World } from '../world/world.js'

export const connectCanvas = (socket: Socket) => {
  const container: HTMLDivElement = document.querySelector('.game-canvas')!
  const renderer = new THREE.WebGLRenderer()
  renderer.setSize(container.offsetWidth, container.offsetHeight)
  renderer.outputColorSpace = THREE.SRGBColorSpace

  const world = new World(container, renderer, socket)

  container.appendChild(renderer.domElement)

  const clock = new THREE.Clock()
  function animate() {
    const delta = Math.min(clock.getDelta(), 0.1)

    world.process(delta)
    world.render()

    world.inputHelper.clearJustPressedAndReleased()

    requestAnimationFrame(animate)
  }

  animate()
}
