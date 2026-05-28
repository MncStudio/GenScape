import * as THREE from 'three'
import type { IndustrialObject, PBRMaterial } from '@/types/scene-dsl'

const MAT_SIDE_MAP: Record<number, THREE.Side> = {
  0: THREE.FrontSide,
  1: THREE.BackSide,
  2: THREE.DoubleSide,
}

export abstract class BaseFactory {
  abstract readonly type: string

  abstract create(spec: IndustrialObject): THREE.Object3D

  protected applyMaterial(
    mesh: THREE.Mesh,
    matDef: PBRMaterial,
  ): void {
    mesh.material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(matDef.color),
      metalness: matDef.metalness ?? 0.5,
      roughness: matDef.roughness ?? 0.5,
      emissive: matDef.emissive ? new THREE.Color(matDef.emissive) : undefined,
      emissiveIntensity: matDef.emissiveIntensity ?? 0,
      transparent: matDef.transparent ?? false,
      opacity: matDef.opacity ?? 1,
      wireframe: matDef.wireframe ?? false,
      side: matDef.side !== undefined ? MAT_SIDE_MAP[matDef.side] : THREE.DoubleSide,
    })
  }

  protected setTransform(
    obj: THREE.Object3D,
    spec: IndustrialObject,
  ): void {
    obj.position.set(
      spec.position.x,
      spec.position.y,
      spec.position.z,
    )
    obj.rotation.set(
      spec.rotation.x,
      spec.rotation.y,
      spec.rotation.z,
    )
    if (spec.scale) {
      obj.scale.set(spec.scale.x, spec.scale.y, spec.scale.z)
    }
    obj.name = spec.id
    obj.userData = { id: spec.id, type: spec.type, meta: spec.metadata }
  }
}
