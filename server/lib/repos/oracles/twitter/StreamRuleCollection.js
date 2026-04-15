"use strict";
// import IStreamRuleData from "./domain/IStreamRuleData"
// import StreamRule from "./StreamRule"
// import { v4 as uuidv4 } from "uuid"
// /**
//  * 
//  * @param {IStreamRuleData | StreamRule[]} rule
//  * @param {string} key
//  * @returns {[string, StreamRule]}
//  */
// const _getRuleMapEntryFromData = (key: string, rule: IStreamRuleData | StreamRule[]): [string, StreamRule] => {
//   return [key, ((rule as StreamRule).getData) ? rule : new StreamRule(rule as IStreamRuleData)] as [string, StreamRule]
// }
// /**
//  * _getMap
//  *
//  * @param {IStreamRuleData[] | StreamRule[]} data 
//  * @returns {Map<number, StreamRule>}
//  */
// const _getMapOfData = (data: IStreamRuleData[] | StreamRule[]): Map<string, StreamRule> => {
//   return new Map( data.map( (rule: IStreamRuleData | StreamRule): [string, StreamRule] => _getRuleMapEntryFromData( rule.value.trim(), rule ) ))
// }
// /**
//  * StreamRuleCollection
//  *
//  * @class
//  */
// export default class StreamRuleCollection {
//   private _id: string
//   private _collection: Map<string, StreamRule> = new Map()
//   constructor(rules?: IStreamRuleData[] | StreamRule[], id?: string) {
//     this._id = (id) ? id : uuidv4()
//     if (rules) {
//       this.loadData(rules)
//     }
//   }
//   /**
//    * loadData
//    *
//    * @param {IStreamRuleData[] | StreamRule[]} data
//    * @returns {StreamRuleCollection}
//    */
//   public loadData(data: IStreamRuleData[] | StreamRule[]): StreamRuleCollection {
//     this._collection = _getMapOfData(data)
//     return this
//   }
//   /**
//    * mergeData
//    *
//    * @param {IStreamRuleData[] | StreamRule[]} mergeData
//    * @returns {StreamRuleCollection}
//    */
//   public mergeData(mergeData: IStreamRuleData[] | StreamRule[]): StreamRuleCollection {
//     // merge new and existing collections
//     this._collection = new Map([..._getMapOfData( mergeData ), ...this._collection])
//     return this
//   }
//   /**
//    * getValues
//    *
//    * @returns {StreamRule[]}
//    */
//   public getValues(): StreamRule[] {
//     return [...this._collection.values()]
//   }
//   /**
//    * getUnsavedValues
//    *
//    * @returns {StreamRule[]}
//    */
//   public getUnsavedValues(): StreamRule[] {
//     return this.getValues().filter( (rule: StreamRule) => rule.id !== undefined )
//   }
// }
//# sourceMappingURL=StreamRuleCollection.js.map