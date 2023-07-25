/**
 * ITweetReferenceData
 * 
 * @description Data of what a Tweet refers to. For example, if the parent Tweet is a Retweet, a Retweet with comment (also known as Quoted Tweet) or a Reply, it will include the related Tweet referenced to by its parent.
 * @interface
 */

export default interface ITweetReferenceData {
  type?: string
  id?: string
}