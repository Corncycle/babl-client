import { randInt } from 'three/src/math/MathUtils.js'
import { ParticleSystem } from './particles.js'
import * as THREE from 'three'

export class RedVialParticleSystem extends ParticleSystem {
  addParticles(source: { x: number; y: number; z: number }): void {
    const numSpikes = randInt(5, 7)
    const spikesAngles = []
    const spikesMagnitudes = []

    const offset = Math.random() * 2 * Math.PI
    const maxVariance = (2 * Math.PI) / (numSpikes * 2)
    for (let i = 0; i < numSpikes; i++) {
      // evenly distribute spikes around the circle, then give them slight variance
      let angle = ((2 * Math.PI) / numSpikes) * i
      const variance = Math.random() * maxVariance - maxVariance / 2
      spikesAngles.push(angle + variance + offset)
      spikesMagnitudes.push(Math.random() + 0.5 * Math.random() + 0.3)
    }

    for (let j = 0; j < numSpikes; j++) {
      for (let i = 0; i < 40; i++) {
        let color

        color = new THREE.Color(
          Math.random() * 0.8 + 0.2,
          Math.random() * 0.2,
          Math.random() * 0.2
        )

        const thetaVariance = Math.random() * 0.4 - 0.2
        const theta = thetaVariance + spikesAngles[j]

        // spikes close to the "true" angle of the spike should be boosted
        const dampenFactor = 1 - 3 * Math.abs(thetaVariance)

        const v0 = (Math.random() * spikesMagnitudes[j] + 1) * dampenFactor * 4
        this.particles.push({
          position: new THREE.Vector3(source.x, source.y, source.z),
          rotation: Math.random() * 2 * Math.PI,
          velocity: new THREE.Vector3(
            Math.cos(theta) * v0,
            Math.sin(theta) * v0,
            0.5
          ),
          damping: 4.5,
          size: Math.random() * 1.5 + 0.5,
          color: color,
          alpha: 1,
          life: 1.8,
        })
      }
    }
  }
}
