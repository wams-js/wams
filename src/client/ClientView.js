'use strict';

const { View } = require('../shared.js');

// Data fields to write for status indicator text.
const STATUS_KEYS = Object.freeze(['x', 'y', 'width', 'height', 'rotation', 'scale']);

// Mark these methods as intended only for internal use.
const symbols = Object.freeze({
  align: Symbol('align'),
  drawBackground: Symbol('dragBackground'),
  drawItems: Symbol('drawItems'),
  drawShadows: Symbol('drawShadows'),
  drawStatus: Symbol('drawStatus'),
  wipe: Symbol('wipe'),
});

// Default ClientView configuration.
const DEFAULT_CONFIG = Object.freeze({
  status: false,
  shadows: false,
});

/**
 * The ClientView is responsible for rendering the view. To do this, it keeps
 * track of its own position, scale, and orientation, as well as those values
 * for all items and all other views (which will be represented with outlines).
 *
 * @private
 * @memberof module:client
 * @extends module:shared.View
 *
 * @param {CanvasRenderingContext2D} context - The canvas context in which to
 * render the model.
 * @param {boolean} iOS - Whether the client is running on an iOS device.
 * @param {number} dpr - The device pixel ratio of the client.
 */
class ClientView extends View {
  constructor(context, iOS, dpr) {
    super(ClientView.DEFAULTS);

    /**
     * The CanvasRenderingContext2D is required for drawing (rendering) to take
     * place.
     *
     * @type {CanvasRenderingContext2D}
     */
    this.context = context;

    /**
     * Whether the client is running on an iOS device.
     *
     * @type {boolean}
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Browser_detection_using_the_user_agent}
     * @see {@link https://stackoverflow.com/questions/9038625/detect-if-device-is-ios}
     */
    this.iOS = iOS;

    /**
     * The device pixel ratio of the client.
     *
     * @type {number}
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio}
     * @see {@link https://stackoverflow.com/questions/16383503/window-devicepixelratio-does-not-work-in-ie-10-mobile}
     */
    this.dpr = dpr;

    /**
     * The model holds the information about items and shadows that need
     * rendering.
     *
     * @type {module:client.ClientModel}
     */
    this.model = null;

    /**
     * Configuration of ClientView that can be
     * modified in user-defined `window.WAMS_CONFIG`.
     *
     * @type {object}
     */
    this.config = { ...DEFAULT_CONFIG };
  }

  /**
   * Positions the rendering context precisely, taking into account all
   * transformations, so that rendering can proceed correctly.
   *
   * @alias [@@align]
   * @memberof module:client.ClientView
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
   *
   * @alias [@@drawItems]
   * @memberof module:client.ClientView
   */
  [symbols.drawItems]() {
    this.model.itemOrder.forEach((o) => o.draw(this.context, this));
  }

  /**
   * Renders outlines of all the other views.
   *
   * @alias [@@drawShadows]
   * @memberof module:client.ClientView
   */
  [symbols.drawShadows]() {
    this.model.shadows.forEach((v) => v.draw(this.context));
  }

  /**
   * Renders text describing the status of the view to the upper left corner of
   * the view, to assist with debugging.
   *
   * @alias [@@drawStatus]
   * @memberof module:client.ClientView
   */
  [symbols.drawStatus]() {
    const messages = STATUS_KEYS.map((k) => `${k}: ${this[k].toFixed(2)}`).concat([
      `# of Shadows: ${this.model.shadows.size}`,
    ]);
    let ty = 40;
    const tx = 20;

    this.context.save();
    this.context.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.context.font = '18px Georgia';
    messages.forEach((m) => {
      this.context.fillText(m, tx, ty);
      ty += 20;
    });
    this.context.restore();
  }

  /**
   * Clears all previous renders, to ensure a clean slate for the upcoming
   * render.
   *
   * @alias [@@wipe]
   * @memberof module:client.ClientView
   */
  [symbols.wipe]() {
    this.context.clearRect(0, 0, this.width, this.height);
  }

  /**
   * Fully render the current state of the system.
   */
  draw() {
    this.context.save();
    this[symbols.wipe]();
    this[symbols.align]();
    this[symbols.drawItems]();
    if (this.config.shadows) this[symbols.drawShadows]();
    if (this.config.status) this[symbols.drawStatus]();
    this.context.restore();
  }

  /**
   * Fill all available space in the window.
   */
  resizeToFillWindow() {
    this.resize(window.innerWidth, window.innerHeight);
  }

  /**
   * Fill the given width and height.
   */
  resize(width, height) {
    this.width = width;
    this.height = height;
    if (!this.iOS) {
      this.context.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    }
  }
}

module.exports = ClientView;
