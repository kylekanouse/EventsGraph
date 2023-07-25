import { CommandMessage } from "../types/CommandMessage"

/**
 * ICommand
 */

export default interface ICommand {
  execute(message: CommandMessage): void
}