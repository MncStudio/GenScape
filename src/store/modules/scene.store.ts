import { defineStore } from 'pinia'
import type { SceneDSL, SceneGraphNode, IndustrialObject, LightConfig } from '@/types/scene-dsl'

export type SceneStatus = 'idle' | 'generating' | 'ready' | 'error'

export const useSceneStore = defineStore('scene', () => {
  const status = ref<SceneStatus>('idle')
  const currentDSL = ref<SceneDSL | null>(null)
  const sceneGraph = ref<SceneGraphNode[]>([])
  const objectCount = ref(0)
  const vertexCount = ref(0)
  const fps = ref(0)
  const backend = ref<'webgpu' | 'webgl' | ''>('')
  const selectedObjectId = ref<string | null>(null)
  const selectedLightId = ref<string | null>(null)

  function setStatus(s: SceneStatus) {
    status.value = s
  }

  function setDSL(dsl: SceneDSL) {
    currentDSL.value = dsl
    objectCount.value = dsl.objects.length
    buildSceneGraph(dsl)
    status.value = 'ready'
  }

  function buildSceneGraph(dsl: SceneDSL) {
    sceneGraph.value = dsl.objects.map(obj => ({
      id: obj.id,
      name: obj.label?.text ?? obj.id,
      type: obj.type,
      children: [],
      visible: true,
      locked: false,
    }))
  }

  function selectObject(id: string | null) {
    selectedObjectId.value = id
    selectedLightId.value = null
  }

  function selectLight(id: string | null) {
    selectedLightId.value = id
    selectedObjectId.value = null
  }

  function updateObjectInDSL(id: string, updated: IndustrialObject) {
    if (!currentDSL.value) return
    const idx = currentDSL.value.objects.findIndex(o => o.id === id)
    if (idx >= 0) {
      currentDSL.value.objects[idx] = updated
      buildSceneGraph(currentDSL.value)
    }
  }

  function updateLightInDSL(id: string, updated: LightConfig) {
    if (!currentDSL.value) return
    const idx = currentDSL.value.lights.findIndex(l => l.id === id)
    if (idx >= 0) {
      currentDSL.value.lights[idx] = updated
    }
  }

  function setFPS(f: number) {
    fps.value = f
  }

  function setBackend(b: 'webgpu' | 'webgl') {
    backend.value = b
  }

  function setVertexCount(n: number) {
    vertexCount.value = n
  }

  function reset() {
    status.value = 'idle'
    currentDSL.value = null
    sceneGraph.value = []
    objectCount.value = 0
    vertexCount.value = 0
    selectedObjectId.value = null
    selectedLightId.value = null
  }

  const selectedObject = computed(() => {
    if (!currentDSL.value || !selectedObjectId.value) return null
    return currentDSL.value.objects.find(o => o.id === selectedObjectId.value) ?? null
  })

  const selectedLight = computed(() => {
    if (!currentDSL.value || !selectedLightId.value) return null
    return currentDSL.value.lights.find(l => l.id === selectedLightId.value) ?? null
  })

  return {
    status, currentDSL, sceneGraph, objectCount, vertexCount, fps, backend,
    selectedObjectId, selectedLightId, selectedObject, selectedLight,
    setStatus, setDSL, setFPS, setBackend, setVertexCount, reset,
    selectObject, selectLight, updateObjectInDSL, updateLightInDSL,
  }
})
