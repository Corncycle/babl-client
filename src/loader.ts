import * as THREE from 'three'

const loader = document.querySelector('.loader-container')!
const game = document.querySelector('.babl-container')!

const textures = {
  rockWall: {
    diff: 'textures/rock-wall-diff-4k.jpg',
    disp: 'textures/rock-wall-disp-4k.jpg',
    nor: 'textures/rock-wall-nor-4k.jpg',
  },
}

export const loadResources = async () => {
  const textureLoader = new THREE.TextureLoader()
}
