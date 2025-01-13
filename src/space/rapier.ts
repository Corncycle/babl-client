import RAPIER from '@dimforge/rapier3d-compat'

// rapier is a wasm module that needs to asynchronously initialized before we can
// use it. TODO: use this as an opportunity to create a loading screen where we
// await all external resources to be loaded before initializing (e.g. rapier wasm,
// asset files like meshes, textures, etc)

export const initializeRapier = async () => {
  await RAPIER.init()
}
