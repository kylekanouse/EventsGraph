import { Object3D, TextureLoader } from "three"
import ThreeMeshUI from 'three-mesh-ui'
import FontJSON from '../assets/fonts/Roboto-msdf.json'
import FontImage from '../assets/fonts/Roboto-msdf.png'
import TextSprite from '@seregpie/three.text-sprite'

/**
 * VRPanel
 *
 * @class
 */
export default class VRPanel extends Object3D {

  private _title      : string | undefined

  private _imageUrl   : string | undefined

  private _caption    : string | undefined

  private _content    : string | undefined

  /**
   * Contructor
   */

  constructor(content: string, title?: string, imageUrl?: string, caption?: string) {

    super()

    this._content       = content
    this._title         = title
    this._imageUrl      = imageUrl
    this._caption       = caption

    this._init()
  }

  /**
   * ########################################################## Private
   */

  /**
   * _init
   *
   * @private
   */

  private _init(): void {

    const container = new ThreeMeshUI.Block({
      ref: "panel-container",
      justifyContent: 'center',
      alignContent: 'center',
      contentDirection: 'column',
      fontFamily: FontJSON,
      fontTexture: FontImage,
      fontSize: 5,
      padding: 0.25,
      borderRadius: 5,
      backgroundOpacity: 1,
    })
    // Set up main container
    // container.position.set(0, 1, -1.8)
    container.rotation.x = -0.15

    // --- title

    const title = new ThreeMeshUI.Block({
      height: 10,
      width: 60,
      margin: 0.25,
      justifyContent: "center",
      fontSize: 5,
    }).add(
      new ThreeMeshUI.Text({
        content: this._title,
      })
    )

    // console.log('VRPanel | title = ', this._title)
    container.add(title)

    const contentContainer = new ThreeMeshUI.Block({
      contentDirection: "row",
      padding: 0.2,
      margin: 0.25,
      backgroundOpacity: 1,
    })

    // if (this._imageUrl) {
    //   contentContainer.add( this._getImageBlock(this._imageUrl, this._caption) )
    // }

    if (this._content) {
      contentContainer.add( this._getContentBlock(this._content) )
    }

    // Add content to main container
    container.add( contentContainer )

    this.add( container )
  }

  /**
   * _getCaptionBlock
   *
   * @param {string} caption
   * @returns {Object3D}
   */

  private _getCaptionBlock(caption: string): Object3D {

    const captionBlock = new ThreeMeshUI.Block({
      height: 2,
      width: 5,
      alignContent: "center",
      justifyContent: "center",
    })

    captionBlock.add(
      new ThreeMeshUI.Text({
        content: this._caption,
        fontSize: 5,
      })
    )

    return captionBlock
  }

  /**
   * _getContentBlock
   *
   * @param {string} content
   * @returns {Object3D}
   */

  private _getContentBlock(content: string): Object3D {

    const contentWrapperBlock = new ThreeMeshUI.Block({
      margin: 0.025,
    })

    const contentBlock = new ThreeMeshUI.Block({
      height: 55,
      width: 50,
      margin: 1,
      padding: 2,
      fontSize: 2,
      alignContent: "left",
      backgroundOpacity: 1,
    })
    .add(
      new ThreeMeshUI.Text({
        content: content,
      })
    )
    // console.log('VRPanel | content = ', content)
    // let instance = new TextSprite({
    //   alignment: 'left',
    //   color: '#24ff00',
    //   backgroundColor: '#000000',
    //   fontFamily: '"Times New Roman", Times, serif',
    //   fontSize: 8,
    //   fontStyle: 'italic',
    //   text: [
    //     'Twinkle, twinkle, little star,',
    //     'How I wonder what you are!',
    //     'Up above the world so high,',
    //     'Like a diamond in the sky.',
    //   ].join('\n'),
    // })
    contentWrapperBlock.add(contentBlock)

    return contentWrapperBlock
  }

  /**
   * _getImageBlock
   *
   * @param {string} imageUrl
   * @param {string | ndefined} caption
   * @returns {Object3D}
   */

  private _getImageBlock(imageUrl: string, caption?: string): Object3D {

    const imageBlock = new ThreeMeshUI.Block({
      height: 20,
      width: 20,
      margin: 0.025,
      padding: 0.025,
      alignContent: "left",
      justifyContent: "end",
    })

    if (caption) {
      imageBlock.add( this._getCaptionBlock(caption) )
    }

    // Load image as background texture
    new TextureLoader().load(imageUrl, (texture) => {
      imageBlock.set({
        backgroundTexture: texture,
      })
    })

    return imageBlock
  }
}