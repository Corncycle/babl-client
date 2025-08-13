import * as THREE from 'three'
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { materials } from './textureLoader.js'

const game = document.querySelector('.babl-container')!

const modelSpecs: {
  [name: string]: {
    path: string
    scale?: number | { x: number; y: number; z: number }
    rotation?: { x?: number; y?: number; z?: number }
    translation?: { x?: number; y?: number; z?: number }
    materialOverride?: string
  }
} = {
  ear: {
    path: 'models/ear.glb',
    scale: { x: 0.47, y: 0.47, z: 0.33 },
    materialOverride: 'skin',
  },
  hand: {
    path: 'models/hand.glb',
    scale: 0.07,
    materialOverride: 'skin',
  },
  nose: {
    path: 'models/nose.glb',
    scale: { x: 0.11, y: 0.08, z: 0.11 },
    materialOverride: 'skin',
    rotation: { x: -Math.PI / 2 },
    translation: { y: 1.2, z: -0.5 },
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

      if (modelSpecs[name].rotation) {
        const rot = modelSpecs[name].rotation
        if (rot.x) {
          scene.children[0].rotateX(rot.x)
        }
        if (rot.y) {
          scene.children[0].rotateY(rot.y)
        }
        if (rot.z) {
          scene.children[0].rotateZ(rot.z)
        }
      }

      if (modelSpecs[name].translation) {
        const trans = modelSpecs[name].translation
        if (trans.x) {
          scene.children[0].translateX(trans.x)
        }
        if (trans.y) {
          scene.children[0].translateY(trans.y)
        }
        if (trans.z) {
          scene.children[0].translateZ(trans.z)
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
