'use strict';

const { removeById, Message } = require('../shared.js');
const ServerItemGroup = require('./ServerItemGroup.js');
const ServerElement = require('./ServerElement.js');
const ServerImage = require('./ServerImage.js');
const ServerItem = require('./ServerItem.js');

/**
 * The WorkSpace keeps track of items, and can handle events on those items
 * which allow them to be interacted with.
 *
 * @private
 * @memberof module:server
 *
 * @param {Namespace} namespace - Socket.io namespace for publishing changes.
 */
class WorkSpace {
  constructor(namespace) {
    /**
     * Socket.io namespace in which to operate.
     *
     * @type {Namespace}
     */
    this.namespace = namespace;

    /**
     * Track all items in the workspace.
     *
     * @type {module:server.ServerItem[]}
     */
    this.items = [];
  }

  /**
   * Looks for an unlocked item at the given coordinates and returns the first
   * one that it finds, or none if no unlocked items are found.
   *
   * @param {number} x x coordinate at which to look for items.
   * @param {number} y y coordinate at which to look for items.
   *
   * @return {?module:server.ServerItem} A free item at the given coordinates,
   * or null if there is none.
   */
  findFreeItemByCoordinates(x, y) {
    return this.items.find((i) => !i.isLocked() && i.containsPoint(x, y));
  }

  /**
   * Looks for any item at the given coordinates.
   *
   * @param {number} x - x coordinate at which to look for items.
   * @param {number} y - y coordinate at which to look for items.
   *
   * @return {?module:server.ServerItem} An item at the given coordinates, or
   * null if there is none.
   */
  findItemByCoordinates(x, y) {
    return this.items.find((i) => i.containsPoint(x, y));
  }

  /**
   * Gives a lock on the item at (x,y) or view itself to the view.
   *
   * @param {number} x - x coordinate at which to look for items.
   * @param {number} y - y coordinate at which to look for items.
   * @param {module:server.ServerView} view - View that will receive a lock on
   * the item/view.
   * @return {module:server.ServerItem|module:server.ServerView|module:server.ServerViewGroup}
   * The item that was locked.
   */
  obtainLock(x, y, view) {
    const item = this.findFreeItemByCoordinates(x, y) || view;
    const itemClass = item.constructor.name;
    if (itemClass !== 'ServerView' && itemClass !== 'ServerViewGroup') {
      if (this._canLock(item)) {
        if (!item.lockZ) {
          this.raiseItem(item);
        }
        view.obtainLockOnItem(item);
        return item;
      }
    }
    view.obtainLockOnItem(view);
    return view;
  }

  _canLock(item) {
    // Instead of choosing some arbitrary subset of events that allow locking,
    // consider any item with any kind of event listeners as lockable. It's
    // still automagical but less opinionated.
    return item.eventNames().length > 0;
  }

  /**
   * Raises item above others and notifies subscribers.
   *
   * @param {*} item
   */
  raiseItem(item) {
    const highestItem = this.items[0];
    // don't raise if item is already on top
    if (highestItem.id === item.id) return;
    this.bringItemToTop(item.id);
    item.publish();
  }

  /**
   * Bring item to top, so that it's above others.
   *
   * @param {number} id
   */
  bringItemToTop(id) {
    const index = this.items.findIndex((el) => el.id === id);
    if (index < 0) throw new Error("Couldn't find item by id");
    this.items.unshift(...this.items.splice(index, 1));
  }

  /**
   * Remove the given item from the workspace.
   *
   * @param {module:server.ServerItem} item - Item to remove.
   *
   * @return {boolean} true if the item was located and removed, false
   * otherwise.
   */
  removeItem(item) {
    if (removeById(this.items, item)) {
      item.unlock();
      this.namespace.emit(Message.RM_ITEM, { id: item.id });
    }
  }

  /**
   * @return {module:shared.Item[]} Serialize the workspace items.
   */
  toJSON() {
    return this.items.map((o) => o.toJSON());
  }

  /**
   * Spawn a new workspace object of the given type, with the given values.
   *
   * @param {object} item - the item to add.
   *
   * @return {object} The object.
   */
  addItem(item) {
    this.items.unshift(item);
    return item;
  }

  /**
   * Spawn a new element with the given values.
   *
   * @param {object} values - Values describing the element to spawn.
   *
   * @return {module:server.ServerElement} The newly spawned element.
   */
  spawnElement(values = {}) {
    const item = new ServerElement(this.namespace, values);
    this.addItem(item);
    this.namespace.emit(Message.ADD_ELEMENT, item);
    return item;
  }

  /**
   * Spawn a new image with the given values.
   *
   * @param {object} values - Values describing the image to spawn.
   *
   * @return {module:server.ServerImage} The newly spawned image.
   */
  spawnImage(values = {}) {
    const item = new ServerImage(this.namespace, values);
    this.addItem(item);
    this.namespace.emit(Message.ADD_IMAGE, item);
    return item;
  }

  /**
   * Spawn a new item with the given values.
   *
   * @param {object} values - Values describing the item to spawn.
   *
   * @return {module:server.ServerItem} The newly spawned item.
   */
  spawnItem(values = {}) {
    const item = new ServerItem(this.namespace, values);
    this.addItem(item);
    this.namespace.emit(Message.ADD_ITEM, item);
    return item;
  }

  /**
   * Create a group for existing items in the workspace.
   *
   * @param {any} values properties for the group
   */
  createItemGroup(values) {
    const group = new ServerItemGroup(this.namespace, values);
    return this.addItem(group);
  }
}

module.exports = WorkSpace;
