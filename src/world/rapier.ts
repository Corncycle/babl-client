import rapier3d from '@dimforge/rapier3d-compat'

// in development, `rapier3d` is a local npm import that can be used immediately
// in prod, `rapier3d` is sourced from a cdn and consists of wasm code that is base 64
// encoded and embedded in the main JS file, and needs to be initialized before use

// ANY TIME RAPIER IS USED IN THIS PROJECT, IT SHOULD BE IMPORTED FROM THIS FILE
// (eg `import { RAPIER } from './world/rapier.js'`) INSTEAD OF FROM node_modules
// (eg `import RAPIER from '@dimforge/rapier3d'`) TO ADDRESS THIS DISCREPANCY
await (rapier3d as any).init()

export const rapier = rapier3d
