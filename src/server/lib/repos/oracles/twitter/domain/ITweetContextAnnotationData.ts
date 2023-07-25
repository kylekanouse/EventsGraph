import ITweetContextAnnotationDomainData from "./ITweetContextAnnotationDomainData";
import ITweetContextAnnotationEntityData from "./ITweetContextAnnotationEntityData";

/**
 * ITweetContextAnnotationData
 *
 * @description Context annotations are delivered as a context_annotations field in the payload. These annotations are inferred based on the Tweet text and result in domain and/or entity labels. Context annotations can yield one or many domains.
 * @interface
 */

export default interface ITweetContextAnnotationData {
  domain?: ITweetContextAnnotationDomainData
  entity?: ITweetContextAnnotationEntityData
}