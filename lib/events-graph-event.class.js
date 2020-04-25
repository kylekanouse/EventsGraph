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
   * 
   * @returns {String}
   */

  _buildID () {
    return this.IDPrefix + Utils.IDSeperator() + this.IDPostFix;
  }

  /**
   * get id
   * 
   * @returns {String}
   */

  get id() {
    return this._id;
  }

  /**
   * IDPrefix
   * 
   * @returns {String}
   */

  get IDPrefix () {
    return 'egevent';
  }

  /**
   * IDPostFix
   * 
   * @returns {Date.now}
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
   * 
   * @returns {Object}
   */

  getLinkData() {
    return this._egLink.getData();
  }
}