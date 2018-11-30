/*
 * WAMS code to be executed in the client browser.
 *
 * Author: Michael van der Kamp
 *  |-> Date: July/August 2018
 *
 * Original author: Jesse Rolheiser
 * Other revisions and supervision: Scott Bateman
 *
 * The ClientView class is used for all rendering activities on the client
 * side. This is essentially the view in an MVC-esque design.
 */

'use strict';

const ClientItem = require('./ClientItem.js');
const ShadowView = require('./ShadowView.js');
const { 
  constants: globals,
  mergeMatches, 
  removeById,
  IdStamper, 
  Message,
  View,
} = require('../shared.js');

const DEFAULTS = Object.freeze({
  x: 0,
  y: 0,
  rotation: globals.ROTATE_0,
  scale: 1,
  type: 'view/background',
});

const STATUS_KEYS = Object.freeze([
  'x',
  'y',
  'width',
  'height',
  'effectiveWidth',
  'effectiveHeight',
  'rotation',
  'scale',
]);

const REQUIRED_DATA = Object.freeze([
  'id',
  'items',
  'views',
]);

const STAMPER = new IdStamper();

const symbols = Object.freeze({
  align:        Symbol('align'),
  drawItems:    Symbol('drawItems'),
  drawShadows:  Symbol('drawShadows'),
  drawStatus:   Symbol('drawStatus'),
  wipe:         Symbol('wipe'),
});

/**
 * The ClientView is responsible for rendering the view. To do this, it keeps
 * track of its own position, scale, and orientation, as well as those values
 * for all items and all other views (which will be represented with outlines).
 */
class ClientView extends View {
  /**
   * values: Data for initializing this view. Likely does not come from the
   *         server, as communication lines probably won't be open yet at the
   *         time that this class is instantiated.
   */
  constructor(values = {}) {
    super(mergeMatches(DEFAULTS, values));

    /**
     * The CanvasRenderingContext2D is required for drawing (rendering) to take
     * place.
     */
    if (values.context) this.context = values.context;
    else throw 'ClientView requires a CanvasRenderingContext2D!';

    /**
     * All the items in the model, which may all need rendering at some point.
     * Kept up to date via the ClientController.
     */
    this.items = [];

    /**
     * The shadows are all the other views that are currently active. They are
     * tracked in full and an outline for each is rendered.
     */
    this.shadows = [];

    // As no draw loop is used, (there are no animations), need to know when to
    // re-render in response to an image loading.
    document.addEventListener( Message.IMG_LOAD, this.draw.bind(this) );
  }

  /**
   * Positions the rendering context precisely, taking into account all
   * transformations, so that rendering can proceed correctly.
   */
  [symbols.align]() {
    /*
     * WARNING: It is crucially important that the instructions below occur
     * in *precisely* this order!
     */
    this.context.scale(this.scale, this.scale);
    this.context.rotate(this.rotation);
    this.context.translate(-this.x, -this.y);
  }
  
  /**
   * Renders all the items.
   */
  [symbols.drawItems]() {
    this.items.forEach( o => o.draw(this.context) );
  }

  /**
   * Renders outlines of all the other views.
   */
  [symbols.drawShadows]() {
    this.shadows.forEach( v => v.draw(this.context) );
  }

  /**
   * Renders text describing the status of the view to the upper left corner of
   * the view, to assist with debugging.
   */
  [symbols.drawStatus]() {
    const messages = STATUS_KEYS
      .map( k => `${k}: ${this[k].toFixed(2)}` )
      .concat([`# of Shadows: ${this.shadows.length}`]);
    let ty = 40;
    let tx = 20;

    this.context.save();
    this.context.setTransform(1,0,0,1,0,0);
    this.context.font = '18px Georgia';
    messages.forEach( m => {
      this.context.fillText(m, tx, ty);
      ty += 20;
    });
    this.context.restore();
  }

  /**
   * Clears all previous renders, to ensure a clean slate for the upcoming
   * render.
   */
  [symbols.wipe]() {
    this.context.clearRect(0, 0, window.innerWidth, window.innerHeight);
  }

  /**
   * Generate and store an Item with the given values.
   *
   * values: state of the item
   */
  addItem(values) {
    this.items.push(new ClientItem(values));
  }

  /**
   * Generate and store a 'shadow view' to track another active view.
   *
   * values: state of the View.
   */
  addShadow(values) {
    this.shadows.push(new ShadowView(values));
  }

  /**
   * Fully render the current state of the system.
   */
  draw() {
    this.context.save();
    this[symbols.wipe]();
    this[symbols.align]();
    this[symbols.drawItems]();
    this[symbols.drawShadows]();
    this[symbols.drawStatus]();
    this.context.restore();
  }

  /**
   * Handle a message from the ClientController.
   *
   * message: The type of message.
   * ...args: The arguments to be passed to the ultimate message handling
   *          function.
   */
  handle(message, ...args) {
    this[message](...args);
    this.draw();
  }

  /**
   * Message handler. Removes the given item.
   *
   * item: The Item to remove.
   */
  removeItem(item) {
    return removeById( this.items, item );
  }

  /**
   * Message handler. Removes the given 'shadow' view.
   *
   * shadow: The 'shadow' view to remove.
   */
  removeShadow(shadow) {
    return removeById( this.shadows, shadow );
  }

  /**
   * Fill all available space in the window.
   */
  resizeToFillWindow() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.effectiveWidth = this.width / this.scale;
    this.effectiveHeight = this.height / this.scale;
  }

  /**
   * Set up the internal copy of the model according to the data provided by the
   * server.
   *
   * data: The data from the server detailing the current state of the model.
   *       See REQUIRED_DATA. If any is missing, something has gone terribly
   *       wrong, and an exception will be thrown.
   */
  setup(data) {
    REQUIRED_DATA.forEach( d => {
      if (!data.hasOwnProperty(d)) throw `setup requires: ${d}`;
    });
    STAMPER.cloneId(this, data.id);
    data.views.forEach( v => v.id !== this.id && this.addShadow(v) );
    data.items.forEach( o => this.addItem(o) );
  }

  /**
   * Intended for use as an internal helper function, so that this functionality
   * does not need to be defined twice for both of the items and shadows arrays.
   *
   * container: Array containing the object to update.
   * data     : Data with which an object in the container will be updated.
   *            Note that the object is located using an 'id' field on this data
   *            object.
   */
  update(container, data) {
    const object = this[container].find( o => o.id === data.id );
    if (object) object.assign(data);
    else console.warn(`Unable to find in ${container}: id: `, data.id);
  }

  /**
   * Update an item.
   *
   * data: data from the server, has an 'id' field with which the item will be
   *       located.
   */
  updateItem(data) {
    this.update('items', data);
  }

  /**
   * Update a 'shadow' view.
   *
   * data: data from the server, has an 'id' field with which the view will be
   *       located.
   */
  updateShadow(data) {
    this.update('shadows', data);
  }
}

module.exports = ClientView;
