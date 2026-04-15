import { PlaneGeometry, MeshLambertMaterial, Mesh, DoubleSide, Scene, Camera, WebGLRenderer, Group } from 'three'
import { constants } from "../../server/constants"
import { getCamera, getCameraGroup, getScene } from "./Utils"

/**
 * SceneManager
 *
 * @description Manages Three.js scene, camera, renderer lifecycle for EventsGraph
 */

export default class SceneManager {

  private _plane: Mesh | undefined
  private _renderer: WebGLRenderer | undefined

  get scene(): Scene { return getScene() }

  get camera(): Camera { return getCamera() }

  get cameraGroup(): Group { return getCameraGroup() }

  get renderer(): WebGLRenderer | undefined { return this._renderer }

  /**
   * initScene
   *
   * @description Initializes plane and scene callbacks
   * @param onRendered Callback invoked from scene.onBeforeRender to capture renderer
   * @returns {SceneManager}
   */

  initScene(onRendered: (renderer: WebGLRenderer, scene: Scene, camera: Camera, renderTarget: any) => void): SceneManager {

    const planeGeometry       = new PlaneGeometry(2000, 2000, 1, 1)
    const planeMaterial       = new MeshLambertMaterial({ color: constants.MAIN_PLANE_COLOR, side: DoubleSide })
    this._plane               = new Mesh(planeGeometry, planeMaterial)

    // Set position
    this._plane.position.set(-100, -800, -100)
    this._plane.rotation.set(0.5 * Math.PI, 0, 0)

    // Add plane to scene
    this.scene.add(this._plane)

    // Use onBeforeRender to get access to Three.js elements that 3D force Graph does not expose
    this.scene.onBeforeRender = (
      renderer: WebGLRenderer,
      scene: Scene,
      camera: Camera,
      _geometry: any,
      _material: any,
      renderTarget: any
    ): void => {
      onRendered(renderer, scene, camera, renderTarget)
    }

    return this
  }

  /**
   * captureRenderer
   *
   * @description Captures the WebGLRenderer from Three.js onBeforeRender callback
   * @param renderer
   */

  captureRenderer(renderer: WebGLRenderer): void {
    if (!this._renderer) {
      this._renderer = renderer
      this._renderer.xr.enabled = true
    }
  }
}
