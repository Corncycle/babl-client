import * as THREE from 'three'

import vertexShaderRaw from './shaders/player.vert?raw'
import fragmentShaderRaw from './shaders/player.frag?raw'
import { SyncedObjectOptions } from './syncedEntity.js'
import { Socket } from 'socket.io-client'
import { BooleanDirection, setupInput } from './input.js'

interface PlayerUpdate {
  x: number
  y: number
  z: number
}

export class Player {
  static geometry = new THREE.TetrahedronGeometry()
  static material = new THREE.MeshNormalMaterial()

  entityId: number

  mesh: THREE.Mesh
  pressed?: BooleanDirection

  sendServerUpdates: boolean
  socket?: Socket

  constructor(
    options: SyncedObjectOptions,
    entityId: number,
    position: THREE.Vector3,
    socket?: Socket,
    container?: HTMLDivElement
  ) {
    this.entityId = entityId
    this.sendServerUpdates = options.sendServerUpdates ?? false

    // const geometry = new THREE.TetrahedronGeometry()
    // const vectors = [
    //   new THREE.Vector3(1, 0, 0),
    //   new THREE.Vector3(0, 1, 0),
    //   new THREE.Vector3(0, 0, 1),
    // ]
    // const position = geometry.attributes.position
    // console.log(position)
    // const centers = new Float32Array(position.count * 3)
    // for (let i = 0, l = position.count; i < l; i++) {
    //   vectors[i % 3].toArray(centers, i * 3)
    // }
    // geometry.setAttribute('center', new THREE.BufferAttribute(centers, 3))
    // const tetraGeo = new THREE.TetrahedronGeometry(1)
    // const mat1 = new THREE.MeshBasicMaterial({
    //   color: 0xe0e0ff,
    //   wireframe: true,
    // })
    // const mat2 = new THREE.ShaderMaterial({
    //   uniforms: { thickness: { value: 1 } },
    //   vertexShader: vertexShaderRaw,
    //   fragmentShader: fragmentShaderRaw,
    //   side: THREE.DoubleSide,
    //   alphaToCoverage: true,
    // })
    // this.mesh = new THREE.Mesh(geometry, mat2)
    // console.log(tetraGeo)

    // const material = new THREE.MeshBasicMaterial({ color: 0xe0e0ff })
    this.mesh = new THREE.Mesh(Player.geometry, Player.material)
    this.mesh.position.set(position.x, position.y, position.z)

    if (options.sendServerUpdates) {
      const { pressed } = setupInput(container!)
      this.pressed = pressed
    }

    this.socket = socket
  }

  process(delta: number) {
    if (this.sendServerUpdates) {
      if (!this.pressed) {
        return
      }

      let updatedPosition = false
      if (this.pressed.left) {
        updatedPosition = true
        this.mesh.position.x -= delta
      }
      if (this.pressed.right) {
        updatedPosition = true
        this.mesh.position.x += delta
      }
      if (this.pressed.up) {
        updatedPosition = true
        this.mesh.position.y += delta
      }
      if (this.pressed.down) {
        updatedPosition = true
        this.mesh.position.y -= delta
      }

      if (this.socket && updatedPosition) {
        this.socket.emit('playerUpdate', {
          entityId: this.entityId,
          x: this.mesh.position.x,
          y: this.mesh.position.y,
          z: this.mesh.position.z,
        })
      }
    }
  }
}
