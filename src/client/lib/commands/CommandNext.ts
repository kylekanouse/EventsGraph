import { CommandID } from '../../types/CommandID'
import EventsGraph from '../EventsGraph'
import Command from '../Command'
import Node from '../Node'
import NavigationObserved from '../observers/NavigationObserved'
import Entity from '../Entity'
/**
 * CONST
 */

const NEXT_COMMAND_ID: CommandID = 'next'

/**
 * CLASS
 * 
 * CommandNext
 *
 * @class
 * @implements {ICommand}
 */

export default class CommandNext extends Command<EventsGraph> {

  /**
   * constructor
   *
   * @param {EventsGraph} eg
   */

  constructor(eg: EventsGraph) {

    super(NEXT_COMMAND_ID, eg)

  }

  /**
   * execute
   *
   * @returns {CommandNext}
   */

  public execute(): CommandNext {

    // Get current focused node
    const node: Node | undefined = this._controller.getFocusedNode()

    if (!node || !node.id) { return this }

    // Get next entity from NavMap
    const next: Entity<any> | undefined = NavigationObserved.navMap.setCurrent( node.id.toString() ).getNext()

    if (next) {
      this._controller.focusEntity(next)
    }

    return this
  }
}