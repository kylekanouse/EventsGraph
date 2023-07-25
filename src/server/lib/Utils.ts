import IEventsGraphCollectionContextResponse from "../domain/IEventsGraphCollectionContextResponse"
import IGraphData from "../domain/IGraphData"
import IGraphEntity from "../domain/IGraphEntity"
import IGraphLink from "../domain/IGraphLink"
import IGraphNode from "../domain/IGraphNode"
import { v4 as uuidv4 } from "uuid"
import IEventsGraphCollectionContextRequest from "../domain/IEventsGraphCollectionContextRequest"
import { constants } from "../constants"
import IEventData from "../domain/IEventData"
import IStreamable from '../domain/IStreamData'
import { CollectionAssociation } from '../domain/IEntityCollection'
import EntityCollection from './EntityCollection'
import Entity from "./Entity"
import { ResponseStatus } from "../domain/IResponseMeta"
import IEventsData from "../domain/IEventsData"

const DEFAULT_NODE_VALUE: number = constants.DEFAULT_NODE_VALUE

/**
 * buildResponse
 *
 * @param request {IEventsGraphCollectionContextRequest}
 * @param graphData {IGraphData}
 * @param id {any | undefined}
 * @returns {IEventsGraphCollectionContextResponse}
 */

const buildResponse = ( request: IEventsGraphCollectionContextRequest, graphData?: IGraphData, eventData?: IEventData, rootNodeID?: string, id?: string, status?: ResponseStatus, progress: number = 1): IEventsGraphCollectionContextResponse => {

  return {
    "id": (id) ? id : uuidv4(),
    "collection": (request.collection) ? request.collection : '',
    "context": (request.context) ? request.context : '',
    "rootNodeID": (rootNodeID) ? rootNodeID : '',
    "graphData": (graphData) ? graphData : '',
    "eventData": (eventData) ? eventData : '',
    "meta": {
      "status": (status) ? status : 'completed',
      "progress": progress,
      "timeSent": Date.now().toString()
    }
  } as IEventsGraphCollectionContextResponse
}

// Export
export { buildResponse }

/**
 * buildResponseFromEntity
 *
 * @param entity {IGraphEntity}
 * @param request {IEventsGraphCollectionContextRequest}
 * @returns {IEventsGraphCollectionContextResponse}
 */

 const buildResponseFromEntity = (entity: IGraphEntity, request: IEventsGraphCollectionContextRequest): IEventsGraphCollectionContextResponse => {
  return buildResponse(
                        request,
                        removeDuplicatesFromGraphData( entity.getGraphData() ),
                        entity.getEventData(),
                        entity.getID()
                      )
}

// Export
export { buildResponseFromEntity }

/**
 * buildProgressResponse
 *
 * @param {number} progress 
 * @param {IEventsGraphCollectionContextRequest} request 
 * @returns 
 */

const buildProgressResponse = (progress: number, request: IEventsGraphCollectionContextRequest): IEventsGraphCollectionContextResponse => {

  return buildResponse(
                        request,
                        undefined,
                        undefined,
                        undefined,
                        undefined,
                        (progress<1) ? 'pending' : 'completed',
                        progress
                      )
}

export { buildProgressResponse }

/**
 * createLink
 *
 * @param sourceID {string}
 * @param targetID {string}
 * @param label {string}
 * @param val {number}
 * @returns {IGraphLink}
 */

const createLink = (sourceID: string, targetID: string, label?: string, val?: number, type?: string): IGraphLink => {
  label = (label) ? createLabelValue(label) : ''
  return {
    source: sourceID,
    target: targetID,
    label: safeText(label),
    val: val as number,
    type: type
  }
}

// Export
export { createLink }

/**
 * createNode
 *
 * @param id {unknown}
 * @param label {string}
 * @param val {number}
 * @param desc {string}
 * @param icon {string}
 * @param type {string}
 * @param group {number}
 * @returns {IGraphNode}
 */

const createNode = (id: unknown, label?: string, val?: number, desc?: string, icon?: string, type?: string, group?: number, url? :string): IGraphNode => {
  label = (label) ? createLabelValue(label) : ''
  return {
    "id": id,
    "group": (group) ? group : '',
    "label": label,
    "val": (val) ? val : DEFAULT_NODE_VALUE,
    "desc": (desc) ? safeText(desc) : '',
    "icon": (icon) ? icon : '',
    "type": (type) ? type : '',
    "url": (url) ? url : ''
  } as IGraphNode
}

// Export
export { createNode }

/**
 * createLabelValue
 *
 * @param labelValue {string}
 * @returns {string}
 */

const createLabelValue = (labelValue: string): string => {
  // return transform(labelValue, constants.LABEL_MAX_WORD_COUNT)
  return safeText(addNewLinesToWords(labelValue, constants.LABEL_MAX_WORDS_BEFORE_NEW_LINE))
}

// Export
export { createLabelValue }

/**
 * createEventData
 *
 * @param {string | undefined} id
 * @param {string | undefined} category 
 * @param {string | undefined} action 
 * @param {string | undefined} label 
 * @param {number | undefined} val 
 * @param {string | undefined} type
 * @param {string | undefined} source
 * @param {string | undefined} target
 * @returns {IEventData}
 */

const createEventData = (id?: string, category?: string, action?: string, label?: string, val?: number, type?: string, source?: string, target?: string): IEventData => {
  return {
    "id": id,
    "category": (category) ? category : '',
    "action": (action) ? action : '',
    "label": (label) ? label : '',
    "val": (val) ? val : 0,
    "type": (type) ? type : '',
    "source": (source) ? source : '',
    "target": (target) ? target : ''
  } as IEventData
}

export { createEventData }
/**
 * createGraphDataObject
 *
 * @param nodes {IGraphNode[] | undefined}
 * @param links {IGraphLink[] | undefined}
 * @returns {IGraphData}
 */

const createGraphDataObject = (nodes?: IGraphNode[], links?: IGraphLink[]): IGraphData => {
  return {
    "nodes": nodes ? nodes : [] as IGraphNode[],
    "links": links ? links : [] as IGraphLink[]
  }
}

// Export
export { createGraphDataObject }

/**
 * createEventsObject
 *
 * @param {IEventData[]} events 
 * @returns {IEventsData}
 */

const createEventsObject = (events?: IEventData[] ): IEventsData => {
  return {
    "events": events ? events : [] as IEventData[]
  }
}

export { createEventsObject }

/**
 * createEventsObjectFromEvent
 *
 * @param {IEventData} e
 * @returns {IEventsData}
 */

const createEventsObjectFromEvent = (e: IEventData): IEventsData => {
  return createEventsObject( new Array( createEventData(e.id, e.category, e.action, e.label, e.val, e.type ) ) )
}

export { createEventsObjectFromEvent }
/**
 * getSeperator
 *
 * @returns {string}
 */

const getSeperator = (): string => {
  return (constants.SEP) ? constants.SEP : '-'
}

// Export
export { getSeperator }

/**
 * addNewLinesToWords
 *
 * @description used to break up a string of text by a given count
 * @param str 
 * @param n 
 * @returns {string}
 */

const addNewLinesToWords = (text: string, numWords: number): string => {

  const ret: string[] = []
  const words = text.trim().split(/\s+/)
  const wordCount = words.length
  let i: number = 0
  let lastIndex: number = 0
  
  // Only apply formatting when count is above limit
  if (wordCount<=numWords) {return text}

  while (i<=wordCount)  {
    ret.push( words.slice(lastIndex, i).join(' ') )
    lastIndex = i
    i = i+numWords
    if (i>wordCount) {
      ret.push( words.slice(lastIndex, i).join(' ') )
    }
  }

  return ret.join('\n ').replace( /^(\n)\s/g , '')
}

// Export
export { addNewLinesToWords }

/**
 * formatNumber
 *
 * @param num {number}
 * @returns {string}
 */

const formatNumber = (num: number): string => {
  return new Intl.NumberFormat().format(num)
}

// Export
export { formatNumber }

/**
 * formatLabel
 *
 * @param value 
 * @returns 
 */

const formatLabel = (value: string): string => {
  return value.replace(/\b(?:_)\b/, ' ')
}

export { formatLabel }

/**
 * safeText
 *
 * @param value
 * @returns {string}
 */

const safeText = (value: string): string => {
  return value.replace(/(?:🇨|…)/, '')
              .replace(/[^0-9a-z-A-Z ]/g, "")
              .replace(/ +/, " ")
}

export { safeText }

/**
 * isStreamable
 *
 * @param {any} obj 
 * @returns {boolean}
 */

const isStreamable = (obj: any): boolean => {
  return (obj as IStreamable).getDataStream !== undefined;
}

// Export
export { isStreamable }

/**
 * getNextTargetNodeID
 *
 * @param {EntityCollection} collection 
 * @param {Entity} entity 
 * @param {CollectionAssociation} associationType 
 * @returns 
 */
const getNextTargetNodeID = (collection: EntityCollection, entity: Entity, associationType: CollectionAssociation): string | undefined => {

    let targetNodeID: string | undefined

          // check collection association type for determining next sourceNodeID
    switch (associationType) {
      case "linear":
        targetNodeID = entity.getID()
        break
      case "central":
        targetNodeID = collection.getID()
        break
      case "none":
      default:
        targetNodeID = undefined
    }
    return targetNodeID
}

export { getNextTargetNodeID }
/**
 * mergeGraphData
 *
 * @param gd1 {IGraphData}
 * @param gd2 {IGraphData}
 * @returns {IGraphData}
 */

const mergeGraphData = (gd1: IGraphData, gd2: IGraphData): IGraphData => {

  gd1.nodes = gd1.nodes.concat( gd2.nodes )
  gd1.links = gd1.links.concat( gd2.links )

  return gd1
}

// Export
export { mergeGraphData }

/**
 * normalize
 *
 * @description used to normalize a number between 0 and 1 by given
 * @param val {number}
 * @param max {number}
 * @param min {number}
 * @returns {number}
 */

const normalize = (val: number, max: number, min: number): number => { return Math.max(0, Math.min(1, (val - min) / (max - min))) }

// Export
export { normalize }

/**
 * transform
 *
 * @param value {string}
 * @param limit {string}
 * @param trail {string}
 * @returns {string}
 */

const transform = (value: string, limit: number, trail: String = '...'): string => {
  let result = value || ''
  if (value) {
    const words = value.split(/\s+/)
    if (words.length > Math.abs(limit)) {
        if (limit < 0) {
        limit *= -1
        result = trail + words.slice(words.length - limit, words.length).join(' ')
        } else {
        result = words.slice(0, limit).join(' ') + trail
        }
    }
  }
  return result
}

// Export
export { transform }

/**
 * removeDuplicatesFromGraphData
 *
 * @param data {IGraphData}
 * @returns {IGraphData}
 */

const removeDuplicatesFromGraphData = (data: IGraphData): IGraphData => {

  // Filter Nodes
  data.nodes = data.nodes.reduce((accumalator: any[], current: IGraphNode) => {
    if(!accumalator.some(item => item.id === current.id)) {
      accumalator.push(current)
    }
    return accumalator
  },[])

  // Filter Links
  data.links = data.links.reduce((accumalator: any[], current: IGraphLink) => {
    if(!accumalator.some(item => item.source === current.source && item.target === current.target )) {
      accumalator.push(current)
    }
    return accumalator
  },[])

  return data
}

// Export
export { removeDuplicatesFromGraphData }