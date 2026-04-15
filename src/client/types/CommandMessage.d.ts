import { CommandID } from './CommandID'
import { NodeOrLinkMessage } from './NodeOrLinkMessage'

/**
 * CommandMessage
 * 
 * @type
 */

export type CommandMessage = NodeOrLinkMessage & {
  commandID?: CommandID
}