/**
 * EventsGraphNode
 */

class EventsGraphNode {

  constructor(id, label = null, group = null, val = null, desc = null, icon = null) {

    this._id = id;
    this._label = label;
    this._group = group;
    this._val = val;
    this._desc = desc;
    this._icon = icon;

  }

  getData() {
    return {
      id: this._id,
      label: this._label,
      group: this._group,
      val: this._val,
      desc: this._desc,
      icon: this._icon
    };
  }
}