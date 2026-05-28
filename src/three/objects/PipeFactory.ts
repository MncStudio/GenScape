import * as THREE from 'three'
import { BaseFactory } from './BaseFactory'
import type { IndustrialObject, Vec3 } from '@/types/scene-dsl'

export class PipeFactory extends BaseFactory {
  readonly type = 'pipe_segment'

  create(spec: IndustrialObject): THREE.Object3D {
    const { radius = 0.15, segments = 64, hasValve = false } = spec.params as {
      radius?: number
      segments?: number
      hasValve?: boolean
    }

    const path = (spec.params as any)['path'] as Vec3[] | undefined
    const group = new THREE.Group()

    if (!path || path.length < 2) {
      // 默认直线管道
      const len = 5
      const pipeGeo = new THREE.CylinderGeometry(radius, radius, len, segments)
      const pipe = new THREE.Mesh(pipeGeo, new THREE.MeshStandardMaterial())
      pipe.position.y = len / 2
      pipe.castShadow = true
      pipe.receiveShadow = true
      group.add(pipe)
    } else {
      const points = path.map(p => new THREE.Vector3(p.x, p.y, p.z))
      const curve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.5)
      const tubeGeo = new THREE.TubeGeometry(curve, segments * path.length, radius, 16, false)
      const tube = new THREE.Mesh(tubeGeo, new THREE.MeshStandardMaterial())
      tube.castShadow = true
      tube.receiveShadow = true
      group.add(tube)

      // 阀门节点
      if (hasValve && path.length >= 3) {
        const midIdx = Math.floor(path.length / 2)
        const midPoint = curve.getPoint(midIdx / path.length)
        const valveGeo = new THREE.CylinderGeometry(radius * 2, radius * 2, 0.4, 32)
        const valve = new THREE.Mesh(valveGeo, new THREE.MeshStandardMaterial({
          color: 0xcc4444,
          metalness: 0.6,
          roughness: 0.3,
        }))
        valve.position.copy(midPoint)
        group.add(valve)
      }
    }

    this.applyMaterial(
      (group.children[0] as THREE.Mesh) ?? new THREE.Mesh(),
      spec.material,
    )
    this.setTransform(group, spec)
    return group
  }
}
