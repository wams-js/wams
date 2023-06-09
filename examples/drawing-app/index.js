/*
 * This is an advanced example showing a collaborative drawing application.
 * Several users can connect to an infinite space, they can move around the space
 * and draw on it with different colors and line widths.
 */

const express = require('express');
const path = require('path');

// Normally this would be `require('wams')`, but here we'll use the local version
const WAMS = require('../..');
const { CanvasSequence } = require('canvas-sequencer');
const { actions, items, routing } = WAMS.predefined;

const COLOR_MAP = {
  red: '#D12C1F',
  orange: '#EF9135',
  yellow: '#FBEE4F',
  green: '#377F34',
  blue: '#1E4CF5',
  grey: '#808080',
  black: '#000',
};

const WIDTH_MAP = {
  thin: 10,
  medium: 20,
  thick: 40,
};

class DrawingApp {
  constructor() {
    this.router = express();
    // Route to WAMS client build
    this.router.use(express.static(path.join(__dirname, '..', '..', 'dist')));
    this.router.use(express.static(path.join(__dirname, 'static')));

    this.wamsApp = new WAMS.Application(
      {
        applySmoothing: false,
        maximizeCanvas: false,
      },
      this.router
    );

    this.viewPencilColors = {};
    this.viewPencilWidths = {};
    this.previousEvents = {};
    this.boundDown = this.down.bind(this);
    this.boundMove = this.move.bind(this);
    this.boundUp = this.up.bind(this);
  }

  setColor({ color, view }) {
    this.viewPencilColors[view] = COLOR_MAP[color];
  }

  setWidth({ width, view }) {
    this.viewPencilWidths[view] = WIDTH_MAP[width];
  }

  initListeners() {
    this.wamsApp.on('set-control', this.updateControlType.bind(this));
    this.wamsApp.on('set-color', this.setColor.bind(this));
    this.wamsApp.on('set-width', this.setWidth.bind(this));
    this.wamsApp.on('connect', this.handleConnect.bind(this));
  }

  down(event) {
    this.previousEvents[event.pointerId] = { ...event };
    this.draw(event);
  }

  move(event) {
    if (this.previousEvents[event.pointerId]) {
      this.draw(event);
    }
  }

  up(event) {
    if (this.previousEvents[event.pointerId]) {
      this.draw(event);
    }
    delete this.previousEvents[event.pointerId];
  }

  draw(event) {
    const color = this.viewPencilColors[event.view] || 'black';
    const width = this.viewPencilWidths[event.view] || 20;
    const previous = this.previousEvents[event.pointerId];
    this.previousEvents[event.pointerId] = { ...event };
    const fromX = previous.x;
    const fromY = previous.y;
    const toX = event.x;
    const toY = event.y;
    this.wamsApp.workspace.spawnItem(
      items.line(
        toX - fromX, // X length of line
        toY - fromY, // Y length of line
        width,
        color,
        { x: fromX, y: fromY }
      )
    );
  }

  updateControlType({ type, view }) {
    this.controlType = type;
    view.removeAllListeners('drag');
    if (type === 'pan') {
      view.on('drag', actions.drag);
      view.on('pinch', constrainedZoom);
      view.on('rotate', actions.rotate);
      // view.off('drag', this.boundDraw);
      view.off('pointerdown', this.boundDown);
      view.off('pointermove', this.boundMove);
      view.off('pointerup', this.boundUp);
    } else {
      view.off('drag', actions.drag);
      view.off('pinch', constrainedZoom);
      view.off('rotate', actions.rotate);
      view.on('pointerdown', this.boundDown);
      view.on('pointermove', this.boundMove);
      view.on('pointerup', this.boundUp);
    }
  }

  handleConnect({ view }) {
    view.on('drag', actions.drag);
    view.on('pinch', constrainedZoom);
    view.on('rotate', actions.rotate);
    this.setColor({ color: 'red', view });
    this.setWidth({ width: 'medium', view });
  }
}

function constrainedZoom(event) {
  const targetScale = event.target.scale;
  const deltaScale = event.scale;
  if ((deltaScale > 1 && targetScale < 3) || (deltaScale < 1 && targetScale > 0.1)) {
    actions.pinch(event);
  }
}

// eslint-disable-next-line
const drawingApp = new DrawingApp();
drawingApp.initListeners();
routing.listen(drawingApp.wamsApp.httpServer);
