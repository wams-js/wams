/*
 * WAMS - An API for Multi-Surface Environments
 *
 * Author: Michael van der Kamp
 *  |-> Date: July/August 2018
 *
 * Original author: Jesse Rolheiser
 * Other revisions and supervision: Scott Bateman
 */

'use strict';

const { mergeMatches, IdStamper, Item } = require('../shared.js');
const { Lockable, Transformable2D } = require('../mixins.js');

const STAMPER = new IdStamper();

/**
 * The ServerItem provides operations for the server to locate and move items
 * around.
 *
 * @memberof module:server
 * @extends module:shared.Item
 * @mixes module:mixins.Transformable2D
 * @mixes module:mixins.Lockable
 */
class ServerItem extends Lockable(Transformable2D(Item)) {
  /**
   * @param {Object} values - User-supplied data detailing the item. Properties
   * on this object that line up with {@link module:shared.Item} members will be
   * stored. Any other properties will be ignored.
   */
  constructor(values = {}) {
    super(mergeMatches(ServerItem.DEFAULTS, values));

    // Items need to be uniquely identifiable.
    STAMPER.stampNewId(this);
  }

  /**
   * Checks whether a point with the given x,y coordinates is contained by this
   * item.
   *
   * @param {number} x - x coordinate of the point to check.
   * @param {number} y - y coordinate of the point to check.
   *
   * @return {boolean} True if the (x,y) point is located inside this Item.
   * False otherwise.
   */
  containsPoint(x, y) {
    return this.hitbox && this.hitbox.contains({
      x: x - this.x,
      y: y - this.y,
    });
  }

  /**
   *
   * @param {number} x - x coordinate of the point to check.
   * @param {number} y - y coordinate of the point to check.
   *
   * @return {boolean} True if the (x,y) point is located inside this Item, and
   * this Item is not currently locked. False otherwise.
   */
  isFreeItemAt(x, y) {
    return !this.locked && this.containsPoint(x, y);
  }

  /*
   * Rotate the item by the given amount (in radians).
   *
   * @override
   */
  rotateBy(radians, px, py) {
    super.rotateBy(radians, px, py);
    this.hitbox && this.hitbox.rotate(radians);
  }

  /*
   * Scale the item by the given amount.
   *
   * @override
   */
  scaleBy(ds = 1, mx, my) {
    super.scaleBy(ds, mx, my);
    this.hitbox && this.hitbox.scale(ds);
  }
}

/**
 * The default values for a ServerItem.
 *
 * @type {Object}
 */
ServerItem.DEFAULTS = Object.freeze({
  x:         0,
  y:         0,
  hitbox:    null,
  rotation:  0,
  scale:     1,
  type:      'item/foreground',
  imgsrc:    '',
  blueprint: null,
});

module.exports = ServerItem;

