import * as THREE from 'three'
import particleFrag from '../shaders/particle.frag?raw'
import particleVert from '../shaders/particle.vert?raw'
import { textures } from '../../textureLoader.js'
import { Space } from '../space.js'

export interface Particle {
  position: THREE.Vector3
  velocity: THREE.Vector3
  damping: number
  size: number
  color: THREE.Color
  alpha: number
  life: number
}

// make sure this is kept in sync with the same enum in babl-server
export enum ParticleSystemType {
  VIAL_OF_RED_BREW = 'redbrew',
  VIAL_OF_BLUE_BREW = 'bluebrew',
}

// make sure this is kept in sync with the same enum in babl-server
export interface ParticleEvent {
  type: ParticleSystemType
  x: number
  y: number
  z: number
}

// thanks to SimonDev for the basic particle system, as shown in
// https://www.youtube.com/watch?v=OFqENgtqRAY

// extend this class and implement `addParticles` (and potentially `updateParticles`) to use
export class ParticleSystem {
  material: THREE.ShaderMaterial
  geometry: THREE.BufferGeometry
  particles: Particle[]
  points: THREE.Points
  concluded: boolean

  constructor(space: Space, x: number = 0, y: number = 0, z: number = 0) {
    const uniforms = {
      diffuseTexture: {
        value: textures.testParticle,
      },
      pointMultiplier: {
        value: 300,
      },
    }

    this.material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: particleVert,
      fragmentShader: particleFrag,
      blending: THREE.AdditiveBlending,
      depthTest: true,
      depthWrite: false,
      transparent: true,
      vertexColors: true,
    })

    this.geometry = new THREE.BufferGeometry()
    this.geometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute([], 3)
    )

    this.particles = []

    this.points = new THREE.Points(this.geometry, this.material)

    space.scene.add(this.points)

    this.addParticles({ x, y, z })
    this.updateGeometry()

    this.concluded = false
  }

  addParticles(source: { x: number; y: number; z: number }) {
    console.error(
      'ParticleSystem directly instantiated. extend this class and use subclasses instead'
    )
  }

  updateParticles(delta: number) {
    for (let p of this.particles) {
      p.life -= delta
    }

    this.particles = this.particles.filter((p) => p.life > 0)

    for (let p of this.particles) {
      p.position.add(p.velocity.clone().multiplyScalar(delta))
      let proportion = p.damping * delta
      if (proportion < 0) {
        proportion = 0
      }
      if (proportion > 1) {
        proportion = 1
      }
      p.velocity = p.velocity.multiplyScalar(1 - proportion)

      p.alpha = p.life
    }
  }

  // update the state of the buffer geometry with what is currently stored in this.particles
  updateGeometry() {
    const positions = []
    const sizes = []
    const colors = []

    for (let p of this.particles) {
      positions.push(p.position.x, p.position.y, p.position.z)
      sizes.push(p.size)
      colors.push(p.color.r, p.color.g, p.color.b, p.alpha)
    }

    this.geometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(positions, 3)
    )
    this.geometry.setAttribute(
      'size',
      new THREE.Float32BufferAttribute(sizes, 1)
    )
    this.geometry.setAttribute(
      'color',
      new THREE.Float32BufferAttribute(colors, 4)
    )

    this.geometry.attributes.position.needsUpdate = true
    this.geometry.attributes.size.needsUpdate = true
    this.geometry.attributes.color.needsUpdate = true
  }

  process(delta: number) {
    this.updateParticles(delta)
    this.updateGeometry()
  }

  // TODO: cleanup (and cleanup from inside space as well)
}
