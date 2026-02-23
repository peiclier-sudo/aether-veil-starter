import { ArcRotateCamera, Color4, Engine, HemisphericLight, MeshBuilder, Scene, Vector3 } from '@babylonjs/core'

export function createHeroScene(canvas: HTMLCanvasElement, onReady: () => void) {
  const engine = new Engine(canvas, true)
  const scene = new Scene(engine)
  scene.clearColor = new Color4(0.03, 0.05, 0.09, 1)

  const camera = new ArcRotateCamera('camera', Math.PI / 2, Math.PI / 2.5, 6, Vector3.Zero(), scene)
  camera.attachControl(canvas, true)
  camera.wheelDeltaPercentage = 0.02

  const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene)
  light.intensity = 0.95

  const placeholder = MeshBuilder.CreateBox('hero-slot', { size: 1.8 }, scene)
  placeholder.position.y = 0.9

  const ground = MeshBuilder.CreateGround('ground', { width: 10, height: 10 }, scene)
  ground.position.y = 0

  onReady()

  const resize = () => engine.resize()
  window.addEventListener('resize', resize)

  engine.runRenderLoop(() => {
    placeholder.rotation.y += 0.004
    scene.render()
  })

  return () => {
    window.removeEventListener('resize', resize)
    scene.dispose()
    engine.dispose()
  }
}
