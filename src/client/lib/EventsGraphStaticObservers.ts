import EventsGraph from './EventsGraph'
import ActiveNodesObserved from './observers/ActiveNodesObserved'
import EntitiesOnStageObserved from './observers/EntitiesOnStageObserved'
import EntityActiveObserved from './observers/EntityActiveObserved'
import EntityClickedObserved from './observers/EntityClickedObserved'
import EntityFocusedObserved from './observers/EntityFocusedObserved'
import EntityHoverObserved from './observers/EntityHoverObserved'
import NodeActiveObserved from './observers/NodeActiveObserved'
import NodeClickedObserved from './observers/NodeClickedObserved'
import NodeFocusedObserved from './observers/NodeFocusedObserved'
import EGNodeFocusedObserver from './observers/EGNodeFocusedObserved'
import EGEntityHoverObserved from './observers/EGEntityHoverObserved'
import GraphLoadedObserved from './observers/GraphLoadedObserved'
import NodesOnStageObserved from './observers/NodesOnStageObserved'
import NavSelectedTypesObserved from './observers/NavSelectedTypesObserved'
import NavigationObserved from './observers/NavigationObserved'
import VRControlsOnStageObserved from './observers/VRControlsOnStageObserved'

/**
 * EventsGraphStaticObservers
 *
 * @class
 * @abstract
 */

export default abstract class EventsGraphStaticObservers {

  /**
   * init
   * 
   * @description used to initalize all the static observers scoped to EventsGraph
   * @static
   */

  public static init(controller: EventsGraph) {

    GraphLoadedObserved.init()

    // Active Nodes
    ActiveNodesObserved.init()

    // Objects on stage
    EntitiesOnStageObserved.init()

    EntityActiveObserved.init()

    EntityClickedObserved.init()

    EntityFocusedObserved.init()

    EntityHoverObserved.init()

    NodeClickedObserved.init()

    NodeActiveObserved.init()

    NodeFocusedObserved.init()

    NodesOnStageObserved.init()

    NavigationObserved.init()

    NavSelectedTypesObserved.init()

    VRControlsOnStageObserved.init()

    EGNodeFocusedObserver.init(controller)

    EGEntityHoverObserved.init(controller)
  }

  /**
   * clear
   * 
   * @static
   */

  public static clear() {
    EntitiesOnStageObserved.clear()
    NodesOnStageObserved.clear()
    ActiveNodesObserved.clear()
    NavSelectedTypesObserved.clear()
    VRControlsOnStageObserved.clear()
  }
}