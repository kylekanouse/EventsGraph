import IGraphData from '../../../../domain/IGraphData'
import graphBasicJSON from './data/mock.graph.data.basic.json'
import graphRequestTypeJSON from './data/mock.graph.data.request-types.json'
import graphRequetSingleNodeJSON from './data/mock.graph.data.single-node.json'

/**
 * Basic Data
 */

export const graphBasicData: IGraphData = graphBasicJSON as IGraphData

/**
 * Request Type
 */

export const graphRequestTypeData: IGraphData = graphRequestTypeJSON as IGraphData

/**
 * Single Node
 */

export const graphRequestSingleNode : IGraphData = graphRequetSingleNodeJSON as IGraphData