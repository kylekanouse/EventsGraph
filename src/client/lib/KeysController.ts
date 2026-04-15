import { CommandMessage } from '../types/CommandMessage'
import ObserverController from './ObserverController'
import KeysControllerObserved from './observers/KeysControllerOberved'
import { debounce } from './Utils'

/**
 * CONST
 */

/**
 * commandMap
 *
 * @constant
 */

const commandMap: Map<string, string> = new Map([
 ['KeyX', 'next'],
 ['KeyZ', 'prev'],
])

/**
 * debounceOnKeyDown
 */

const debounceOnKeyDown = debounce((command: CommandMessage): void => {
                            KeysController.observed.onKeyDown(command)
                          }, 200)

/**
 * CLASS
 */

/**
 * KeyControls
 *
 * @description Main object to interface key controls with commands controller
 * @class
 */

export default class KeysController {

  static observed: KeysControllerObserved = ObserverController.addObserved<CommandMessage>( new KeysControllerObserved() ) as KeysControllerObserved

  /**
   * onKeyDown
   *
   * @static
   * @param {KeyboardEvent} e
   */

  public static onKeyDown(e: KeyboardEvent): void {

    const command = commandMap.get(e.code)

    if (command) {
      debounceOnKeyDown({commandID: command} as CommandMessage)
    }
  }

  /**
   * init
   *
   * @static
   */

  public static init(): void { window.addEventListener('keydown', KeysController.onKeyDown) }
}