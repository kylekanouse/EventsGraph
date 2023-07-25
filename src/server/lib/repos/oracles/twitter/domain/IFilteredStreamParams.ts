import IStreamRuleData from "./IStreamRuleData";

export default interface IFilteredStreamParams {
  rules: IStreamRuleData[]
  sampleSize: number
}