/**
 * Utils
 * 
 * @static true
 * @summary Main object for holding utility functions used by the application
 * @exports {Object}
 */

export default {

  /**
   * loadJSON
   *
   * @param url 
   * @param callback 
   * @param errorcb 
   */

  loadJSON (url, callback, errorcb) {   
    let xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', url, true);
    xobj.onerror = () => errorcb();
    xobj.onreadystatechange = () => {
        if (xobj.readyState == 4 && xobj.status == "200") {

          callback(xobj.responseText);
        } else if (xobj.status == 0) {
          errorcb();
        }
    };
    xobj.send(null); 
  },

  /**
   * IDSeperator
   */

  IDSeperator() {
    return "-";
  }
};