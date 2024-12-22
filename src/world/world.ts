import * as THREE from 'three'
import { cubeFactory } from '../canvas/util.js'
import { CameraHelper } from './camera.js'
import { Player } from './player.js'
import { Socket } from 'socket.io-client'
import EventHelper from './eventHelper.js'
import { InputHelper } from './input.js'

export class World {
  scene: THREE.Scene
  cameraHelper: CameraHelper
  renderer: THREE.WebGLRenderer
  player?: Player

  eventHelper: EventHelper
  inputHelper: InputHelper
  playerEntityIdToPlayerMap: Map<number, Player>

  constructor(
    container: HTMLDivElement,
    renderer: THREE.WebGLRenderer,
    socket: Socket
  ) {
    this.scene = new THREE.Scene()
    this.inputHelper = new InputHelper(container)
    this.eventHelper = new EventHelper(socket, 20)
    this.playerEntityIdToPlayerMap = new Map()

    for (let i = -2; i <= 2; i++) {
      this.scene.add(cubeFactory(1, i, 0, -0.5))
    }

    this.cameraHelper = new CameraHelper(container, 45, 10, 10)
    this.renderer = renderer

    socket.on('localPlayerSpawn', (e) => {
      if (this.player) {
        return
      }
      this.player = new Player(
        { sendServerUpdates: true },
        e.entityId,
        new THREE.Vector3(e.x, e.y, e.z),
        socket,
        container,
        this.inputHelper,
        this.eventHelper,
        this.cameraHelper
      )
      this.scene.add(this.player.mesh)
      this.playerEntityIdToPlayerMap.set(e.entityId, this.player)
    })

    socket.on('remotePlayersInitialize', (playersData) => {
      playersData.forEach((e: any) => {
        const remotePlayer = new Player(
          { receiveServerUpdates: true },
          e.entityId,
          new THREE.Vector3(e.x, e.y, e.z)
        )
        this.scene.add(remotePlayer.mesh)
        this.playerEntityIdToPlayerMap.set(e.entityId, remotePlayer)
      })
    })

    socket.on('remotePlayerSpawn', (e) => {
      const remotePlayer = new Player(
        {
          receiveServerUpdates: true,
        },
        e.entityId,
        new THREE.Vector3(e.x, e.y, e.z)
      )
      this.scene.add(remotePlayer.mesh)
      this.playerEntityIdToPlayerMap.set(e.entityId, remotePlayer)
    })

    socket.on('playerUpdate', (e) => {
      const p = this.playerEntityIdToPlayerMap.get(e.entityId)
      if (!p) {
        return
      }
      p.mesh.position.x = e.x
      p.mesh.position.y = e.y
      p.mesh.position.z = e.z

      if (e.xv !== undefined) {
        p.remoteXv = e.xv
      }
      if (e.yv !== undefined) {
        p.remoteYv = e.yv
      }
      if (e.zv !== undefined) {
        p.remoteZv = e.zv
      }
    })

    socket.on('remotePlayerDespawn', (id) => {
      console.log(`player ${id} disconnected`)
      const despawnedPlayer = this.playerEntityIdToPlayerMap.get(id)
      if (!despawnedPlayer) {
        return
      }
      this.playerEntityIdToPlayerMap.delete(id)
      this.scene.remove(despawnedPlayer.mesh) // TODO: make sure this cleanup is sufficient
    })
  }

  process(delta: number) {
    this.cameraHelper.process(delta)
    // this.player?.process(delta)

    for (const player of this.playerEntityIdToPlayerMap.values()) {
      player.process(delta)
    }
  }

  render() {
    this.renderer.render(this.scene, this.cameraHelper.camera)
  }
}
