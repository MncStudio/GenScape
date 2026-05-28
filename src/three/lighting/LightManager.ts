import * as THREE from 'three'
import type { LightConfig } from '@/types/scene-dsl'

export class LightManager {
  private lights = new Map<string, THREE.Light>()
  private scene: THREE.Scene

  constructor(scene: THREE.Scene) {
    this.scene = scene
  }

  createLight(config: LightConfig): THREE.Light | null {
    let light: THREE.Light | null = null

    switch (config.type) {
      case 'ambient': {
        light = new THREE.AmbientLight(
          new THREE.Color(config.color),
          config.intensity,
        )
        break
      }

      case 'hemisphere': {
        light = new THREE.HemisphereLight(
          new THREE.Color(config.color),
          new THREE.Color((config as any).groundColor ?? '#1a1a1a'),
          config.intensity,
        )
        break
      }

      case 'directional': {
        const dl = new THREE.DirectionalLight(
          new THREE.Color(config.color),
          config.intensity,
        )
        if (config.position) {
          dl.position.set(config.position.x, config.position.y, config.position.z)
        }
        if (config.castShadow) {
          dl.castShadow = true
          const size = config.shadowMapSize ?? 2048
          dl.shadow.mapSize.width = size
          dl.shadow.mapSize.height = size
          dl.shadow.camera.near = 0.5
          dl.shadow.camera.far = 100
          dl.shadow.bias = -0.0001
        }
        light = dl
        break
      }

      case 'point': {
        const pl = new THREE.PointLight(
          new THREE.Color(config.color),
          config.intensity,
          config.distance ?? 15,
          config.decay ?? 2,
        )
        if (config.position) {
          pl.position.set(config.position.x, config.position.y, config.position.z)
        }
        if (config.castShadow) {
          pl.castShadow = true
          const size = config.shadowMapSize ?? 1024
          pl.shadow.mapSize.width = size
          pl.shadow.mapSize.height = size
          pl.shadow.bias = -0.0005
        }
        light = pl
        break
      }

      case 'spot': {
        const sl = new THREE.SpotLight(
          new THREE.Color(config.color),
          config.intensity,
          config.distance ?? 20,
          config.angle ?? Math.PI / 6,
          config.penumbra ?? 0.3,
          config.decay ?? 2,
        )
        if (config.position) {
          sl.position.set(config.position.x, config.position.y, config.position.z)
        }
        if (config.target && config.position) {
          sl.target.position.set(
            config.target.x,
            config.target.y,
            config.target.z,
          )
        }
        if (config.castShadow) {
          sl.castShadow = true
          const size = config.shadowMapSize ?? 1024
          sl.shadow.mapSize.width = size
          sl.shadow.mapSize.height = size
          sl.shadow.bias = -0.0003
        }
        light = sl
        break
      }

      case 'rect': {
        const rl = new THREE.RectAreaLight(
          new THREE.Color(config.color),
          config.intensity,
          2,
          2,
        )
        if (config.position) {
          rl.position.set(config.position.x, config.position.y, config.position.z)
        }
        light = rl
        break
      }
    }

    if (light) {
      light.name = config.id
      this.lights.set(config.id, light)
      this.scene.add(light)
    }

    return light
  }

  createLights(configs: LightConfig[]): void {
    for (const config of configs) {
      this.createLight(config)
    }
  }

  removeLight(id: string): void {
    const light = this.lights.get(id)
    if (light) {
      this.scene.remove(light)
      this.lights.delete(id)
    }
  }

  clear(): void {
    for (const light of this.lights.values()) {
      this.scene.remove(light)
    }
    this.lights.clear()
  }

  getLight(id: string): THREE.Light | undefined {
    return this.lights.get(id)
  }
}
