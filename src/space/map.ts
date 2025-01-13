import * as THREE from 'three'
import { Space } from './space.js'
import { solidCubeFactory, solidExtrudedShapeFactory } from '../canvas/util.js'
import RAPIER from '@dimforge/rapier3d-compat'

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
        space.scene.add(solidExtrudedShapeFactory(space.world, shape))
        break
      case 11:
        space.scene.add(solidCubeFactory(1, c.x, c.y, 0))
        break
    }
  }

  const groundColliderDesc = RAPIER.ColliderDesc.cuboid(10, 10, 0.5)
  groundColliderDesc.setTranslation(0, 0, -0.5)
  space.world.createCollider(groundColliderDesc)

  space.initialLoad = true
}
