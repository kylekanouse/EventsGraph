import Observer from "../Observer"
import { constants } from "../../../server/constants"
import { CommandMessage } from "../../types/CommandMessage"

/**
 * CONST
 */

const idPostFix               : string = 'VRControlsCLickedObserved',
      SEP                     : string = constants.SEP,
      CHANNELID               : string = __OBSERVER_VRCONTROLS_CLICKED_CHANNEL_ID__,
      COMMANDS_CHANNEL_ID     : string = __OBSERVER_COMMANDS_CHANNEL_ID__


/**
 * VRControlsClickedObserved
 *
 * @class
 * @extends {Observer<VRControlsUI>}
 */

export default class VRControlsClickedObserved extends Observer<CommandMessage> {

  /**
   * constructor``
   */

  constructor( id: string ) {

    super(idPostFix.concat(SEP + id), {} as CommandMessage)

    this._init()
  }

  /**
   * _init
   *
   * @returns {VRControlsClickedObserved}
   */

  private _init(): VRControlsClickedObserved {

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
   * onClick
   *
   * @param {string} command
   * @param {any} obj
   * @returns {VRControlsClickedObserved}
   */

  onClick(message: CommandMessage): VRControlsClickedObserved {
    this.send<CommandMessage>(CHANNELID, message)
    return this
  }
}