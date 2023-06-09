/**
 * Bundles together the predefined callback factories.
 *
 * <br>
 * <img
 * src =
 * "https://raw.githubusercontent.com/wiki/hcilab/wams/graphs/predefined.png"
 * style = "max-height: 150px;"
 * >
 *
 * @module predefined
 */

'use strict';

const items = require('./predefined/items.js');
const layouts = require('./predefined/layouts.js');
const utilities = require('./predefined/utilities.js');
const actions = require('./predefined/actions.js');
const routing = require('./predefined/routing.js');

module.exports = Object.freeze({
  actions,
  items,
  layouts,
  utilities,
  routing,
});
