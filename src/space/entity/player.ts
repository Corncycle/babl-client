import * as THREE from 'three'
import { IEntity } from './entity.js'
import RAPIER from '@dimforge/rapier3d-compat'
import { Socket } from 'socket.io-client'
import { Space } from '../space.js'
import { SyncedObjectOptions } from './syncedEntity.js'
import { TextHelper } from '../text/text.js'
import { materials } from '../../textureLoader.js'

export class Player implements IEntity {
  static geometry = new THREE.SphereGeometry(0.5, 16, 8)

  name: string
  entityId: number

  object3d: THREE.Object3D
  mesh: THREE.Mesh

  rigidBody?: RAPIER.RigidBody
  velocity: THREE.Vector3

  isLocalPlayer: boolean
  socket?: Socket

  space?: Space

  // we keep a local reference to these for the local player for easy access
  // undefined for remote players
  pressed?: { [pressedValue: string]: boolean }
  justPressed?: { [pressedValue: string]: boolean }
  justReleased?: { [pressedValue: string]: boolean }

  constructor(
    options: SyncedObjectOptions,
    name: string,
    entityId: number,
    position: THREE.Vector3,
    textHelper: TextHelper,
    socket?: Socket,
    space?: Space
  ) {
    this.name = name
    this.entityId = entityId
    this.object3d = new THREE.Object3D()
    this.mesh = new THREE.Mesh(Player.geometry, materials.mcSteve)

    this.mesh.receiveShadow = true
    this.mesh.castShadow = true

    this.object3d.add(this.mesh)
    this.object3d.position.copy(position)

    this.velocity = new THREE.Vector3()

    this.socket = socket

    this.isLocalPlayer = !!options.isLocal

    textHelper.initializePlayerLabels(this)

    // extra setup for the local player
    if (this.isLocalPlayer) {
      this.space = space!
      const inputHelper = this.space.inputHelper
      this.pressed = inputHelper.pressed
      this.justPressed = inputHelper.justPressed
      this.justReleased = inputHelper.justReleased

      this.space.cameraHelper.moveTo(
        this.object3d.position.x,
        this.object3d.position.y
      )

      const colliderDesc = new RAPIER.ColliderDesc(new RAPIER.Ball(0.5))
      this.rigidBody = this.space.world.createRigidBody(
        RAPIER.RigidBodyDesc.dynamic().lockRotations()
      )
      this.rigidBody.setTranslation(
        { x: position.x, y: position.y, z: 0.5 },
        true
      )
      this.space.world.createCollider(colliderDesc, this.rigidBody)
    }
  }

  process(delta: number) {
    // we run a step of the simulation immediately before calling player.process.
    // thus, the simulated player's velocity from 1 frame before might be more
    // accurate than the velocity that only depends on player input (it might take
    // collisions into account), so we store it and use this as the velocity we send
    // to other players
    let simulatedVelocity
    if (this.isLocalPlayer) {
      simulatedVelocity = this.rigidBody!.linvel()
    }

    this.moveFromCurrentInput(delta)

    if (this.isLocalPlayer) {
      const postInputLinvel = this.rigidBody!.linvel()
      if (postInputLinvel.x === 0 && postInputLinvel.y === 0) {
        simulatedVelocity!.x = 0
        simulatedVelocity!.y = 0
      }

      const t = this.rigidBody!.translation()
      this.object3d.position.copy(t)
      this.space!.cameraHelper.moveTo(
        this.object3d.position.x,
        this.object3d.position.y
      )
      this.space!.cameraHelper.moveTo(
        this.object3d.position.x,
        this.object3d.position.y
      )

      if (
        Object.values(this.pressed!).some((val) => val === true) ||
        Object.values(this.justReleased!).some((val) => val === true)
      ) {
        this.updateInputHelper(t, simulatedVelocity)
      }
    }
  }

  // often we want to override the x or y velocity of our rigidbody
  // but retain the z velocity. use this method to do so
  setPlanarLinvel(xv: number, yv: number) {
    if (!this.rigidBody) {
      return
    }
    const l = this.rigidBody.linvel()
    this.rigidBody.setLinvel({ x: xv, y: yv, z: l.z }, true)
    this.velocity.set(xv, yv, l.z)
  }

  moveFromCurrentInput(delta: number) {
    // local player updates
    if (this.isLocalPlayer) {
      if (
        Object.values(this.pressed!).every((val) => val === false) &&
        Object.values(this.justReleased!).every((val) => val === false)
      ) {
        return
      }

      let xv = 0
      let yv = 0
      // pressed, justPressed, and justReleased will always be defined
      // for the local player
      if (this.pressed!.left) {
        xv -= 1
      }
      if (this.pressed!.right) {
        xv += 1
      }
      if (this.pressed!.up) {
        yv += 1
      }
      if (this.pressed!.down) {
        yv -= 1
      }

      this.setPlanarLinvel(xv, yv)
    } else {
      // remote player updates
      this.object3d.position.x += delta * this.velocity.x
      this.object3d.position.y += delta * this.velocity.y
      this.object3d.position.z += delta * this.velocity.z
    }
  }

  updateInputHelper(
    pos?: { x: number; y: number; z: number },
    vel?: { x: number; y: number; z: number }
  ) {
    if (!this.isLocalPlayer) {
      return
    }
    // TODO: check whether this should be set AFTER stepping the physics
    // simulation forward (the linvel is set but not used above yet)
    if (pos) {
      this.space!.eventHelper.setLocalPlayerPosition(
        this.entityId,
        pos.x,
        pos.y,
        pos.z
      )
    }
    if (vel) {
      this.space!.eventHelper.setLocalPlayerVelocity(
        this.entityId,
        vel.x,
        vel.y,
        0
      )
    }
  }
}
