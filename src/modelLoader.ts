import * as THREE from 'three'
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { materials } from './textureLoader.js'

const game = document.querySelector('.babl-container')!

const modelSpecs: {
  [name: string]: {
    path: string
    scale?: number | { x: number; y: number; z: number }
    materialOverride?: string
  }
} = {
  ear: {
    path: 'models/ear.glb',
    scale: { x: 0.5, y: 0.5, z: 0.35 },
    materialOverride: 'skin',
  },
  hand: {
    path: 'models/hand.glb',
    scale: 0.07,
    materialOverride: 'skin',
  },
}

export const models: { [key: string]: THREE.Object3D } = {}

const loadGLTF: (loader: GLTFLoader, url: string) => Promise<GLTF> = (
  loader: GLTFLoader,
  url: string
) => {
  return new Promise((res, rej) => {
    loader.load(
      url,
      (gltf) => res(gltf),
      undefined,
      (err) => rej(err)
    )
  })
}

export const loadModelResources = async () => {
  const loader = new GLTFLoader()

  for (const name in modelSpecs) {
    const path = modelSpecs[name].path
    try {
      const gltf = await loadGLTF(loader, path)
      const scene = gltf.scene

      if (modelSpecs[name].scale) {
        const scale = modelSpecs[name].scale
        if (typeof scale === 'number') {
          scene.scale.set(scale, scale, scale)
        } else {
          scene.scale.set(scale.x, scale.y, scale.z)
        }
      }

      if (modelSpecs[name].materialOverride) {
        const override = modelSpecs[name].materialOverride
        ;(scene.children[0] as THREE.Mesh).material = materials[override]
      }

      models[name] = scene
    } catch (e) {
      throw new Error(`failed to load ${name} model`)
    }
  }
}

/**
 * we want to override textures on some models, but models and textures are both loaded
 * asynchronously, and simulataneously. defer applying textures to these models until
 * textures are known to be loaded, then call this function
 */
export const applyOverrideTexturesToModels = () => {
  for (const name in modelSpecs) {
    if (modelSpecs[name].materialOverride) {
      const model = models[name]
      const override = modelSpecs[name].materialOverride
      ;(model.children[0] as THREE.Mesh).material = materials[override]
    }
  }
}
