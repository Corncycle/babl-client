import * as THREE from 'three'

const game = document.querySelector('.babl-container')!

const texturePaths: { [group: string]: { [type: string]: string | boolean } } =
  {
    rockWall: {
      // diff: 'textures/rock-wall-diff-4k.jpg',
      // disp: 'textures/rock-wall-disp-4k.jpg',
      // nor: 'textures/rock-wall-nor-4k.jpg',
      diff: 'textures/rock-wall-diff-256.jpg',
    },
    test32: {
      diff: 'textures/test-texture-diff-32.jpg',
    },
    test64: {
      diff: 'textures/test-texture-diff-64.jpg',
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
      diff: 'textures/test-particle-black.png',
      skipMakingMaterial: true,
    },
  }

export const textures: { [key: string]: THREE.Texture } = {}

export const materials: { [key: string]: THREE.Material } = {}

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

export const loadResources = async () => {
  const loader = new THREE.TextureLoader()

  for (const texGroupName in texturePaths) {
    const group = texturePaths[texGroupName]
    if (group.diff) {
      try {
        const tex = await loadTexture(loader, group.diff as string)
        tex.wrapS = THREE.RepeatWrapping
        tex.wrapT = THREE.RepeatWrapping

        if (texGroupName === 'mcSteve') {
          tex.repeat.set(2, 2)
        }

        tex.magFilter = THREE.NearestFilter

        textures[texGroupName] = tex

        if (!group.skipMakingMaterial) {
          const mat = new THREE.MeshLambertMaterial({ map: tex })
          materials[texGroupName] = mat
        }
      } catch (e) {
        throw new Error(`failed to load ${texGroupName} texture`)
      }
    }
  }
}
