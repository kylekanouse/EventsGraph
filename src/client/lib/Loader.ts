import { Group } from 'three'
import SpriteText from 'three-spritetext'
import { addNewLinesToWords } from '../../server/lib/Utils'

const defaultLoadingText          : string = "Loading"
let animatedText                  : string = '...'
let count                         : number = 0

/**
 * _animate
 *
 * @param {SpriteText} obj
 */

const _animate = (obj: SpriteText): void => {
  obj.text = _getAnimatedTextValue()
}

/**
 * _getAnimatedIconValue
 *
 * @returns {string}
 */

const _getAnimatedTextValue = (value: string = animatedText): string => {
  return '        '.substr(0,++count % value.length).concat(value.substr(0, count % value.length+1))
}

/**
 * Loader
 * 
 * @author Kyle Kanouse
 * @class
 */

export default class Loader {

  protected _text                   : string

  protected _loader                 : Group = new Group()
  
  protected _textSprite             : SpriteText

  protected _progressSprite         : SpriteText

  protected _animatedSprite         : SpriteText

  protected _fontColor              : string = 'lightgray'

  protected _progressDefaultText    : string = "0%"

  protected _defaultTextHeight      : number = 20.5

  protected _serperationPadding     : number = 10

  protected _animator               : ReturnType<typeof setInterval> | undefined

  protected _animateTime            : number = 400

  /**
   * Constructor
   *
   * @param {string} text text shown to user while loading
   */

  constructor(text: string = defaultLoadingText) {

    // Set loading text
    this._text = text

    // Create loading text
    this._textSprite                    = new SpriteText( addNewLinesToWords(this._text, 4) )
    this._textSprite.color              = this._fontColor
    this._textSprite.textHeight         = this._defaultTextHeight

    // Create animated icon
    this._animatedSprite                = new SpriteText()
    this._animatedSprite.color          = this._fontColor
    this._animatedSprite.textHeight     = this._defaultTextHeight
    this._animatedSprite.padding        = 3

    // Create percentage text
    this._progressSprite                = new SpriteText( this._progressDefaultText )
    this._progressSprite.color          = this._fontColor
    this._progressSprite.textHeight     = this._defaultTextHeight

    // Setup coordinates
    const loadingTextWidth: number      = this._textSprite.scale.x
    const animedWidth: number           = this._animatedSprite.scale.x
    const percentTextWidth: number      = this._progressSprite.scale.x
    const animeOffset: number           = (loadingTextWidth/2) + (this._serperationPadding/2)
    const percentoOffset: number        = animeOffset + this._serperationPadding + percentTextWidth

    // Adjust percent text position to the right of loading text
    this._animatedSprite.position.set(animeOffset, -1, 0)
    this._progressSprite.position.set(percentoOffset, 0, 0)

    // Add elements to loader group container
    this._loader.add( this._textSprite )
    this._loader.add( this._animatedSprite )
    this._loader.add( this._progressSprite )

    this._loader.position.set(-percentoOffset/2, this._textSprite.scale.y/2+ this._serperationPadding, 0)
  }

  /**
   * getObject3D
   *
   * @returns {Group}
   */

  getObject3D(): Group {
    return this._loader
  }

  /**
   * updateProgress
   *
   * @param {number} progress
   * @returns {void}
   */

  updateProgress(progress?: number): void {

    if (progress== undefined) {
      this._progressSprite.text = ''
      return
    }

    if (progress<=1) {
      progress=progress*100
    }

    if(progress<=100) {
      const proggressString: string = progress.toFixed(0).concat('%')
      this._progressSprite.text = proggressString
    }
  }

  /**
   * start
   *
   * @returns {Loader}
   */

  start(): Loader {
    this._animator = setInterval( () => { 
        _animate(this._animatedSprite)
      }, this._animateTime )
    return this
  }

  /**
   * stop
   *
   * @returns {Loader}
   */

  stop(): Loader {
    if (this._animator) {
      clearTimeout(this._animator)
    }
    return this
  }

  reset(): Loader {
    this.updateProgress(0)
    return this
  }
}