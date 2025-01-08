import * as THREE from 'three'

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

export const solidExtrudedShapeFactory = (shape: THREE.Shape) => {
  const geo = new THREE.ExtrudeGeometry(shape, { bevelEnabled: false })
  const mesh = new THREE.Mesh(geo, normalMaterial)
  mesh.position.z = -0.5
  return mesh
}
