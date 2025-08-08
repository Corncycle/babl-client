import { randInt } from 'three/src/math/MathUtils.js'
import { ParticleSystem } from './particles.js'
import * as THREE from 'three'

export class BlueVialParticleSystem extends ParticleSystem {
  addParticles(source: { x: number; y: number; z: number }): void {
    const numSpikes = randInt(3, 4)
    const spikesAngles = []
    const spikesMagnitudes = []

    for (let i = 0; i < numSpikes; i++) {
      spikesAngles.push(Math.random() * 2 * Math.PI)
      spikesMagnitudes.push(Math.random() + 1)
    }

    for (let j = 0; j < numSpikes; j++) {
      for (let i = 0; i < 100; i++) {
        let color

        color = new THREE.Color(
          Math.random() * 0.2,
          Math.random() * 0.2,
          Math.random() * 0.8 + 0.2
        )

        const theta = Math.random() * 0.4 - 0.2 + spikesAngles[j]
        const v0 = Math.random() * spikesMagnitudes[j] + 1
        this.particles.push({
          position: new THREE.Vector3(source.x, source.y, source.z),
          rotation: Math.random() * 2 * Math.PI,
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
}
