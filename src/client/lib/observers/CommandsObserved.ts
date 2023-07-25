import Observer from "../Observer"
import EventsGraph from '../EventsGraph'
import { constants } from "../../../server/constants"
import { CommandMessage } from "../../types/CommandMessage"
import ICommand from '../../domain/ICommand'
import Command from "../Command"

/**
 * CONST
 */

 const idPostFix        : string = 'CommandsObserved',
       SEP              : string = constants.SEP,
       CHANNELID        : string = __OBSERVER_COMMANDS_CHANNEL_ID__

/**
 * CommandsObserved
 * 
 * @class
 * @extends { Observer<CommandMessage>}
 */

export default class CommandsObserved extends Observer<CommandMessage> {

  private _commands: Map<string, ICommand> = new Map()

  /**
   * constructor
   */

  constructor(id: string) {

    super(idPostFix.concat(SEP + id))

    this._init()
  }

  /**
   * _init
   *
   * @description Setup subscribtions and mutations to observer channel events
   * @returns {CommandsObserved}
   */

  private _init(): CommandsObserved {

    this
      .subscribe<CommandMessage>(
        CHANNELID,
        (message: CommandMessage): void => {
          this._execute(message)
        }
      )

    return this
  }

  /**
   * _execute
   *
   * @param {CommandMessage} message
   * @returns
   */

  private _execute(message: CommandMessage): void {

    if (!message.commandID) { return } 

    const command = this._commands.get(message.commandID)

    if (command) {
      command.execute(message)
    }
  }

  /**
   * addCommand
   *
   * @param {Command} command 
   * @returns {CommandsObserved}
   */

  addCommand(command: Command<EventsGraph>): CommandsObserved {

    this._commands.set(command.id, command)

    return this
  }

  /**
   * sendCommand
   *
   * @param {CommandMessage} message 
   * @returns {CommandsObserved}
   */

  sendCommand(message: CommandMessage): CommandsObserved {

    this.send<CommandMessage>(CHANNELID, message)

    return this
  }
}