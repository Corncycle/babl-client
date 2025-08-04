import { ParticleSystem } from './particles.js'
import * as THREE from 'three'

export class RedVialParticleSystem extends ParticleSystem {
  addParticles(source: { x: number; y: number; z: number }): void {
    for (let i = 0; i < 100; i++) {
      let color

      color = new THREE.Color(
        Math.random() * 0.8 + 0.2,
        Math.random() * 0.8 + 0.2,
        0.1
      )

      const theta = Math.random() * 2 * Math.PI
      const v0 = Math.random() * 2 + 1
      this.particles.push({
        position: new THREE.Vector3(source.x, source.y, source.z),
        velocity: new THREE.Vector3(
          Math.cos(theta) * v0,
          Math.sin(theta) * v0,
          0.5
        ),
        damping: 1.5,
        size: Math.random() * 1.5 + 0.5,
        color: color,
        alpha: 1,
        life: 3.0,
      })
    }
  }
}
