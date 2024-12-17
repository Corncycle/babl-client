import * as THREE from 'three'
import { Socket } from 'socket.io-client'

export const connectCanvas = (socket: Socket) => {
  const container: HTMLDivElement = document.querySelector('.game-canvas')!
  const renderer = new THREE.WebGLRenderer()
  renderer.setSize(container.offsetWidth, container.offsetHeight)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  const scene = new THREE.Scene()

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.MeshNormalMaterial()
  )

  scene.add(ground)

  const camera = new THREE.PerspectiveCamera(
    10,
    container.offsetWidth / container.offsetHeight,
    0.01,
    1000
  )
  camera.position.y = 0
  camera.position.z = 10
  camera.lookAt(new THREE.Vector3(0, 0, 0))

  container.appendChild(renderer.domElement)

  container.addEventListener('keydown', (e) => {
    console.log(e.key)
  })

  const clock = new THREE.Clock()
  function animate() {
    const delta = Math.min(clock.getDelta(), 0.1)

    renderer.render(scene, camera)
    requestAnimationFrame(animate)
  }

  animate()
}
