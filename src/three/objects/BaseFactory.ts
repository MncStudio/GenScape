import * as THREE from 'three'
import type { IndustrialObject, PBRMaterial } from '@/types/scene-dsl'

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
