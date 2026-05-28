import { GenScapeScene } from '@/three/GenScapeScene'
import { useSceneStore } from '@/store/modules/scene.store'
import type { SceneDSL } from '@/types/scene-dsl'

let instance: GenScapeScene | null = null

export function useScene() {
  const store = useSceneStore()

  async function init(container: HTMLElement): Promise<GenScapeScene> {
    if (instance) {
      instance.destroy()
    }
    instance = new GenScapeScene()
    await instance.init(container)

    store.setBackend(instance.backend)

    instance.onRender(() => {
      // 可在此更新 FPS 等性能数据
    })

    return instance
  }

  function loadDSL(dsl: SceneDSL): void {
    if (!instance) {
      throw new Error('场景未初始化，请先调用 init()')
    }
    instance.loadDSL(dsl)
    store.setDSL(dsl)
  }

  function getInstance(): GenScapeScene | null {
    return instance
  }

  function resize(): void {
    instance?.resize()
  }

  function destroy(): void {
    instance?.destroy()
    instance = null
    store.reset()
  }

  return { init, loadDSL, getInstance, resize, destroy }
}
