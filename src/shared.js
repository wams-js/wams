/**
 * This module contains classes and functions intended for use by both the
 * client and the server, in order to provide a common interface.
 *
 * <br>
 * <img
 * src =
 * "https://raw.githubusercontent.com/wiki/hcilab/wams/graphs/shared.png"
 * style = "max-height: 250px;"
 * >
 *
 * @private
 * @module shared
 */

'use strict';

const IdStamper = require('./shared/IdStamper.js');
const Message = require('./shared/Message.js');
const bases = require('./shared/bases.js');
const utilities = require('./shared/utilities.js');
const Polygon2D = require('./shared/Polygon2D.js');
const Point2D = require('./shared/Point2D.js');
const Rectangle = require('./shared/Rectangle.js');
const RoundedLine = require('./shared/RoundedLine.js');
const Circle = require('./shared/Circle.js');
const Oval = require('./shared/Oval.js');

/**
 * This object stores a set of core constants for use by both the client and
 *  the server.
 *
 * @memberof module:shared
 * @enum {number}
 */
const constants = {
  // General constants
  ROTATE_0: 0,
  ROTATE_90: Math.PI / 2,
  ROTATE_180: Math.PI,
  ROTATE_270: Math.PI * 1.5,
  ROTATE_360: Math.PI * 2,

  // Namespaces
  /** @type {string} */
  NS_WAMS: '/wams',
  NS_WAMS_TRACKING: '/',
};

/**
 * A list of colours, for use by the API for shadows, and by end-point apps too
 * if desired.
 *
 * @memberof module:shared
 * @type {string[]}
 */
const colours = [
  'saddlebrown',
  'red',
  'blue',
  'lime',
  'darkorange',
  'purple',
  'yellow',
  'aqua',
  'darkgreen',
  'fuchsia',
];

/*
 * Package up the module and freeze it for delivery.
 */
module.exports = Object.freeze({
  colours,
  constants,
  Circle,
  Oval,
  IdStamper,
  Message,
  Point2D,
  Polygon2D,
  Rectangle,
  RoundedLine,
  ...bases,
  ...utilities,
});
