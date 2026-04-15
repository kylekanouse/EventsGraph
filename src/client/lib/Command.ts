import { CommandID } from '../types/CommandID'
import ICommand from "../domain/ICommand"
import { CommandMessage } from '../types/CommandMessage'

/**
 * Command
 *
 * @abstract
 * @class
 */

export default abstract class Command<T> implements ICommand {

  /**
   * _command
   *
   * @type {CommandID}
   */

  private _id: CommandID

  /**
   * _controller
   *
   * @type {T}
   */

  protected _controller: T

  /**
   * constructor
   *
   * @param controller 
   */

  constructor(commandID: CommandID, controller: T) {

    this._id            = commandID
    this._controller    = controller
  }

  /**
   * CommandID
   *
   * @returns {CommandID}
   */

  get id(): CommandID {
    return this._id
  }

  /**
   * execute
   *
   * @param {CommandMessage} message
   */

  public abstract execute(message: CommandMessage): void
}