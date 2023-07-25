import { CommandID } from "../../types/CommandID"
import EventsGraph from "../EventsGraph"
import Command from '../Command'
import NavigationObserved from "../observers/NavigationObserved"
import Entity from "../Entity"
import Node from "../Node"

/**
 * CONST
 */

const PREV_COMMAND_ID: CommandID = 'prev'

/**
 * CLASS
 * 
 * EGCommandPrev
 *
 * @class
 * @implements {ICommand}
 */

export default class CommandPrev extends Command<EventsGraph> {

  /**
   * constructor
   *
   * @param {EventsGraph} eg
   */

  constructor(eg: EventsGraph) {

    super(PREV_COMMAND_ID, eg)

  }

  /**
   * execute
   *
   * @returns {CommandPrev}
   */

  public execute(): CommandPrev {

    // Get current focused node
    const node: Node | undefined = this._controller.getFocusedNode()

    if (!node || !node.id) { return this }

    // Get next entity from NavMap
    const prev: Entity<any> | undefined = NavigationObserved.navMap.setCurrent( node.id.toString() ).getPrev()

    if (prev) {
      this._controller.focusEntity(prev)
    }

    return this
  }
}