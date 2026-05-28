import * as THREE from 'three'
import type { ObjectType, IndustrialObject } from '@/types/scene-dsl'
import { BaseFactory } from './BaseFactory'
import { StorageTankFactory } from './StorageTankFactory'
import { PipeFactory } from './PipeFactory'
import { PlatformFactory } from './PlatformFactory'
import { BuildingFactory } from './BuildingFactory'
import { CoolingTowerFactory } from './CoolingTowerFactory'

const registry = new Map<ObjectType, BaseFactory>()

export function registerFactory(factory: BaseFactory): void {
  registry.set(factory.type as ObjectType, factory)
}

export function getFactory(type: ObjectType): BaseFactory | undefined {
  return registry.get(type)
}

export function createObject(spec: IndustrialObject): THREE.Object3D | null {
  const factory = getFactory(spec.type)
  if (!factory) {
    console.warn(`[GenScape] 未注册的物体类型: ${spec.type}`)
    return null
  }
  return factory.create(spec)
}

// 注册内置工厂
registerFactory(new StorageTankFactory())
registerFactory(new PipeFactory())
registerFactory(new PlatformFactory())
registerFactory(new BuildingFactory())
registerFactory(new CoolingTowerFactory())
