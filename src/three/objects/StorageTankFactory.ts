import * as THREE from 'three'
import { BaseFactory } from './BaseFactory'
import type { IndustrialObject } from '@/types/scene-dsl'

export class StorageTankFactory extends BaseFactory {
  readonly type = 'storage_tank'

  create(spec: IndustrialObject): THREE.Object3D {
    const { radius = 2.0, height = 8.0, roofType = 'dome' } = spec.params as {
      radius?: number
      height?: number
      roofType?: string
    }

    const group = new THREE.Group()

    // 罐体
    const bodyGeo = new THREE.CylinderGeometry(radius, radius, height, 64, 1, false)
    const body = new THREE.Mesh(bodyGeo, new THREE.MeshStandardMaterial())
    body.position.y = height / 2
    body.castShadow = true
    body.receiveShadow = true
    group.add(body)

    if (roofType === 'dome') {
      const domeGeo = new THREE.SphereGeometry(radius * 1.01, 64, 32, 0, Math.PI * 2, 0, Math.PI / 3)
      const dome = new THREE.Mesh(domeGeo, new THREE.MeshStandardMaterial())
      dome.position.y = height + 0.05
      dome.castShadow = true
      group.add(dome)
    }

    // 底座
    const baseGeo = new THREE.CylinderGeometry(radius + 0.3, radius + 0.4, 0.4, 64)
    const base = new THREE.Mesh(baseGeo, new THREE.MeshStandardMaterial({
      color: 0x444444,
      metalness: 0.9,
      roughness: 0.4,
    }))
    base.position.y = 0.2
    base.castShadow = true
    base.receiveShadow = true
    group.add(base)

    // 液位指示环
    const ringGeo = new THREE.TorusGeometry(radius + 0.05, 0.05, 16, 64)
    const ring = new THREE.Mesh(ringGeo, new THREE.MeshStandardMaterial({
      color: 0x00d4ff,
      emissive: 0x00d4ff,
      emissiveIntensity: 0.5,
      metalness: 0.3,
      roughness: 0.2,
    }))
    ring.position.y = height * 0.6
    ring.rotation.x = Math.PI / 2
    group.add(ring)

    // 顶部法兰
    const flangeGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 32)
    const flange = new THREE.Mesh(flangeGeo, new THREE.MeshStandardMaterial({
      color: 0x888888,
      metalness: 0.8,
      roughness: 0.3,
    }))
    flange.position.y = height + (roofType === 'dome' ? 0.1 : 0)
    group.add(flange)

    this.applyMaterial(body, spec.material)
    if (roofType === 'dome') {
      const dome = group.children[1] as THREE.Mesh
      this.applyMaterial(dome, spec.material)
    }

    this.setTransform(group, spec)
    return group
  }
}
