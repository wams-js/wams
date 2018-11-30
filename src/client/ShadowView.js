/*
 * WAMS code to be executed in the client browser.
 *
 * Author: Michael van der Kamp
 *  |-> Date: July/August 2018
 *
 * Original author: Jesse Rolheiser
 * Other revisions and supervision: Scott Bateman
 *
 * The ShadowView class exposes a simple draw() function which renders a
 * shadowy outline of the view onto the canvas.
 */

/*
 * SOME NOTES ABOUT CANVAS RENDERING:
 *  - Avoid using shadows. They appear to kill the framerate.
 */

'use strict';

const { constants, IdStamper, View } = require('../shared.js');

const STAMPER = new IdStamper();
const COLOURS = [
  'saddlebrown',
  'red',
  'blue',
  'darkgreen',
  'orangered',
  'purple',
  'aqua',
  'lime',
];

// Symbols to mark these methods as intended for internal use only.
const symbols = Object.freeze({
  align:    Symbol('align'),
  style:    Symbol('style'),
  outline:  Symbol('outline'),
  marker:   Symbol('marker'),
});

/**
 * Track another active view and render an outline.
 */
class ShadowView extends View {
  /**
   * values: server-provided data describing this view.
   */
  constructor(values) {
    super(values);
    STAMPER.cloneId(this, values.id);
  }

  /**
   * Render an outline of this view.
   *
   * context: CanvasRenderingContext2D on which to draw.
   */
  draw(context) {
    /*
     * WARNING: It is *crucial* that this series of instructions be wrapped in
     * save() and restore().
     */
    context.save();
    this[symbols.align]   (context);
    this[symbols.style]   (context);
    this[symbols.outline] (context);
    this[symbols.marker]  (context);
    context.restore();
  }

  /**
   * Aligns the drawing context so the outline will be rendered in the correct
   * location with the correct orientation.
   */
  [symbols.align](context) {
    context.translate(this.x,this.y);
    context.rotate(constants.ROTATE_360 - this.rotation);
  }

  /**
   * Applies styling to the drawing context.
   */
  [symbols.style](context) {
    context.globalAlpha = 0.5;
    context.strokeStyle = COLOURS[this.id % COLOURS.length];
    context.fillStyle = context.strokeStyle;
    context.lineWidth = 5;
  }

  /**
   * Draws an outline of the view.
   */
  [symbols.outline](context) {
    context.strokeRect( 0, 0, this.effectiveWidth, this.effectiveHeight);
  }

  /**
   * Draws a small triangle in the upper-left corner of the outline, so that
   * other views can quickly tell which way this view is oriented.
   */
  [symbols.marker](context) {
    const base = context.lineWidth / 2;
    const height = 25;

    context.beginPath();
    context.moveTo(base,base);
    context.lineTo(base,height);
    context.lineTo(height,base);
    context.lineTo(base,base);
    context.fill();
  }
}

module.exports = ShadowView;
