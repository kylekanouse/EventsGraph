/**
 * IGraphDataRequest
 *
 * @description Interface for parameter object passed to Oracles to retreive graph data
 * @interface
 */

export default interface IGraphDataRequest {
  collection: string;
  action: string;
  params: object;
}