import * as THREE from 'three'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'

const game = document.querySelector('.babl-container')!

const texturePaths: {
  [group: string]: {
    diff: string
    disp?: string
    nor?: string
    rough?: string
    metal?: string
    spec?: string
    useEnvironmentMap?: boolean
    skipMakingMaterial?: boolean
  }
} = {
  rockWall: {
    // diff: 'textures/rock-wall-diff-4k.jpg',
    // disp: 'textures/rock-wall-disp-4k.jpg',
    // nor: 'textures/rock-wall-nor-4k.jpg',
    diff: 'textures/rock-wall-diff-256.jpg',
  },
  sand: {
    diff: 'textures/sand-2-diff-128.jpg',
    nor: 'textures/sand-2-nor-128.jpg',
    rough: 'textures/sand-2-rough-128.jpg',
  },
  gravel: {
    diff: 'textures/gravel-diff-128.jpg',
    nor: 'textures/gravel-nor-128.jpg',
    rough: 'textures/gravel-rough-128.jpg',
  },
  metal: {
    diff: 'textures/metal-2-diff-128.jpg',
    nor: 'textures/metal-2-nor-128.jpg',
    metal: 'textures/metal-2-metal-128.jpg',
    // spec: 'textures/metal-spec-128.jpg',
    useEnvironmentMap: true,
  },
  test32: {
    diff: 'textures/test-texture-diff-32.jpg',
  },
  test64: {
    diff: 'textures/test-texture-diff-64.jpg',
  },
  shadowMaterial: {
    diff: 'textures/test-texture-diff-32.jpg',
  },
  mcGrass: {
    diff: 'textures/mc-grass-diff-16.jpg',
  },
  mcDirt: {
    diff: 'textures/mc-dirt-diff-16.jpg',
  },
  mcSteve: {
    diff: 'textures/mc-steve-diff-8.jpg',
  },
  testParticle: {
    diff: 'textures/test-particle.png',
    skipMakingMaterial: true,
  },
  testParticleBlack: {
    diff: 'textures/test-particle-black.png',
    skipMakingMaterial: true,
  },
  smoke7: {
    diff: 'textures/smoke-07.png',
    skipMakingMaterial: true,
  },
  skin: {
    diff: 'textures/skin-diff-256.png',
  },
}

export const textures: { [key: string]: THREE.Texture } = {}
export let skyTexture: THREE.Texture

export const materials: { [key: string]: THREE.Material } = {}

const loadSkyTexture: () => Promise<THREE.Texture> = () => {
  return new Promise((res, rej) => {
    const hdrLoader = new RGBELoader()

    hdrLoader.load(
      'textures/sky2.hdr',
      (texture: THREE.Texture) => {
        texture.mapping = THREE.EquirectangularReflectionMapping
        res(texture)
      },
      undefined,
      (err) => rej(err)
    )
  })
}

const loadTexture: (
  loader: THREE.TextureLoader,
  url: string
) => Promise<THREE.Texture> = (loader: THREE.TextureLoader, url: string) => {
  return new Promise((res, rej) => {
    loader.load(
      url,
      (tex) => res(tex),
      undefined,
      (err) => rej(err)
    )
  })
}

export const loadTextureResources = async () => {
  skyTexture = await loadSkyTexture()

  const loader = new THREE.TextureLoader()

  for (const texGroupName in texturePaths) {
    const group = texturePaths[texGroupName]
    if (group.diff) {
      try {
        const tex = await loadTexture(loader, group.diff as string)
        tex.colorSpace = THREE.SRGBColorSpace
        tex.wrapS = THREE.RepeatWrapping
        tex.wrapT = THREE.RepeatWrapping

        if (texGroupName === 'mcSteve') {
          tex.repeat.set(2, 2)
        }

        tex.magFilter = THREE.NearestFilter

        textures[texGroupName] = tex

        let norTex
        if (group.nor) {
          norTex = await loadTexture(loader, group.nor)
          norTex.wrapS = THREE.RepeatWrapping
          norTex.wrapT = THREE.RepeatWrapping
        }
        let roughTex
        if (group.rough) {
          roughTex = await loadTexture(loader, group.rough)
          roughTex.wrapS = THREE.RepeatWrapping
          roughTex.wrapT = THREE.RepeatWrapping
        }
        let specTex
        if (group.spec) {
          specTex = await loadTexture(loader, group.spec)
          specTex.wrapS = THREE.RepeatWrapping
          specTex.wrapT = THREE.RepeatWrapping
        }
        let metalTex
        if (group.metal) {
          metalTex = await loadTexture(loader, group.metal)
          metalTex.wrapS = THREE.RepeatWrapping
          metalTex.wrapT = THREE.RepeatWrapping
        }

        if (!group.skipMakingMaterial) {
          const opts = { map: tex } as any
          if (group.nor) {
            opts.normalMap = norTex
          }
          if (group.rough) {
            opts.roughnessMap = roughTex
          }
          if (group.spec) {
            opts.metalnessMap = specTex
          }
          if (group.metal) {
            opts.metalnessMap = metalTex
          }
          if (group.useEnvironmentMap) {
            opts.envMap = skyTexture
            opts.envMapIntensity = 0.7
            opts.roughness = 0.05
            opts.metalness = 0.8
          }
          const mat = new THREE.MeshStandardMaterial(opts)
          mat.needsUpdate = true
          materials[texGroupName] = mat
        }
      } catch (e) {
        console.error(e)
        throw new Error(`failed to load ${texGroupName} texture`)
      }
    }
  }

  // shadow material is a special material that isn't displayed at all, but casts a shadow
  // use this if we want to cast a different shape than an object has for a shadow,
  // such as using a cheap circle shadow for players instead of casting a shadow
  // off of a potentially high face-count mesh
  materials.shadowMaterial.colorWrite = false
  materials.shadowMaterial.depthWrite = false
}
