import * as THREE from 'three'
import { BaseFactory } from './BaseFactory'
import type { IndustrialObject } from '@/types/scene-dsl'

export class BuildingFactory extends BaseFactory {
  readonly type = 'building'

  create(spec: IndustrialObject): THREE.Object3D {
    const { width = 8, depth = 6, height = 10, floors = 1 } = spec.params as {
      width?: number
      depth?: number
      height?: number
      floors?: number
    }

    const group = new THREE.Group()

    // 主体
    const bodyGeo = new THREE.BoxGeometry(width, height, depth)
    const body = new THREE.Mesh(bodyGeo, new THREE.MeshStandardMaterial())
    body.position.y = height / 2
    body.castShadow = true
    body.receiveShadow = true
    group.add(body)

    // 屋顶（微倾斜）
    const roofGeo = new THREE.ConeGeometry(Math.max(width, depth) * 0.75, height * 0.08, 4)
    const roofMat = new THREE.MeshStandardMaterial({
      color: 0x3a3a3a,
      metalness: 0.6,
      roughness: 0.5,
    })
    const roof = new THREE.Mesh(roofGeo, roofMat)
    roof.position.y = height + height * 0.04
    roof.rotation.y = Math.PI / 4
    roof.castShadow = true
    group.add(roof)

    // 楼层分割线
    const floorHeight = height / (floors || 1)
    for (let i = 1; i < (floors || 1); i++) {
      const lineGeo = new THREE.BoxGeometry(width + 0.1, 0.08, depth + 0.1)
      const line = new THREE.Mesh(lineGeo, new THREE.MeshStandardMaterial({
        color: 0x555555,
        metalness: 0.7,
        roughness: 0.4,
      }))
      line.position.y = i * floorHeight
      group.add(line)
    }

    // 窗户（每层一圈）
    const windowMat = new THREE.MeshStandardMaterial({
      color: 0x88ccff,
      emissive: 0x224466,
      emissiveIntensity: 0.3,
      metalness: 0.1,
      roughness: 0.2,
    })
    const windowGeo = new THREE.PlaneGeometry(width * 0.06, floorHeight * 0.18)

    for (let f = 0; f < (floors || 1); f++) {
      const floorY = f * floorHeight + floorHeight * 0.5
      // 前后两面各两个窗户
      for (let side = -1; side <= 1; side += 2) {
        const zOffset = side * (depth / 2 + 0.02)
        for (let w = -1; w <= 1; w += 2) {
          const win = new THREE.Mesh(windowGeo, windowMat)
          win.position.set(w * width * 0.2, floorY, zOffset)
          if (side === -1) win.rotation.y = Math.PI
          group.add(win)
        }
      }
    }

    // 门
    const doorGeo = new THREE.PlaneGeometry(width * 0.12, floorHeight * 0.45)
    const doorMat = new THREE.MeshStandardMaterial({
      color: 0x444444,
      metalness: 0.8,
      roughness: 0.3,
    })
    const door = new THREE.Mesh(doorGeo, doorMat)
    door.position.set(0, floorHeight * 0.22, depth / 2 + 0.02)
    group.add(door)

    this.applyMaterial(body, spec.material)
    this.setTransform(group, spec)
    return group
  }
}
