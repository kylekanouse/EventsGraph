import ITweetData from "./ITweetData";

export default interface ITweetCollectionData {
  id?: string
  tweets: ITweetData[]
}