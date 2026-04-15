import Loader from './Loader'
import { Scene } from 'three'

/**
 * StreamProgressManager
 *
 * @description Manages stream progress tracking and loader updates for EventsGraph
 */

export default class StreamProgressManager {

  private _loader: Loader | undefined
  private _getScene: () => Scene

  constructor(loadingText: string, getScene: () => Scene) {
    this._loader = new Loader(loadingText)
    this._getScene = getScene
  }

  /**
   * showLoader
   *
   * @returns {StreamProgressManager}
   */

  showLoader(progress?: number): StreamProgressManager {
    this.updateProgressText(progress)

    if (this._loader) {
      this._getScene().add(this._loader.start().getObject3D())
    }

    return this
  }

  /**
   * hideLoader
   *
   * @returns {StreamProgressManager}
   */

  hideLoader(): StreamProgressManager {
    if (this._loader) {
      this._getScene().remove(this._loader.stop().reset().getObject3D())
    }

    return this
  }

  /**
   * updateProgressText
   *
   * @param progress
   * @returns {StreamProgressManager}
   */

  updateProgressText(progress?: number): StreamProgressManager {
    if (this._loader) {
      this._loader.updateProgress(progress)
    }

    return this
  }
}
