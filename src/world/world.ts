import * as THREE from 'three'
import { cubeFactory } from '../canvas/util.js'
import { CameraHelper } from './camera.js'
import { Player } from './player.js'
import { Socket } from 'socket.io-client'
import EventHelper from './eventHelper.js'
import { InputHelper } from './input.js'
import { TextHelper } from './text/text.js'

export class World {
  scene: THREE.Scene
  cameraHelper: CameraHelper
  renderer: THREE.WebGLRenderer
  player?: Player
  chatInputBox: HTMLInputElement

  textHelper: TextHelper
  eventHelper: EventHelper
  inputHelper: InputHelper
  playerEntityIdToPlayerMap: Map<number, Player>

  constructor(
    container: HTMLDivElement,
    renderer: THREE.WebGLRenderer,
    socket: Socket,
    textHelper: TextHelper
  ) {
    this.scene = new THREE.Scene()
    this.textHelper = textHelper
    this.inputHelper = new InputHelper(container)
    this.eventHelper = new EventHelper(socket, 20)
    this.playerEntityIdToPlayerMap = new Map()

    this.chatInputBox = document.querySelector('.chat-input')!

    for (let i = -2; i <= 2; i++) {
      this.scene.add(cubeFactory(1, i, 0, -0.5))
    }

    this.cameraHelper = new CameraHelper(container, 5, 10, 30)
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
        this.cameraHelper,
        this.textHelper
      )
      this.scene.add(this.player.object3d)
      this.playerEntityIdToPlayerMap.set(e.entityId, this.player)
    })

    socket.on('remotePlayersInitialize', (playersData) => {
      playersData.forEach((e: any) => {
        const remotePlayer = new Player(
          { receiveServerUpdates: true },
          e.entityId,
          new THREE.Vector3(e.x, e.y, e.z),
          undefined,
          undefined,
          undefined,
          undefined,
          this.cameraHelper,
          this.textHelper
        )
        this.scene.add(remotePlayer.object3d)
        this.playerEntityIdToPlayerMap.set(e.entityId, remotePlayer)
      })
    })

    socket.on('remotePlayerSpawn', (e) => {
      const remotePlayer = new Player(
        {
          receiveServerUpdates: true,
        },
        e.entityId,
        new THREE.Vector3(e.x, e.y, e.z),
        undefined,
        undefined,
        undefined,
        undefined,
        this.cameraHelper,
        this.textHelper
      )
      this.scene.add(remotePlayer.object3d)
      this.playerEntityIdToPlayerMap.set(e.entityId, remotePlayer)
    })

    socket.on('playerUpdate', (e) => {
      const p = this.playerEntityIdToPlayerMap.get(e.entityId)
      if (!p) {
        return
      }
      p.object3d.position.x = e.x
      p.object3d.position.y = e.y
      p.object3d.position.z = e.z

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
      this.scene.remove(despawnedPlayer.object3d) // TODO: make sure this cleanup is sufficient (this involves meshes)
    })
  }

  postPlayerMessage(playerId: number, msg: string) {
    this.textHelper.postMessage(playerId, msg)
  }

  process(delta: number) {
    this.cameraHelper.process(delta)
    // this.player?.process(delta)

    for (const player of this.playerEntityIdToPlayerMap.values()) {
      player.process(delta)
    }

    // console.log(this.inputHelper.justPressed)
    if (this.inputHelper.justPressed.enter) {
      this.chatInputBox.focus()
    }
  }

  render() {
    this.renderer.render(this.scene, this.cameraHelper.camera)
    this.textHelper.renderer.render(this.scene, this.cameraHelper.camera)
  }
}
