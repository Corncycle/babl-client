import * as THREE from 'three'

import vertexShaderRaw from './shaders/player.vert?raw'
import fragmentShaderRaw from './shaders/player.frag?raw'
import { SyncedObjectOptions } from './syncedEntity.js'
import { Socket } from 'socket.io-client'
import { InputHelper } from './input.js'
import EventHelper from './eventHelper.js'
import { CameraHelper } from './camera.js'
import { TextHelper } from './text/text.js'
// import { createTextMaterial } from './util.js'
// import { fontGeo } from './util.js'

export interface PlayerUpdate {
  entityId: number
  x: number
  y: number
  z: number
  xv?: number
  yv?: number
  zv?: number
}

export class Player {
  static geometry = new THREE.TetrahedronGeometry()
  static material = new THREE.MeshNormalMaterial()

  entityId: number

  object3d: THREE.Object3D
  mesh: THREE.Mesh

  sendServerUpdates: boolean
  socket?: Socket

  inputHelper?: InputHelper
  eventHelper?: EventHelper
  cameraHelper?: CameraHelper

  pressed?: { [pressedValue: string]: boolean }
  justPressed?: { [pressedValue: string]: boolean }
  justReleased?: { [pressedValue: string]: boolean }

  remoteXv: number
  remoteYv: number
  remoteZv: number

  constructor(
    options: SyncedObjectOptions,
    entityId: number,
    position: THREE.Vector3,
    socket?: Socket,
    container?: HTMLDivElement,
    inputHelper?: InputHelper,
    eventHelper?: EventHelper,
    cameraHelper?: CameraHelper,
    textHelper?: TextHelper
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
    this.object3d = new THREE.Object3D()
    this.mesh = new THREE.Mesh(Player.geometry, Player.material)
    this.object3d.add(this.mesh)
    this.object3d.position.set(position.x, position.y, position.z)

    // const textMesh = new THREE.Mesh(fontGeo, new THREE.MeshNormalMaterial())

    if (options.sendServerUpdates && inputHelper) {
      this.inputHelper = inputHelper
      this.pressed = inputHelper.pressed
      this.justPressed = inputHelper.justPressed
      this.justReleased = inputHelper.justReleased
    }

    this.socket = socket
    this.eventHelper = eventHelper
    this.cameraHelper = cameraHelper
    if (this.sendServerUpdates) {
      this.cameraHelper?.moveTo(
        this.object3d.position.x,
        this.object3d.position.y
      )
    }

    this.remoteXv = 0
    this.remoteYv = 0
    this.remoteZv = 0

    textHelper!.initializePlayerLabels(this)
  }

  process(delta: number) {
    this.moveFromCurrentInput(delta)
  }

  // call this if we detect any movement to adjust the character mesh accordingly
  // this should also be called if any movement key was just released so we can
  // properly send that update to the server (that the local player is not moving)
  moveFromCurrentInput(delta: number) {
    if (this.sendServerUpdates) {
      // LOCAL PLAYER UPDATES
      if (!this.pressed) {
        return
      }

      // if no current input is pressed and no key was just released, just abort
      if (
        Object.values(this.pressed).every((val) => val === false) &&
        Object.values(this.justReleased!).every((val) => val === false)
      ) {
        return
      }

      let xv = 0
      let yv = 0
      let updatedPosition = false
      if (this.pressed.left) {
        updatedPosition = true
        this.object3d.position.x -= delta
        xv -= 1
      }
      if (this.pressed.right) {
        updatedPosition = true
        this.object3d.position.x += delta
        xv += 1
      }
      if (this.pressed.up) {
        updatedPosition = true
        this.object3d.position.y += delta
        yv += 1
      }
      if (this.pressed.down) {
        updatedPosition = true
        this.object3d.position.y -= delta
        yv -= 1
      }

      this.eventHelper?.setLocalPlayerPosition(
        this.entityId,
        this.object3d.position.x,
        this.object3d.position.y,
        this.object3d.position.z
      )
      this.cameraHelper?.moveTo(
        this.object3d.position.x,
        this.object3d.position.y
      )

      this.eventHelper?.setLocalPlayerVelocity(xv, yv, 0)
    } else {
      // REMOTE PLAYER UPDATES
      this.object3d.position.x += delta * this.remoteXv
      this.object3d.position.y += delta * this.remoteYv
      this.object3d.position.z += delta * this.remoteZv
    }
  }
}
