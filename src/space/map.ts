import * as THREE from 'three'
import { Space } from './space.js'
import { solidCubeFactory, solidExtrudedShapeFactory } from '../canvas/util.js'
import RAPIER from '@dimforge/rapier3d-compat'
import { materials, textures } from '../textureLoader.js'

export const handleMapLoad = (space: Space, mapData: any) => {
  if (space.initialLoad) {
    location.reload()
  }
  for (const c of mapData.objects) {
    switch (c.type) {
      case 1:
        const pts = []
        for (let i = 0; i < c.points.length; i += 2) {
          pts.push(new THREE.Vector2(c.points[i], c.points[i + 1]))
        }
        const shape = new THREE.Shape(pts)
        space.scene.add(
          solidExtrudedShapeFactory(
            space.world,
            shape,
            new THREE.Vector2(c.x, c.y),
            c.min,
            c.max
          )
        )
        break
      case 11:
        space.scene.add(solidCubeFactory(1, c.x, c.y, 0))
        break
    }
  }

  const groundColliderDesc = RAPIER.ColliderDesc.cuboid(10, 10, 0.5)
  groundColliderDesc.setTranslation(0, 0, -0.5)
  space.world.createCollider(groundColliderDesc)

  const groundGeometry = new THREE.PlaneGeometry(1, 1)
  const cloneTex = textures.mcGrass.clone()
  cloneTex.repeat.set(20, 20)
  const stretchedMat = new THREE.MeshLambertMaterial({ map: cloneTex })

  groundGeometry.scale(20, 20, 1)
  const groundMesh = new THREE.Mesh(groundGeometry, stretchedMat)
  groundMesh.receiveShadow = true
  space.scene.add(groundMesh)

  space.initialLoad = true
}
