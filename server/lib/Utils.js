"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeDuplicatesFromGraphData = exports.transform = exports.normalize = exports.mergeGraphData = exports.getNextTargetNodeID = exports.isStreamable = exports.safeText = exports.formatLabel = exports.formatNumber = exports.addNewLinesToWords = exports.getSeperator = exports.createEventsObjectFromEvent = exports.createEventsObject = exports.createGraphDataObject = exports.createEventData = exports.createLabelValue = exports.createNode = exports.createLink = exports.buildProgressResponse = exports.buildResponseFromEntity = exports.buildResponse = void 0;
const uuid_1 = require("uuid");
const constants_1 = require("../constants");
const DEFAULT_NODE_VALUE = constants_1.constants.DEFAULT_NODE_VALUE;
/**
 * buildResponse
 *
 * @param request {IEventsGraphCollectionContextRequest}
 * @param graphData {IGraphData}
 * @param id {any | undefined}
 * @returns {IEventsGraphCollectionContextResponse}
 */
const buildResponse = (request, graphData, eventData, rootNodeID, id, status, progress = 1) => {
    return {
        "id": (id) ? id : uuid_1.v4(),
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
    };
};
exports.buildResponse = buildResponse;
/**
 * buildResponseFromEntity
 *
 * @param entity {IGraphEntity}
 * @param request {IEventsGraphCollectionContextRequest}
 * @returns {IEventsGraphCollectionContextResponse}
 */
const buildResponseFromEntity = (entity, request) => {
    return buildResponse(request, removeDuplicatesFromGraphData(entity.getGraphData()), entity.getEventData(), entity.getID());
};
exports.buildResponseFromEntity = buildResponseFromEntity;
/**
 * buildProgressResponse
 *
 * @param {number} progress
 * @param {IEventsGraphCollectionContextRequest} request
 * @returns
 */
const buildProgressResponse = (progress, request) => {
    return buildResponse(request, undefined, undefined, undefined, undefined, (progress < 1) ? 'pending' : 'completed', progress);
};
exports.buildProgressResponse = buildProgressResponse;
/**
 * createLink
 *
 * @param sourceID {string}
 * @param targetID {string}
 * @param label {string}
 * @param val {number}
 * @returns {IGraphLink}
 */
const createLink = (sourceID, targetID, label, val, type) => {
    label = (label) ? createLabelValue(label) : '';
    return {
        source: sourceID,
        target: targetID,
        label: safeText(label),
        val: val,
        type: type
    };
};
exports.createLink = createLink;
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
const createNode = (id, label, val, desc, icon, type, group, url) => {
    label = (label) ? createLabelValue(label) : '';
    return {
        "id": id,
        "group": (group) ? group : '',
        "label": label,
        "val": (val) ? val : DEFAULT_NODE_VALUE,
        "desc": (desc) ? safeText(desc) : '',
        "icon": (icon) ? icon : '',
        "type": (type) ? type : '',
        "url": (url) ? url : ''
    };
};
exports.createNode = createNode;
/**
 * createLabelValue
 *
 * @param labelValue {string}
 * @returns {string}
 */
const createLabelValue = (labelValue) => {
    // return transform(labelValue, constants.LABEL_MAX_WORD_COUNT)
    return safeText(addNewLinesToWords(labelValue, constants_1.constants.LABEL_MAX_WORDS_BEFORE_NEW_LINE));
};
exports.createLabelValue = createLabelValue;
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
const createEventData = (id, category, action, label, val, type, source, target) => {
    return {
        "id": id,
        "category": (category) ? category : '',
        "action": (action) ? action : '',
        "label": (label) ? label : '',
        "val": (val) ? val : 0,
        "type": (type) ? type : '',
        "source": (source) ? source : '',
        "target": (target) ? target : ''
    };
};
exports.createEventData = createEventData;
/**
 * createGraphDataObject
 *
 * @param nodes {IGraphNode[] | undefined}
 * @param links {IGraphLink[] | undefined}
 * @returns {IGraphData}
 */
const createGraphDataObject = (nodes, links) => {
    return {
        "nodes": nodes ? nodes : [],
        "links": links ? links : []
    };
};
exports.createGraphDataObject = createGraphDataObject;
/**
 * createEventsObject
 *
 * @param {IEventData[]} events
 * @returns {IEventsData}
 */
const createEventsObject = (events) => {
    return {
        "events": events ? events : []
    };
};
exports.createEventsObject = createEventsObject;
/**
 * createEventsObjectFromEvent
 *
 * @param {IEventData} e
 * @returns {IEventsData}
 */
const createEventsObjectFromEvent = (e) => {
    return createEventsObject(new Array(createEventData(e.id, e.category, e.action, e.label, e.val, e.type)));
};
exports.createEventsObjectFromEvent = createEventsObjectFromEvent;
/**
 * getSeperator
 *
 * @returns {string}
 */
const getSeperator = () => {
    return (constants_1.constants.SEP) ? constants_1.constants.SEP : '-';
};
exports.getSeperator = getSeperator;
/**
 * addNewLinesToWords
 *
 * @description used to break up a string of text by a given count
 * @param str
 * @param n
 * @returns {string}
 */
const addNewLinesToWords = (text, numWords) => {
    const ret = [];
    const words = text.trim().split(/\s+/);
    const wordCount = words.length;
    let i = 0;
    let lastIndex = 0;
    // Only apply formatting when count is above limit
    if (wordCount <= numWords) {
        return text;
    }
    while (i <= wordCount) {
        ret.push(words.slice(lastIndex, i).join(' '));
        lastIndex = i;
        i = i + numWords;
        if (i > wordCount) {
            ret.push(words.slice(lastIndex, i).join(' '));
        }
    }
    return ret.join('\n ').replace(/^(\n)\s/g, '');
};
exports.addNewLinesToWords = addNewLinesToWords;
/**
 * formatNumber
 *
 * @param num {number}
 * @returns {string}
 */
const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num);
};
exports.formatNumber = formatNumber;
/**
 * formatLabel
 *
 * @param value
 * @returns
 */
const formatLabel = (value) => {
    return value.replace(/\b(?:_)\b/, ' ');
};
exports.formatLabel = formatLabel;
/**
 * safeText
 *
 * @param value
 * @returns {string}
 */
const safeText = (value) => {
    return value.replace(/(?:🇨|…)/, '')
        .replace(/[^0-9a-z-A-Z ]/g, "")
        .replace(/ +/, " ");
};
exports.safeText = safeText;
/**
 * isStreamable
 *
 * @param {any} obj
 * @returns {boolean}
 */
const isStreamable = (obj) => {
    return obj.getDataStream !== undefined;
};
exports.isStreamable = isStreamable;
/**
 * getNextTargetNodeID
 *
 * @param {EntityCollection} collection
 * @param {Entity} entity
 * @param {CollectionAssociation} associationType
 * @returns
 */
const getNextTargetNodeID = (collection, entity, associationType) => {
    let targetNodeID;
    // check collection association type for determining next sourceNodeID
    switch (associationType) {
        case "linear":
            targetNodeID = entity.getID();
            break;
        case "central":
            targetNodeID = collection.getID();
            break;
        case "none":
        default:
            targetNodeID = undefined;
    }
    return targetNodeID;
};
exports.getNextTargetNodeID = getNextTargetNodeID;
/**
 * mergeGraphData
 *
 * @param gd1 {IGraphData}
 * @param gd2 {IGraphData}
 * @returns {IGraphData}
 */
const mergeGraphData = (gd1, gd2) => {
    gd1.nodes = gd1.nodes.concat(gd2.nodes);
    gd1.links = gd1.links.concat(gd2.links);
    return gd1;
};
exports.mergeGraphData = mergeGraphData;
/**
 * normalize
 *
 * @description used to normalize a number between 0 and 1 by given
 * @param val {number}
 * @param max {number}
 * @param min {number}
 * @returns {number}
 */
const normalize = (val, max, min) => { return Math.max(0, Math.min(1, (val - min) / (max - min))); };
exports.normalize = normalize;
/**
 * transform
 *
 * @param value {string}
 * @param limit {string}
 * @param trail {string}
 * @returns {string}
 */
const transform = (value, limit, trail = '...') => {
    let result = value || '';
    if (value) {
        const words = value.split(/\s+/);
        if (words.length > Math.abs(limit)) {
            if (limit < 0) {
                limit *= -1;
                result = trail + words.slice(words.length - limit, words.length).join(' ');
            }
            else {
                result = words.slice(0, limit).join(' ') + trail;
            }
        }
    }
    return result;
};
exports.transform = transform;
/**
 * removeDuplicatesFromGraphData
 *
 * @param data {IGraphData}
 * @returns {IGraphData}
 */
const removeDuplicatesFromGraphData = (data) => {
    // Filter Nodes
    data.nodes = data.nodes.reduce((accumalator, current) => {
        if (!accumalator.some(item => item.id === current.id)) {
            accumalator.push(current);
        }
        return accumalator;
    }, []);
    // Filter Links
    data.links = data.links.reduce((accumalator, current) => {
        if (!accumalator.some(item => item.source === current.source && item.target === current.target)) {
            accumalator.push(current);
        }
        return accumalator;
    }, []);
    return data;
};
exports.removeDuplicatesFromGraphData = removeDuplicatesFromGraphData;
//# sourceMappingURL=Utils.js.map