import * as THREE from 'three'
import { BaseFactory } from './BaseFactory'
import type { IndustrialObject } from '@/types/scene-dsl'

export class PlatformFactory extends BaseFactory {
  readonly type = 'platform'

  create(spec: IndustrialObject): THREE.Object3D {
    const {
      width = 10,
      depth = 4,
      height = 2.5,
      hasRailing = true,
    } = spec.params as {
      width?: number
      depth?: number
      height?: number
      hasRailing?: boolean
    }

    const group = new THREE.Group()

    // 平台面 - 格栅板
    const floorGeo = new THREE.BoxGeometry(width, 0.1, depth)
    const floor = new THREE.Mesh(floorGeo, new THREE.MeshStandardMaterial())
    floor.position.y = height
    floor.receiveShadow = true
    group.add(floor)

    // 平台面板纹理效果（多块板拼接）
    const panelCount = Math.ceil(width / 1.5)
    for (let i = 0; i < panelCount; i++) {
      const panelGeo = new THREE.BoxGeometry(1.4, 0.12, depth - 0.2)
      const panel = new THREE.Mesh(panelGeo, new THREE.MeshStandardMaterial({
        color: 0x666666,
        metalness: 0.9,
        roughness: 0.4,
      }))
      panel.position.y = height + 0.06
      panel.position.x = -width / 2 + 1.5 * i + 1
      panel.receiveShadow = true
      group.add(panel)
    }

    // 立柱
    const pillarGeo = new THREE.CylinderGeometry(0.15, 0.15, height, 16)
    const pillarPositions: [number, number][] = [
      [-width / 2 + 0.3, -depth / 2 + 0.3],
      [width / 2 - 0.3, -depth / 2 + 0.3],
      [-width / 2 + 0.3, depth / 2 - 0.3],
      [width / 2 - 0.3, depth / 2 - 0.3],
    ]

    for (const [px, pz] of pillarPositions) {
      const pillar = new THREE.Mesh(pillarGeo, new THREE.MeshStandardMaterial({
        color: 0x555555,
        metalness: 0.9,
        roughness: 0.3,
      }))
      pillar.position.set(px, height / 2, pz)
      pillar.castShadow = true
      pillar.receiveShadow = true
      group.add(pillar)
    }

    // 围栏
    if (hasRailing) {
      const railHeight = 1.1
      const railY = height + 0.05

      const railMaterial = new THREE.MeshStandardMaterial({
        color: 0x888888,
        metalness: 0.8,
        roughness: 0.3,
      })

      // 顶部横杆
      const railPoles: { pos: [number, number, number]; rot: [number, number, number]; len: number }[] = [
        { pos: [0, railY + railHeight, -depth / 2], rot: [0, 0, 0], len: width },
        { pos: [0, railY + railHeight, depth / 2], rot: [0, 0, 0], len: width },
        { pos: [-width / 2, railY + railHeight, 0], rot: [0, Math.PI / 2, 0], len: depth },
        { pos: [width / 2, railY + railHeight, 0], rot: [0, Math.PI / 2, 0], len: depth },
      ]

      for (const { pos, rot, len } of railPoles) {
        const railGeo = new THREE.CylinderGeometry(0.03, 0.03, len, 8)
        const rail = new THREE.Mesh(railGeo, railMaterial)
        rail.position.set(...pos)
        rail.rotation.set(...rot)
        group.add(rail)
      }

      // 竖杆
      const spacing = 1.5
      for (let side = 0; side < 4; side++) {
        const count = side < 2 ? Math.ceil(width / spacing) : Math.ceil(depth / spacing)
        for (let i = 0; i <= count; i++) {
          const t = i / count
          let sx: number, sz: number
          if (side === 0) { sx = -width / 2 + t * width; sz = -depth / 2 }
          else if (side === 1) { sx = -width / 2 + t * width; sz = depth / 2 }
          else if (side === 2) { sx = -width / 2; sz = -depth / 2 + t * depth }
          else { sx = width / 2; sz = -depth / 2 + t * depth }

          const vertGeo = new THREE.CylinderGeometry(0.02, 0.02, railHeight, 8)
          const vert = new THREE.Mesh(vertGeo, railMaterial)
          vert.position.set(sx, railY + railHeight / 2, sz)
          group.add(vert)
        }
      }
    }

    this.applyMaterial(floor, spec.material)
    this.setTransform(group, spec)
    return group
  }
}
