import * as THREE from 'three'
import { IEntity } from './entity.js'
import RAPIER from '@dimforge/rapier3d-compat'
import { Socket } from 'socket.io-client'
import { Space } from '../space.js'
import { SyncedObjectOptions } from './syncedEntity.js'
import { TextHelper } from '../text/text.js'

export class Player implements IEntity {
  static geometry = new THREE.SphereGeometry(0.5, 16, 8)
  static material = new THREE.MeshNormalMaterial()

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
    entityId: number,
    position: THREE.Vector3,
    textHelper: TextHelper,
    socket?: Socket,
    space?: Space
  ) {
    this.entityId = entityId
    this.object3d = new THREE.Object3D()
    this.mesh = new THREE.Mesh(Player.geometry, Player.material)
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
        { ...this.rigidBody.translation(), z: 0.5 },
        true
      )
      this.space.world.createCollider(colliderDesc, this.rigidBody)
    }
  }

  process(delta: number) {
    this.moveFromCurrentInput(delta)

    if (this.isLocalPlayer) {
      const t = this.rigidBody!.translation()
      this.object3d.position.copy(t)
      this.space!.cameraHelper.moveTo(
        this.object3d.position.x,
        this.object3d.position.y
      )
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

      // TODO: check whether this should be set AFTER stepping the physics
      // simulation forward (the linvel is set but not used above yet)
      this.space!.eventHelper.setLocalPlayerPosition(
        this.entityId,
        this.object3d.position.x,
        this.object3d.position.y,
        this.object3d.position.z
      )
      this.space!.eventHelper.setLocalPlayerVelocity(xv, yv, 0)
      this.space!.cameraHelper.moveTo(
        this.object3d.position.x,
        this.object3d.position.y
      )
    } else {
      // remote player updates
      this.object3d.position.x += delta * this.velocity.x
      this.object3d.position.y += delta * this.velocity.y
      this.object3d.position.z += delta * this.velocity.z
    }
  }
}
