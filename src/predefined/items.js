'use strict';

const { CanvasSequence } = require('canvas-sequencer');
const { Circle, Oval, Polygon2D, Rectangle, RoundedLine } = require('../shared.js');

/**
 * Factories for predefined items.
 *
 * @namespace items
 * @memberof module:predefined
 */

/**
 * Provides an image description, complete with a hitbox only if both 'width'
 * and 'height' properties are present. Note that the hitbox will be
 * rectangular, with the top left corner at the 'x' and 'y' coordinates.
 *
 * @memberof module:predefined.items
 *
 * @param {string} src - Route path to the image.
 * @param {Object} properties - Location and orientation options for the image
 * item. See {@link module:shared.Item} members for available parameters.
 *
 * @returns {Object} An object with the parameters for an image item using the
 * given source.
 */
function image(src, properties = {}) {
  let hitbox = null;
  if ('width' in properties && 'height' in properties) {
    hitbox = new Rectangle(properties.width, properties.height);
  }
  const type = 'item/image';
  return { src, hitbox, type, ...properties };
}

/**
 * Generate a line segment item.
 *
 * @memberof module:predefined.items
 *
 * @param {number} dx - length of the x portion of the line
 * @param {number} dy - length of the y portion of the line
 * @param {number} [width=1] - The width of the line.
 * @param {string} [colour='black'] - The colour of the line.
 * @param {Object} properties - Location and orientation options for the item.
 * See {@link module:shared.Item} members for available parameters.
 *
 * @returns {Object} An object with the parameters for a line item with the
 * given endpoints, width, and colour.
 */
function line(dx, dy, width = 1, colour = 'black', properties = {}) {
  const hitbox = new RoundedLine(0, 0, dx, dy, width);
  const sequence = new CanvasSequence();
  sequence.strokeStyle = colour;
  sequence.lineWidth = width;
  sequence.lineCap = 'round';
  sequence.beginPath();
  sequence.moveTo(0, 0);
  sequence.lineTo(dx, dy);
  sequence.stroke();
  return { hitbox, sequence, type: 'item', ...properties };
}

/**
 * Generate a rectangular block item centered on the x, y coordinates given in `properties`.
 *
 * @memberof module:predefined.items
 *
 * @param {number} width
 * @param {number} height
 * @param {string} [colour='blue'] - Fill colour for the rectangle.
 * @param {Object} properties - Location and orientation options for the item.
 * See {@link module:shared.Item} members for available parameters.
 *
 * @returns {Object} An object with the parameters for a rectangular item with
 * the given width and height, filled in with the given colour.
 */
function rectangle(width, height, colour = 'blue', properties = {}) {
  const x = 0 - width / 2; // Relative -- WAMS handles positioning
  const y = 0 - height / 2; // Relative -- WAMS handles positioning
  const hitbox = new Rectangle(width, height, x, y);
  const sequence = new CanvasSequence();
  sequence.fillStyle = colour;
  sequence.strokeStyle = 'black';
  sequence.beginPath();
  sequence.rect(x, y, width, height);
  sequence.fill();
  sequence.stroke();
  return { hitbox, sequence, type: 'item', ...properties };
}

/**
 * Generate a square block item centered on the x, y coordinates given in `properties`.
 *
 * @memberof module:predefined.items
 *
 * @param {number} length
 * @param {string} [colour='red'] - Fill colour for the square.
 * @param {Object} properties - Location and orientation options for the item.
 * See {@link module:shared.Item} members for available parameters.
 *
 * @returns {Object} An object with the parameters for a square item with the
 * given side length, filled in with the given colour.
 */
function square(length, colour = 'red', properties = {}) {
  return rectangle(length, length, colour, properties);
}

/**
 * Generate a circle item.
 *
 * @memberof module:predefined.items
 *
 * @param {number} radius
 * @param {string} [colour='yellow'] - Fill colour for the circle.
 * @param {Object} properties - Location and orientation options for the item.
 * See {@link module:shared.Item} members for available parameters.
 *
 * @returns {Object} An object with the parameters for a circle item with the
 * given radius, filled in with the given colour.
 */
function circle(radius, colour = 'yellow', properties = {}) {
  const hitbox = new Circle(radius, 0, 0);
  const sequence = new CanvasSequence();
  sequence.fillStyle = colour;
  sequence.strokeStyle = 'black';
  sequence.beginPath();
  sequence.arc(
    0, // x  -- WAMS handles positioning
    0, // y  -- WAMS handles positioning
    radius,
    0, // startAngle
    2 * Math.PI // endAngle  -- WAMS handles rotation
  );
  sequence.fill();
  sequence.stroke();
  return { hitbox, sequence, type: 'item', ...properties };
}

/**
 * Generate an oval item.
 *
 * @memberof module:predefined.items
 *
 * @param {number} radiusX
 * @param {number} radiusY
 * @param {string} [colour='yellow'] - Fill colour for the oval.
 * @param {Object} properties - Location and orientation options for the item.
 * See {@link module:shared.Item} members for available parameters.
 *
 * @returns {Object} An object with the parameters for an oval item.
 */
function oval(radiusX, radiusY, colour = 'yellow', properties = {}) {
  const hitbox = new Oval(radiusX, radiusY);
  const sequence = new CanvasSequence();
  sequence.fillStyle = colour;
  sequence.strokeStyle = 'black';
  sequence.beginPath();
  sequence.ellipse(
    0, // x  -- WAMS handles positioning
    0, // y  -- WAMS handles positioning
    radiusX,
    radiusY,
    0, // rotation -- WAMS handles rotation
    0, // startAngle
    2 * Math.PI // endAngle
  );
  sequence.fill();
  sequence.stroke();
  return { hitbox, sequence, type: 'item', ...properties };
}

/**
 * Generate a polygonal item.
 *
 * @memberof module:predefined.items
 *
 * @param {module:shared.Point2D[]} points - Not necessarily actual Point2D
 * objects, can just be objects with x and y properties.
 * @param {string} [colour='green'] - Fill colour for the polygon.
 * @param {Object} properties - Location and orientation options for the item.
 * See {@link module:shared.Item} members for available parameters.
 *
 * @returns {Object} An object with the parameters for a generic polygon, filled
 * in with the given colour.
 */
function polygon(points = [], colour = 'green', properties = {}) {
  if (points.length < 3) throw Error('Polygon must consist of at least 3 points');
  const hitbox = new Polygon2D(points);
  const sequence = new CanvasSequence();
  sequence.fillStyle = colour;
  sequence.strokeStyle = 'black';
  sequence.beginPath();
  sequence.moveTo(points[0].x, points[0].y);
  points.forEach((p) => sequence.lineTo(p.x, p.y));
  sequence.closePath();
  sequence.fill();
  sequence.stroke();
  return { hitbox, sequence, type: 'item', ...properties };
}

/**
 * Generate a rectangular element.
 *
 * @memberof module:predefined.items
 *
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @param {Object} properties - Location and orientation options for the item,
 * plus any appropriate attributes.
 * See {@link module:shared.WamsElement} members for available parameters.
 *
 * @returns {Object} An object with the parameters for a rectangular item with
 * the given width and height, filled in with the given colour.
 */
function element(x, y, width, height, properties = {}) {
  const hitbox = new Rectangle(width, height, x, y);
  return { hitbox, type: 'item/element', ...properties };
}

/**
 * Generate an item that wraps the given html.
 *
 * @memberof module:predefined.items
 *
 * @param {number} width
 * @param {number} height
 * @param {Object} properties - Location and orientation options for the item,
 * plus any appropriate attributes.
 * See {@link module:shared.WamsElement} members for available parameters.
 *
 * @returns {Object} An object with the parameters for an iframe with the given
 * HTML content.
 */
function html(html, width, height, properties = {}) {
  const baseattrs = properties.attributes || {};
  delete properties.attributes;
  return {
    hitbox: new Rectangle(width, height),
    attributes: {
      ...baseattrs,
      innerHTML: html,
    },
    tagname: 'div',
    type: 'item/element',
    ...properties,
  };
}

module.exports = {
  circle,
  element,
  image,
  line,
  oval,
  polygon,
  rectangle,
  square,
  html,
};
