import * as THREE from 'three'
import { IEntity } from './entity.js'
import RAPIER from '@dimforge/rapier3d-compat'
import { Socket } from 'socket.io-client'
import { Space } from '../space.js'
import { SyncedObjectOptions } from './syncedEntity.js'
import { TextHelper } from '../text/text.js'
import { materials } from '../../textureLoader.js'
import { models } from '../../modelLoader.js'
import { lerp } from 'three/src/math/MathUtils.js'

export const getModelFromName = (name: string) => {
  const firstLetter = name[0].toLowerCase()
  if (firstLetter <= 'm') {
    return PlayerModel.EAR
  } else {
    return PlayerModel.HAND
  }
}

export enum PlayerModel {
  EAR,
  HAND,
  SPHERE,
}

export class Player implements IEntity {
  static geometry = new THREE.SphereGeometry(0.5, 16, 8)
  static shadowGeometry = new THREE.CircleGeometry(0.45, 16).rotateX(Math.PI)
  static up = new THREE.Vector3(0, 0, 1)

  playerSpeed: number = 1.6

  name: string
  entityId: number

  object3d: THREE.Object3D
  mesh: THREE.Object3D
  // shadowMesh is a plane that should be cheaper to project shadows from
  // than a potentially high face-count model
  shadowMesh: THREE.Object3D

  rigidBody?: RAPIER.RigidBody
  velocity: THREE.Vector3
  facingDirection: THREE.Vector2

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
    model: PlayerModel,
    entityId: number,
    position: THREE.Vector3,
    textHelper: TextHelper,
    socket?: Socket,
    space?: Space
  ) {
    this.name = name
    this.entityId = entityId
    this.object3d = new THREE.Object3D()

    switch (model) {
      case PlayerModel.EAR:
        this.mesh = models.ear.clone()
        break
      case PlayerModel.HAND:
        this.mesh = models.hand.clone()
        break
      case PlayerModel.SPHERE:
        this.mesh = new THREE.Mesh(Player.geometry, materials.mcSteve)
        break
    }
    this.shadowMesh = new THREE.Mesh(
      Player.shadowGeometry,
      materials.shadowMaterial
    )
    this.shadowMesh.position.set(0, 0, -0.46)
    this.shadowMesh.castShadow = true

    // TODO: fix this so we don't have to track children
    this.mesh.children[0].receiveShadow = true

    this.object3d.add(this.mesh)
    this.object3d.add(this.shadowMesh)
    this.object3d.position.copy(position)

    this.velocity = new THREE.Vector3()
    this.facingDirection = new THREE.Vector2(0, 1)

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
        { x: position.x, y: position.y, z: position.z },
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

    this.lerpFacingDirectionTowardsVelocity(delta)
    this.rotateTowardsFacingDirection(delta)
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

  /**
   * using the currently stored velocity, if at least one of the x or y components is
   * nonzero, lerp the facing direction towards the velocity
   */
  lerpFacingDirectionTowardsVelocity(delta: number) {
    if (this.velocity.x !== 0 || this.velocity.y !== 0) {
      const normalized = this.velocity.clone().normalize()
      this.facingDirection.lerp(
        this.velocity,
        Math.min(10 * this.playerSpeed * delta, 1)
      )
      // this.facingDirection.set(this.velocity.x, this.velocity.y).normalize()
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

  rotateTowardsFacingDirection(delta: number) {
    if (this.facingDirection.x === 0 && this.facingDirection.y === 0) {
      return
    }

    let theta =
      Math.atan2(this.facingDirection.y, this.facingDirection.x) - Math.PI / 2
    if (theta < -Math.PI) {
      theta += 2 * Math.PI
    }

    // take the shortest path to rotate to the pointed direction
    // (if we didn't have this, we would also take "the long way around" from an angle slightly
    // less than pi to one slightly above -pi)
    if (Math.abs(this.mesh.rotation.z - theta) > Math.PI) {
      if (this.mesh.rotation.z < 0) {
        this.mesh.rotation.z += 2 * Math.PI
      } else {
        this.mesh.rotation.z -= 2 * Math.PI
      }
    }

    if (Math.abs(this.mesh.rotation.z - theta) < 0.001) {
      this.mesh.rotation.z = theta
    } else {
      this.mesh.rotation.z = lerp(
        this.mesh.rotation.z,
        theta,
        Math.min(10 * delta, 1)
      )
    }
    // this.mesh.rotation.z = theta
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
        xv -= this.playerSpeed
      }
      if (this.pressed!.right) {
        xv += this.playerSpeed
      }
      if (this.pressed!.up) {
        yv += this.playerSpeed
      }
      if (this.pressed!.down) {
        yv -= this.playerSpeed
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
