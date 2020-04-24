class Utils {
  static loadJSON (url, callback, errorcb) {   

    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', url, true); // Replace 'my_data' with the path to your file
    xobj.onerror = function () {
      errorcb();
    };
    xobj.onreadystatechange = function () {
        if (xobj.readyState == 4 && xobj.status == "200") {
          // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
          callback(xobj.responseText);
        } else if (xobj.status == 0) {
          errorcb();
        }
    };
    xobj.send(null);  
 }

 static IDSeperator() {
   return "-";
 }
}