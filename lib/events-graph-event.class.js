/**
 * Events Graph Event Class
 */

class EventsGraphEvent {

  /**
   * constructor 
   * 
   * @param {EventsGraphLink} egLink 
   */

  constructor(egLink) {
    this._egLink = egLink;
    this._id = this._buildID();
  }

  /**
   * _buildID
   */

  _buildID () {
    return this.IDPrefix + Utils.IDSeperator() + this.IDPostFix;
  }

  /**
   * get id
   */

  get id() {
    return this._id;
  }

  /**
   * IDPrefix
   */

  get IDPrefix () {
    return 'egevent';
  }

  /**
   * IDPostFix
   */

  get IDPostFix () {
    return Date.now();
  }

  /**
   * get egLink
   */

  get egLink() {
    return this._egLink;
  }

  /**
   * set egLink
   * 
   * @param {EventsGraphLink} egLink 
   */

  set egLink(egLink) {
    this._egLink = egLink;
  }

  /**
   * getLinkData
   */

  getLinkData() {
    return this._egLink.getData();
  }

}