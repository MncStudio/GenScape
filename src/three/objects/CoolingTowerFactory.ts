import * as THREE from 'three'
import { BaseFactory } from './BaseFactory'
import type { IndustrialObject } from '@/types/scene-dsl'

export class CoolingTowerFactory extends BaseFactory {
  readonly type = 'cooling_tower'

  create(spec: IndustrialObject): THREE.Object3D {
    const { baseRadius = 3, topRadius = 1.5, height = 12 } = spec.params as {
      baseRadius?: number
      topRadius?: number
      height?: number
    }

    const group = new THREE.Group()

    // 双曲面塔体 - 用多层圆环逼近沙漏形状
    const segments = 12
    const radialSegments = 48
    const midRadius = Math.min(baseRadius, topRadius) * 0.7

    for (let i = 0; i < segments; i++) {
      const t0 = i / segments
      const t1 = (i + 1) / segments
      const y0 = t0 * height
      const y1 = t1 * height
      // 双曲面轮廓：中间窄，两端宽
      const midT = (t0 + t1) / 2
      const r = baseRadius + (topRadius - baseRadius) * midT
        + (midRadius - (baseRadius + topRadius) / 2) * Math.sin(midT * Math.PI) * 2
      const r0 = baseRadius + (topRadius - baseRadius) * t0
        + (midRadius - (baseRadius + topRadius) / 2) * Math.sin(t0 * Math.PI) * 2
      const r1 = baseRadius + (topRadius - baseRadius) * t1
        + (midRadius - (baseRadius + topRadius) / 2) * Math.sin(t1 * Math.PI) * 2

      const avgR = (r0 + r1) / 2
      const geo = new THREE.CylinderGeometry(avgR, avgR, height / segments, radialSegments, 1, true)
      const mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(spec.material.color),
        metalness: spec.material.metalness ?? 0.3,
        roughness: spec.material.roughness ?? 0.7,
        side: THREE.DoubleSide,
      })
      const ring = new THREE.Mesh(geo, mat)
      ring.position.y = (t0 + t1) * height / 2
      ring.castShadow = true
      ring.receiveShadow = true
      group.add(ring)
    }

    // 顶部边缘
    const topRingGeo = new THREE.TorusGeometry(topRadius, 0.12, 8, radialSegments)
    const topRing = new THREE.Mesh(topRingGeo, new THREE.MeshStandardMaterial({
      color: 0x666666,
      metalness: 0.8,
      roughness: 0.4,
    }))
    topRing.position.y = height
    topRing.rotation.x = Math.PI / 2
    group.add(topRing)

    // 底部边缘
    const baseRingGeo = new THREE.TorusGeometry(baseRadius, 0.15, 8, radialSegments)
    const baseRing = new THREE.Mesh(baseRingGeo, new THREE.MeshStandardMaterial({
      color: 0x666666,
      metalness: 0.8,
      roughness: 0.4,
    }))
    baseRing.rotation.x = Math.PI / 2
    baseRing.position.y = 0.05
    group.add(baseRing)

    // 底座支架
    const legGeo = new THREE.CylinderGeometry(0.15, 0.15, 1.5, 8)
    const legMat = new THREE.MeshStandardMaterial({
      color: 0x555555,
      metalness: 0.9,
      roughness: 0.3,
    })
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2
      const leg = new THREE.Mesh(legGeo, legMat)
      leg.position.set(
        Math.cos(angle) * baseRadius * 0.85,
        0.75,
        Math.sin(angle) * baseRadius * 0.85,
      )
      group.add(leg)
    }

    this.setTransform(group, spec)
    return group
  }
}
