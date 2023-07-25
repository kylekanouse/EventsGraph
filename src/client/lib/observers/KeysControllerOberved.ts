import Observer from "../Observer"
import { constants } from "../../../server/constants"
import { CommandMessage } from "../../types/CommandMessage"
import KeysController from '../KeysController'

/**
 * CONST
 */

const idPostFix               : string = 'KeysControllerObserved',
      SEP                     : string = constants.SEP,
      CHANNELID               : string = __OBSERVER_KEYS_CONTROLS_CHANNEL_ID__,
      COMMANDS_CHANNEL_ID     : string = __OBSERVER_COMMANDS_CHANNEL_ID__

/**
 * KeysControllerObserved
 *
 * @class
 * @extends {Observer<VRControlsUI>}
 */

export default class KeysControllerObserved extends Observer<KeysController> {

  /**
   * constructor
   */

  constructor() {

    super(idPostFix, {} as CommandMessage)

    this._init()
  }

  /**
   * _init
   *
   * @returns {KeysControllerObserved}
   */

   private _init(): KeysControllerObserved {

    this
      .subscribe<CommandMessage>(
        CHANNELID,
        (message: CommandMessage): void => {
          this.send<CommandMessage>(COMMANDS_CHANNEL_ID, message)
        }
      )

    return this
  }

  /**
   * onKeyDown
   *
   * @param {string} command
   * @param {any} obj
   * @returns {KeysControllerObserved}
   */

  onKeyDown(message: CommandMessage): KeysControllerObserved {
    this.send<CommandMessage>(CHANNELID, message)
    return this
  }
}