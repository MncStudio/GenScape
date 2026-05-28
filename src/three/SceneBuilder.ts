import * as THREE from 'three'
import type { SceneDSL } from '@/types/scene-dsl'
import { createObject } from './objects'
import { LightManager } from './lighting/LightManager'
import { ParticleManager } from './particles/ParticleSystem'

export class SceneBuilder {
  private scene: THREE.Scene
  private lightManager: LightManager
  private particleManager: ParticleManager
  private objectMap = new Map<string, THREE.Object3D>()

  constructor(scene: THREE.Scene) {
    this.scene = scene
    this.lightManager = new LightManager(scene)
    this.particleManager = new ParticleManager()
  }

  build(dsl: SceneDSL): void {
    this.clear()

    // 1. 场景环境
    this.buildEnvironment(dsl)

    // 2. 灯光
    if (dsl.lights?.length) {
      this.lightManager.createLights(dsl.lights)
    }

    // 3. 物体
    if (dsl.objects?.length) {
      for (const objSpec of dsl.objects) {
        const obj = createObject(objSpec)
        if (obj) {
          this.scene.add(obj)
          this.objectMap.set(objSpec.id, obj)
        }
      }
    }

    // 4. 粒子
    if (dsl.particles?.length) {
      for (const pcfg of dsl.particles) {
        // 如果关联了管道，将路径注入
        if (pcfg.emitterType === 'pipe_flow' && pcfg.pathId) {
          const pathObj = this.objectMap.get(pcfg.pathId)
          if (pathObj) {
            ;(pcfg as any)._path = this.extractPathFromObject(pathObj)
          }
        }
        const emitter = this.particleManager.createEmitter(pcfg, this.objectMap)
        if (emitter) {
          this.scene.add(emitter.points)
        }
      }
    }

    // 5. 地面
    this.buildGround(dsl)
  }

  private buildEnvironment(dsl: SceneDSL): void {
    const { scene: sceneCfg } = dsl

    if (sceneCfg.background) {
      if (sceneCfg.background.type === 'color') {
        this.scene.background = new THREE.Color(sceneCfg.background.value)
      }
    }

    if (sceneCfg.fog) {
      if (sceneCfg.fog.type === 'exp2') {
        this.scene.fog = new THREE.FogExp2(
          new THREE.Color(sceneCfg.fog.color),
          sceneCfg.fog.density ?? 0.00015,
        )
      } else if (sceneCfg.fog.type === 'linear') {
        this.scene.fog = new THREE.Fog(
          new THREE.Color(sceneCfg.fog.color),
          sceneCfg.fog.near ?? 10,
          sceneCfg.fog.far ?? 200,
        )
      }
    }
  }

  private buildGround(dsl: SceneDSL): void {
    const ground = dsl.scene.ground
    if (!ground) return

    if (ground.type === 'plane') {
      const geo = new THREE.PlaneGeometry(ground.size, ground.size)
      const mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(ground.color),
        metalness: 0.3,
        roughness: 0.8,
      })
      const mesh = new THREE.Mesh(geo, mat)
      mesh.rotation.x = -Math.PI / 2
      mesh.position.y = -0.01
      mesh.receiveShadow = true
      mesh.name = 'ground'
      this.scene.add(mesh)
      this.objectMap.set('ground', mesh)
    }

    if (ground.type === 'grid') {
      const grid = new THREE.GridHelper(ground.size, Math.floor(ground.size / 2), ground.color, '#222222')
      grid.name = 'grid'
      this.scene.add(grid)
      this.objectMap.set('grid', grid)
    }
  }

  getObject(id: string): THREE.Object3D | undefined {
    return this.objectMap.get(id)
  }

  getObjectMap(): Map<string, THREE.Object3D> {
    return this.objectMap
  }

  getParticleManager(): ParticleManager {
    return this.particleManager
  }

  private extractPathFromObject(obj: THREE.Object3D): { x: number; y: number; z: number }[] {
    const positions: { x: number; y: number; z: number }[] = []

    // 从 pipe 子 mesh 中提取 TubeGeometry 路径
    obj.traverse(child => {
      if (child instanceof THREE.Mesh && (child.geometry as any).parameters?.path) {
        const path = (child.geometry as any).parameters.path as any
        if (path && typeof path.getPoint === 'function') {
          for (let t = 0; t <= 1; t += 0.05) {
            const pt = path.getPointAt(t)
            positions.push({ x: pt.x, y: pt.y, z: pt.z })
          }
        }
      }
    })

    if (positions.length >= 2) return positions

    // 回退：用 object 的 children 位置推算
    obj.traverse(child => {
      if (child instanceof THREE.Mesh && child.position.length() > 0.01) {
        positions.push({ x: child.position.x, y: child.position.y, z: child.position.z })
      }
    })

    return positions.length >= 2 ? positions : [
      { x: -5, y: 0.5, z: 0 },
      { x: 5, y: 0.5, z: 0 },
    ]
  }

  clear(): void {
    this.lightManager.clear()
    this.particleManager.clear()
    for (const obj of this.objectMap.values()) {
      this.scene.remove(obj)
      if (obj instanceof THREE.Group) {
        obj.traverse(child => {
          if (child instanceof THREE.Mesh) {
            child.geometry?.dispose()
            if (Array.isArray(child.material)) {
              child.material.forEach(m => m.dispose())
            } else {
              child.material?.dispose()
            }
          }
        })
      }
    }
    this.objectMap.clear()
  }
}
