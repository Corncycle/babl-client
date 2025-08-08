import RAPIER from '@dimforge/rapier3d-compat'
import * as THREE from 'three'
import { CameraHelper } from './camera.js'
import { getModelFromName, Player } from './entity/player.js'
import { TextHelper } from './text/text.js'
import EventHelper from './eventHelper.js'
import { InputHelper } from './input.js'
import { IEntity } from './entity/entity.js'
import { Socket } from 'socket.io-client'
import { handleMapLoad } from './map.js'
import {
  Particle,
  ParticleSystem,
  ParticleSystemType,
} from './particles/particles.js'
import { RedVialParticleSystem } from './particles/RedVial.js'
import { BlueVialParticleSystem } from './particles/BlueVial.js'

export class Space {
  scene: THREE.Scene
  world: RAPIER.World
  cameraHelper: CameraHelper
  renderer: THREE.WebGLRenderer

  textHelper: TextHelper
  eventHelper: EventHelper
  inputHelper: InputHelper
  playerNameToEntityMap: Map<string, IEntity>
  particleSystems: ParticleSystem[]

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

    this.scene.add(new THREE.AmbientLight(0xffffff, 0.1))
    // directional lights point towards 0, 0, 0 by default
    const dirLight = new THREE.DirectionalLight(0xffffff, 3)
    dirLight.shadow.intensity = 0.7
    // TODO: refine and enable shadows
    dirLight.castShadow = true
    dirLight.position.set(-15, -35, 50)
    this.scene.add(dirLight)

    this.world = new RAPIER.World({ x: 0, y: 0, z: -9.8 })
    this.cameraHelper = new CameraHelper(15, 10, 30)
    this.renderer = renderer

    this.textHelper = textHelper
    this.eventHelper = new EventHelper(socket, 20)
    this.inputHelper = new InputHelper(container)
    this.playerNameToEntityMap = new Map()
    this.particleSystems = []

    this.chatInputBox = document.querySelector('.chat-input')!

    this.initialLoad = false

    socket.on('localPlayerSpawn', (e) => {
      if (this.localPlayer) {
        return
      }
      this.localPlayer = new Player(
        { isLocal: true },
        e.name,
        getModelFromName(e.name),
        Math.random(), // TODO: see if we need to actually give a proper entityId
        new THREE.Vector3(e.x, e.y, e.z),
        textHelper,
        socket,
        this
      )
      this.scene.add(this.localPlayer.object3d)
      this.playerNameToEntityMap.set(e.name, this.localPlayer)
    })

    // for loading in pre-existing players as the local player loads in
    socket.on('remotePlayersInitialize', (playersData) => {
      playersData.forEach((e: any) => {
        const remotePlayer = new Player(
          { isLocal: false },
          e.name,
          getModelFromName(e.name),
          Math.random(), // TODO: see if we need to actually give a proper entityId
          new THREE.Vector3(e.x, e.y, e.z),
          textHelper
        )
        this.scene.add(remotePlayer.object3d)
        this.playerNameToEntityMap.set(e.name, remotePlayer)
      })
    })

    // for loading in players that join after the local player
    socket.on('remotePlayerSpawn', (e) => {
      const remotePlayer = new Player(
        { isLocal: false },
        e.name,
        getModelFromName(e.name),
        Math.random(), // TODO: see if we need to actually give a proper entityId
        new THREE.Vector3(e.x, e.y, e.z),
        textHelper
      )
      this.scene.add(remotePlayer.object3d)
      this.playerNameToEntityMap.set(e.name, remotePlayer)
    })

    socket.on('playerUpdate', (e) => {
      const remotePlayer = this.playerNameToEntityMap.get(e.name) as Player
      if (!remotePlayer) {
        return
      }
      if (e.x !== undefined && e.y !== undefined && e.z !== undefined) {
        // lerping smooths any jitters that emerge from discrete events
        // lerp with 1.0 to respect server position exactly on the client side (jittery but responsive)
        // lerp with 0.0 to only respect server velocity and don't snap to server position at all (smooth but inaccurate)
        // lerp with a value in between to reconcile the two behaviors
        remotePlayer.object3d.position.lerp(e, 0.3)
        // remotePlayer.object3d.position.set(e.x, e.y, e.z)
      }
      remotePlayer.velocity.set(e.xv, e.yv, e.zv)
    })

    socket.on('remotePlayerDespawn', (name) => {
      const despawnedPlayer = this.playerNameToEntityMap.get(name) as Player
      if (!despawnedPlayer) {
        return
      }
      this.playerNameToEntityMap.delete(name)
      this.textHelper.removePlayerLabels(despawnedPlayer)
      this.scene.remove(despawnedPlayer.object3d) // TODO: look more closely into whether this cleanup is sufficient (this involves meshes)
    })

    socket.on('mapData', (mapData: any) => {
      handleMapLoad(this, mapData)
    })
  }

  postPlayerMessage(name: string, msg: string) {
    this.textHelper.postMessage(name, msg)
  }

  addParticleSystem(
    type: ParticleSystemType,
    x: number = 0,
    y: number = 0,
    z: number = 0
  ) {
    let ps
    switch (type) {
      case ParticleSystemType.VIAL_OF_RED_BREW:
        ps = new RedVialParticleSystem(this, x, y, z)
        break
      case ParticleSystemType.VIAL_OF_BLUE_BREW:
        ps = new BlueVialParticleSystem(this, x, y, z)
        break
    }
    this.particleSystems.push(ps)
  }

  // delta is in seconds
  process(delta: number) {
    this.world.timestep = delta
    this.world.step()

    for (const entity of this.playerNameToEntityMap.values()) {
      entity.process(delta)
    }

    // TODO: call particle system cleanup here (and implement in the class)
    this.particleSystems = this.particleSystems.filter((ps) => !ps.concluded)
    for (const ps of this.particleSystems) {
      ps.process(delta)
    }
  }

  render() {
    this.renderer.render(this.scene, this.cameraHelper.camera)
    this.textHelper.renderer.render(this.scene, this.cameraHelper.camera)
  }
}
