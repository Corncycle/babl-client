import RAPIER from '@dimforge/rapier3d-compat'
import * as THREE from 'three'
import { CameraHelper } from './camera.js'
import { Player } from './entity/player.js'
import { TextHelper } from './text/text.js'
import EventHelper from './eventHelper.js'
import { InputHelper } from './input.js'
import { IEntity } from './entity/entity.js'
import { Socket } from 'socket.io-client'
import { handleMapLoad } from './map.js'

export class Space {
  scene: THREE.Scene
  world: RAPIER.World
  cameraHelper: CameraHelper
  renderer: THREE.WebGLRenderer

  textHelper: TextHelper
  eventHelper: EventHelper
  inputHelper: InputHelper
  entityIdToEntityMap: Map<number, IEntity>

  chatInputBox: HTMLInputElement

  localPlayer?: Player

  initialLoad: boolean

  constructor(
    container: HTMLDivElement,
    renderer: THREE.WebGLRenderer,
    socket: Socket,
    textHelper: TextHelper
  ) {
    this.scene = new THREE.Scene()
    this.world = new RAPIER.World({ x: 0, y: 0, z: -9.8 })
    this.cameraHelper = new CameraHelper(5, 10, 30)
    this.renderer = renderer

    this.textHelper = textHelper
    this.eventHelper = new EventHelper(socket, 2)
    this.inputHelper = new InputHelper(container)
    this.entityIdToEntityMap = new Map()

    this.chatInputBox = document.querySelector('.chat-input')!

    this.initialLoad = false

    socket.on('localPlayerSpawn', (e) => {
      if (this.localPlayer) {
        return
      }
      this.localPlayer = new Player(
        { isLocal: true },
        e.entityId,
        new THREE.Vector3(e.x, e.y, e.z),
        textHelper,
        socket,
        this
      )
      this.scene.add(this.localPlayer.object3d)
      this.entityIdToEntityMap.set(e.entityId, this.localPlayer)
    })

    // for loading in pre-existing players as the local player loads in
    socket.on('remotePlayersInitialize', (playersData) => {
      playersData.forEach((e: any) => {
        const remotePlayer = new Player(
          { isLocal: false },
          e.entityId,
          new THREE.Vector3(e.x, e.y, e.z),
          textHelper
        )
        this.scene.add(remotePlayer.object3d)
        this.entityIdToEntityMap.set(e.entityId, remotePlayer)
      })
    })

    // for loading in players that join after the local player
    socket.on('remotePlayerSpawn', (e) => {
      const remotePlayer = new Player(
        { isLocal: false },
        e.entityId,
        new THREE.Vector3(e.x, e.y, e.z),
        textHelper
      )
      this.scene.add(remotePlayer.object3d)
      this.entityIdToEntityMap.set(e.entityId, remotePlayer)
    })

    socket.on('playerUpdate', (e) => {
      const remotePlayer = this.entityIdToEntityMap.get(e.entityId) as Player
      if (!remotePlayer) {
        return
      }
      remotePlayer.object3d.position.set(e.x, e.y, e.z)
    })

    socket.on('remotePlayerDespawn', (id) => {
      const despawnedPlayer = this.entityIdToEntityMap.get(id) as Player
      if (!despawnedPlayer) {
        return
      }
      this.entityIdToEntityMap.delete(id)
      this.textHelper.removePlayerLabels(despawnedPlayer)
      this.scene.remove(despawnedPlayer.object3d) // TODO: look more closely into whether this cleanup is sufficient (this involves meshes)
    })

    socket.on('mapData', (mapData: any) => {
      handleMapLoad(this, mapData)
    })
  }

  postPlayerMessage(playerId: number, msg: string) {
    this.textHelper.postMessage(playerId, msg)
  }

  process(delta: number) {
    this.world.timestep = delta
    this.world.step()

    for (const entity of this.entityIdToEntityMap.values()) {
      entity.process(delta)
    }

    if (this.inputHelper.justPressed.enter) {
      this.chatInputBox.focus()
    }
  }

  render() {
    this.renderer.render(this.scene, this.cameraHelper.camera)
    this.textHelper.renderer.render(this.scene, this.cameraHelper.camera)
  }
}
