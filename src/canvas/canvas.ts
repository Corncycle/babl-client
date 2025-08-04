import * as THREE from 'three'
import { Socket } from 'socket.io-client'
import { Space } from '../space/space.js'
import { TextHelper } from '../space/text/text.js'

export const connectCanvas = (socket: Socket) => {
  const container: HTMLDivElement = document.querySelector(
    '.game-canvas-container'
  )!
  // TODO: look into why logarithmicDepthBuffer ruins depth ordering for shader materials
  // const renderer = new THREE.WebGLRenderer({ logarithmicDepthBuffer: true })
  const renderer = new THREE.WebGLRenderer()
  renderer.setSize(container.offsetWidth, container.offsetHeight)
  renderer.outputColorSpace = THREE.SRGBColorSpace

  // TODO: tighten up shadows, until then disable them
  // renderer.shadowMap.enabled = true
  // renderer.shadowMap.type = THREE.PCFSoftShadowMap

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
