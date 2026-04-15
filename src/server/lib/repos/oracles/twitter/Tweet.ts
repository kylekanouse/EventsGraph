import { constants } from "../../../../constants"
import IGraphData from "../../../../domain/IGraphData"
import IGraphLink from "../../../../domain/IGraphLink"
import IGraphNode from "../../../../domain/IGraphNode"
import { createGraphDataObject, createLink, createNode, formatLabel, mergeGraphData } from "../../../Utils"
import Entity from "../../../Entity"
import ITweetData from "./domain/ITweetData"
import TweetEntitiesCollection from "./TweetEntitiesCollection"
import TweetPublicMetrics from "./TweetPublicMetrics"
import TweetContextAnnotationCollection from "./TweetContextAnnotationCollection"
import UserAuthor from "./UserAuthor"
import TweetSource from "./TweetSource"
import MediaCollection from "./MediaCollection"
import { buildTweetUrl } from "./TwitterUtils"

const TWITTER_LOGO: string | undefined = process.env.TWITTER_LOGO_URL

/**
 * Tweet
 * 
 * @class
 * @extends {Entity}
 */

export default class Tweet extends Entity {

  protected _data                           : ITweetData | undefined

  protected _icon                           : string | undefined = TWITTER_LOGO

  protected _group                          : number = 1

  protected _tweetEntities                  : TweetEntitiesCollection | undefined

  protected _publicMetrics                  : TweetPublicMetrics | undefined

  protected _contextAnnotations             : TweetContextAnnotationCollection | undefined

  protected _author                         : UserAuthor | undefined

  protected _source                         : TweetSource | undefined

  protected _mediaCollection                : MediaCollection | undefined

  /**
   * constructor
   *
   * @param data {ITweetData | undefined}
   */

  constructor(data?: ITweetData) {

    // Call parent constructor
    super( constants.TWITTER_TWEET_TYPE_ID, data?.id )



    // load tweet data
    if (data) {
      this.loadData(data)
    }
  }

  /**
   * _getEntitiesID
   * 
   * @private
   * @returns {string}
   */

  private _getEntitiesID(): string {
    return this.getID() + constants.SEP + constants.TWITTER_ENTITIES_ID_PREFIX
  }

  private _getPublicMetricsID(): string {
    return this.getID() + constants.SEP + constants.TWITTER_PUBLIC_METRICS_ID_PREFIX
  }

  private _getContextAnnotationsID(): string {
    return this.getID() + constants.SEP + constants.TWITTER_TWEET_CONTEXT_ANNOTATION_ID
  }

  private _getTweetTextID(): string {
    return this.getID() + constants.SEP + 'text'
  }

  private _getTweetSourceID(): string {
    return this.getID() + constants.SEP + 'source'
  }

  private _createTweetTextNode(): IGraphNode {
    return createNode(this._getTweetTextID(), this.getLabel(), 2, this.getText(), '', this.getType(), this.getGroup(), this.url)
  }

  private _createTweetTextLink(): IGraphLink {
    return createLink(this.getID(), this._getTweetTextID(), this.getText())
  }

  private _getTweetUrl(): string {
    const authorID = this.getAuthorID()
    let url = ''
    if (authorID) {
      url = buildTweetUrl(this._id, authorID)
    }
    return url
  }

  /**
   * url
   */

  get url(): string {
    return this._getTweetUrl()
  }

  /**
   * getLabel
   *
   * @returns {string}
   */

  public getLabel(): string {
    return ''
  }

  public getText(): string {
    return (this._data && this._data.text) ? this._data.text : ''
  }

  public getGroup(): number {
    return (this._group) ? this._group : 0
  }

  /**
   * getType
   *
   * @returns {string}
   */

  public getType(): string {
    return constants.TWITTER_TWEET_TYPE_ID
  }

  /**
   * getNode
   *
   * @returns {IGraphNode}
   */

  public getNode(): IGraphNode {
    return createNode(this.getID(), '', 10, this.getText(), this.getIcon(),  this.getType(), this.getGroup(), this.url)
  }

  /**
   * getGraphData
   *
   * @param targetNodeID {string}
   * @returns {IGraphData}
   */

  public getGraphData(targetNodeID?: string): IGraphData {

    // Create empty object to populate graph data
    let graphData: IGraphData = createGraphDataObject()

    // Add main base tweet node
    graphData.nodes.push( this.getNode() )

    // Check if root link is present and if so add graph data
    if (targetNodeID) {
      graphData.links.push ( this.getLink(targetNodeID) )
    } else {
      // Create tweet text node
      graphData.nodes.push( this._createTweetTextNode() )
      graphData.links.push ( this._createTweetTextLink() )
    }
  
    // Get entities
    if (this._tweetEntities) {
      graphData = mergeGraphData(graphData, this._tweetEntities.getGraphData(this.getID()) )
    }

    // Get Public Metrics
    if (this._publicMetrics) {
      graphData = mergeGraphData(graphData, this._publicMetrics.getGraphData(this.getID()) )
    }

    // Get Context Annotations
    if (this._contextAnnotations) {
      graphData = mergeGraphData(graphData, this._contextAnnotations.getGraphData(this.getID()) )
    }

    // Get Author User
    if (this._author) {
      graphData = mergeGraphData(graphData, this._author.getGraphData(this.getID()))
    }

    // Get source
    if (this._source) {
      graphData = mergeGraphData(graphData, this._source.getGraphData(this.getID()))
    }
    
    // Media Attachments
    if (this._mediaCollection) {
      graphData = mergeGraphData(graphData, this._mediaCollection.getGraphData(this.getID()))
    }

    return graphData
  }

  /**
   * loadData
   *
   * @param data {ITweetData}
   * @returns {Tweet}
   */

  public loadData = (data: ITweetData): Tweet => {

    // Store data
    this._data = data

    this._id = this._data.id
    
    // Load Entities
    if (this._data.entities) {
      this._tweetEntities = new TweetEntitiesCollection( this._getEntitiesID() ).loadData( this._data.entities )
    }

    // Load Public metrics
    if (this._data.public_metrics) {
      this._publicMetrics = new TweetPublicMetrics( this._getPublicMetricsID() ).loadData( this._data.public_metrics )
    }

    // Load Context Annotations
    if (this._data.context_annotations) {
      this._contextAnnotations = new TweetContextAnnotationCollection(this._data.context_annotations, this._getContextAnnotationsID())
    }

    // Load source
    if (this._data.source) {
      this._source = new TweetSource(this._data.source, this._getTweetSourceID())
    }

    return this
  }

  /**
   * setAuthor
   *
   * @param author {UserAuthor}
   * @returns {Tweet}
   */

  public setAuthor = (author: UserAuthor): Tweet => {
    this._author = author
    return this
  }

  /**
   * grtAuthor
   *
   * @returns {UserAuthor | undefined}
   */

  public getAuthor = (): UserAuthor | undefined => {
    return this._author
  }

  /**
   * getAuthorID
   *
   * @returns {string | undefined}
   */

  public getAuthorID = (): string | undefined => {
    return (this._data) ? this._data.author_id : undefined
  }


  /**
   * setMediaCollection
   *
   * @param mediaCollection {MediaColleciton}
   * @returns {Tweet}
   */

  public setMediaCollection = (mediaCollection: MediaCollection): Tweet => {
    this._mediaCollection = mediaCollection
    return this
  }

  /**
   * getMediaCollection
   *
   * @returns {MediaCollection}
   */

  public getMediaCollection = (): MediaCollection | undefined => {
    return this._mediaCollection
  }

  /**
   * getMediaAttchmentIDs
   *
   * @returns {string[]}
   */

  public getMediaAttchmentIDs = (): string[] => {
    return (this._data && this._data.attachments && this._data.attachments.media_keys) ? this._data.attachments.media_keys : []
  }
}