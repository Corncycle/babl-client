import * as THREE from 'three'
import { cubeFactory } from '../canvas/util.js'
import { CameraHelper } from './camera.js'
import { Player } from './player.js'
import { Socket } from 'socket.io-client'

export class World {
  scene: THREE.Scene
  cameraHelper: CameraHelper
  renderer: THREE.WebGLRenderer
  player?: Player

  playerEntityIdToMeshMap: Map<number, THREE.Mesh> // TODO: this should just be a map to player probably

  constructor(
    container: HTMLDivElement,
    renderer: THREE.WebGLRenderer,
    socket: Socket
  ) {
    this.scene = new THREE.Scene()
    this.playerEntityIdToMeshMap = new Map()

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
        container
      )
      this.scene.add(this.player.mesh)
      this.playerEntityIdToMeshMap.set(e.entityId, this.player.mesh)
    })

    socket.on('remotePlayersInitialize', (playersData) => {
      playersData.forEach((e: any) => {
        const remotePlayer = new Player(
          { receiveServerUpdates: true },
          e.entityId,
          new THREE.Vector3(e.x, e.y, e.z)
        )
        this.scene.add(remotePlayer.mesh)
        this.playerEntityIdToMeshMap.set(e.entityId, remotePlayer.mesh)
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
      this.playerEntityIdToMeshMap.set(e.entityId, remotePlayer.mesh)
    })

    socket.on('playerUpdate', (e) => {
      const m = this.playerEntityIdToMeshMap.get(e.entityId)
      if (!m) {
        return
      }
      m.position.x = e.x
      m.position.y = e.y
      m.position.z = e.z
    })

    socket.on('remotePlayerDespawn', (id) => {
      console.log(`player ${id} disconnected`)
      const despawnedPlayerMesh = this.playerEntityIdToMeshMap.get(id)
      if (!despawnedPlayerMesh) {
        return
      }
      this.playerEntityIdToMeshMap.delete(id)
      this.scene.remove(despawnedPlayerMesh) // TODO: make sure this cleanup is sufficient
    })
  }

  process(delta: number) {
    this.cameraHelper.process(delta)
    this.player?.process(delta)
  }

  render() {
    this.renderer.render(this.scene, this.cameraHelper.camera)
  }
}
