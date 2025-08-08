import * as THREE from 'three'
import RAPIER, { World } from '@dimforge/rapier3d-compat'
import { materials } from '../textureLoader.js'

export const cubeGeometry = new THREE.BoxGeometry(1, 1, 1)
export const cubeEdgesGeometry = new THREE.EdgesGeometry(cubeGeometry)

export const lineMaterial = new THREE.LineBasicMaterial({
  color: 0xffffff,
  linewidth: 1,
})

export const normalMaterial = new THREE.MeshNormalMaterial()

export const cubeFactory = (
  scale: number = 1,
  x: number = 0,
  y: number = 0,
  z: number = 0
) => {
  const mesh = new THREE.LineSegments(cubeEdgesGeometry, lineMaterial)
  mesh.position.set(x, y, z)
  mesh.scale.set(scale, scale, scale)
  return mesh
}

export const solidCubeFactory = (
  scale: number = 1,
  x: number = 0,
  y: number = 0,
  z: number = 0
) => {
  const mesh = new THREE.Mesh(cubeGeometry, normalMaterial)
  mesh.position.set(x, y, z)
  mesh.scale.set(scale, scale, scale)
  return mesh
}

export const solidExtrudedShapeFactory = (
  world: World,
  shape: THREE.Shape,
  centroid: THREE.Vector2,
  min: number = 0,
  max: number = 1,
  top: string,
  side: string
) => {
  const geo = new THREE.ExtrudeGeometry(shape, {
    bevelEnabled: false,
    depth: max - min,
  })
  geo.translate(0, 0, min)
  const verts = geo.attributes.position.array as Float32Array
  const myInd = new Uint32Array(
    [...Array(verts.length / 3).keys()].map((i) => i)
  )

  const myColliderDesc = RAPIER.ColliderDesc.trimesh(verts, myInd)
  myColliderDesc.setTranslation(centroid.x, centroid.y, 0)
  world.createCollider(myColliderDesc)

  const mesh = new THREE.Mesh(geo, [
    materials[top] || materials.rockWall,
    materials[side] || materials.rockWall,
  ])
  mesh.position.set(centroid.x, centroid.y, mesh.position.z)

  mesh.castShadow = true
  mesh.receiveShadow = true

  return mesh
}
