import * as THREE from 'three'

export const cubeGeometry = new THREE.BoxGeometry(1, 1, 1)
export const cubeEdgesGeometry = new THREE.EdgesGeometry(cubeGeometry)

export const lineMaterial = new THREE.LineBasicMaterial({
  color: 0xffffff,
  linewidth: 1,
})

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
