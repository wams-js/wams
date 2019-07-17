# WAMS: Workspaces Across Multiple Surfaces

[![dependencies Status](
https://david-dm.org/nick-baliesnyi/wams/status.svg)](
https://david-dm.org/nick-baliesnyi/wams)
[![devDependencies Status](
https://david-dm.org/nick-baliesnyi/wams/dev-status.svg)](
https://david-dm.org/nick-baliesnyi/wams?type=dev)
[![Maintainability](https://api.codeclimate.com/v1/badges/025f89d6de0c6677d142/maintainability)](https://codeclimate.com/github/nick-baliesnyi/wams/maintainability)

## Contents

* [Installation](#installation)
* [Examples](#examples)
* [Walkthrough](#walkthrough)
  * [Hello world](#hello-world)
  * [Set up your application](#set-up-your-application)
  * [Configuration](#configuration)
  * [Basics](#basics)
  * [Polygons](#polygons)
  * [Images](#images)
  * [HTML](#html)
  * [Interactivity](#interactivity)
  * [Client code and assets](#client-code-and-assets)
  * [Connections](#connections)  
  * [Advanced](#advanced)
    * [Custom items](#custom-items)
    * [Custom events](#custom-events)
    * [Interaction rights](#interaction-rights)
    * [Grouped items](#grouped-items)

## Installation

You will need to install [node.js](https://nodejs.org/en/). This should also
install `npm`. Once they are installed, go to your app folder, where you want to install `wams`
and run the following commands:

```bash
git clone https://github.com/nick-baliesnyi/wams.git
cd wams
npm install
```

## Examples

See the examples in `examples/`, and check the
[docs](https://mvanderkamp.github.io/wams/). The entry-point of a `wams` app is
the `Application` class.

To try out the examples (except the no-op "scaffold" example), run as follows:

```bash
node examples/[EXAMPLE_FILENAME]

## For example:

node examples/polygons.js
```

The `shared-polygons.js` example demonstrates multi-device gestures.

See a [live demo](https://wams-player-demo.herokuapp.com/) of a distributed video-player prototype built with Wams. Join it with a second device to control the video remotely.

## Walkthrough

This walkthrough is a friendly guide on how to use most features of Wams. For a detailed code documentation, see [this page](https://nick-baliesnyi.github.io/wams/).

### Hello world
The smallest Wams example looks something like this:
```javascript
const app = new Wams.Application();
const { square } = Wams.predefined.items;
app.spawn(square(200, 200, 100, 'green'));
app.listen(8080);
```

It creates a green square on the canvas with coordinates `{ x: 200, y: 200 }` and a length of `100` and starts the server on port `8080`. Now anyone can connect to the server and see the square.

> **Note** The examples on this page use ES2016 (ES6) JavaScript syntax like `const` variables and object desctructuring. If you are not familiar with ES2015 features, you can [read](https://webapplog.com/es6/) about them first.


### Set up your application

1. In the app folder, create your app server file, e.g. **server.js**
2. In the server file, include Wams and initialize the application
```javascript
// server.js
const Wams = require('./wams');
const app = new Wams.Application();
app.listen(8080);
```

Now, you can write your Wams code in this file.

### Configuration

To configure the application, you can pass a config object when initializing the `Application` class. 

Below is the full list of possible options with example values.

```javascript
const app = new Wams.Application({
  color:             'some-color',     // background color of the app's canvas
  clientLimit:       2,                // maximum number of devices that can connect to the server
  clientScripts:     ['script.js'],    // javascript scripts (relative paths or URLs) to include by the browser
  stylesheets:       ['styles.css'],   // css styles to include by the browser
  shadows:           true,             // show shadows of other devices
  // path to directory for static files, will be accessible at app's root
  staticDir:         path.join(__dirname, './static'),     
  status:            true,             // show information on current view, useful for debugging
  title:             'Awesome App',    // page title  
  useServerGestures: true,             // used for simultaneous interaction with single item from several devices
});
```

### Basics

A Wams app is made of **items**. There is a number of predefined items like:

- `square`
- `rectangle`
- `polygon`
- `image`
- `html`

Most of the items are used on HTML **canvas**, which is the core part of Wams.   You have already seen `square` used in the Hello world example above. Now let's look at some other items.

### Polygons

```javascript
// server.js

const points = [
  { x: 0, y: 0 },
  { x: 50, y: 0 },
  { x: 25, y: 50 },
];

app.spawn(polygon(points, 'green', {
  x: 500, y: 100,
}));
```

Polygons are built using an array of relative points. For a random set of points, you can use `randomPoints(<number>)` from `Wams.predefined.utilities`.

### Images

```javascript
// server.js

const app = Wams.Application({
  staticDir: path.join(__dirname, './images') 
  // app's root will serve static files from the `images` folder
})
const { image } = Wams.predefined.items;

// url resolves to <current-directory>/images/monaLisa.jpg
app.spawn(image('monaLisa.jpg', {
  width: 200, height: 350,
  x: 300, y: 300,
}));
```

To spawn a Wams image, dont't forget to include _width_ and _height_.

> **Example** To see a great example of using images, check out `examples/card-table.js`

### HTML
If you need more control over styling than canvas gives, or you would like to use `iframe`, `audio`, `video` or other browser elements apart from canvas, Wams also supports spawning **HTML** items.

```javascript
// server.js
const { html } = Wams.predefined.items;

app.spawn(html('<h1>Hello world!</h1>', 200, 100, {
  x: 300, y: 100,
}));
```

The code above will spawn a wrapped `h1` element with width of `200` and height of `100`, positioned at `{ x: 300, y: 100 }`.

### Scale and Rotation

You can set initial scale and rotation of an item:

```javascript
app.spawn(polygon(points, 'green', {
  x: 500, y: 100,
  scale: 2,
  rotation: Math.PI,
}));
```

> **Note** Rotation is defined in radians, not degrees, Pi = 180 deg


### Interactivity

> **Note** An item must have its coordinates, width and height defined to be interactive

Let's get back to our Hello world example with a green square. Just a static square is not that interesting, though. Let's make it **draggable**:
```javascript
...
app.spawn(square(200, 200, 100, 'green', {
  ondrag: Wams.predefined.drag,
}));
...
```
This looks much better. Now let's remove the square when you **click** on it. _To remove an item, use Wams' `removeItem` method._

```js
...
  ondrag: Wams.predefined.drag,
  onclick: handleClick,
}));

function handleClick(event) {
  app.removeItem(event.target)
}
...
```


Another cool interactive feature is **rotation**. To rotate an item, first add the `onrotate` handler and then grab the item with your mouse and hold **Control** key. 
```js
...
  ondrag: Wams.predefined.drag,
  onclick: handleClick,
  onrotate: Wams.predefined.rotate,
}));
...
```

To move an item, you can use `moveBy` and `moveTo` item methods:

```js
app.spawn(image('images/monaLisa.jpg', {
  width: 200, height: 300,
  onclick: handleClick,
}))

function handleClick(event) {
  event.target.moveBy(100, -50);
}
```

Both methods accept `x` and `y` numbers that represent a vector (for `moveBy`) or the final position (for `moveTo`).

_You can add event handlers to all Wams items._

### Client code and assets

Often times, you need to use some JavaScript code on the client, define custom styles with CSS files or include some images. 

- To include **.js** files with your app, create a file in your app folder and add the path to the file to your application config:

```javascript
const app = new Wams.Application({
  clientScripts: ['awesome-script.js']
});
```

- For **.css** files:

```javascript
const app = new Wams.Application({
  stylesheets: ['amazing-styles.css']
});
```

> **NOTE** Don't forget to include the static directory location in the `staticDir` property in the application config.

### Connections

Wams manages connections with clients under the hood, and provides helpful methods to react on **connection-related events**:

- `onconnect` – called each time a client connects to Wams server
- `ondisconnect` – called when client disconnects

Both methods accept a callback function, where you can act on the event. The callback function gets these arguments:

- `view` – current device's view object. Stores view's information and allows to locate, move, rescale the view
- `device` – physical position of current device
- `group` – server view group, used for multi-device gestures

Setting an `onconnect` callback  is often used to change the scale, rotation or position of a device. You can also set up `onclick`, `ondrag`, `onrotate` and `onscale` handlers for different clients' views. Same as with items, you can `moveBy` and `moveTo` views.

Combining view event handlers and methods, you can build complex layouts based on client's index. Wams has predefined layouts that you can use, such as `table` and `row`. Here's how you can use them:

```js
const setTableLayout = Wams.predefined.layouts.table(200);
function handleLayout(view) {
  setTableLayout(view);
}

app.onconnect(handleLayout);
```



## Advanced

When building more complex applications, sometimes you might want to have more flexibility and power than predefined items and behaviors provide. 

The following topics show how to go beyond that.

### Custom items

To spawn a custom item, use `CanvasSequence`. It allows to create a custom sequence of canvas actions on the server and safely execute it on the client. That means you can use most of the HTML Canvas methods as if you were writing regular browser code.

The following sequence draws a smiling face item:

```js
function smile(x, y) {
    const sequence = new Wams.CanvasSequence();

    sequence.beginPath();
    sequence.arc(75, 75, 50, 0, Math.PI * 2, true); // Outer circle
    sequence.moveTo(110, 75);
    sequence.arc(75, 75, 35, 0, Math.PI, false);  // Mouth (clockwise)
    sequence.moveTo(65, 65);
    sequence.arc(60, 65, 5, 0, Math.PI * 2, true);  // Left eye
    sequence.moveTo(95, 65);
    sequence.arc(90, 65, 5, 0, Math.PI * 2, true);  // Right eye
    sequence.stroke();
    
    return { sequence }
}


app.spawn(smile(900, 300));
```

To add interactivity to a custom item, you can use the same handlers as with predefined items (`ondrag`, `onlick` etc). However, you first need to add a _hitbox_ to the item:

```javascript
function customItem(x, y, width, height) {
  const hitbox = new Wams.Rectangle(width, height, x, y);
  const ondrag = Wams.predefined.drag;

  const sequence = new Wams.CanvasSequence();
  sequence.fillStyle = 'green';
  sequence.fillRect(x, y, width, height);

  return { hitbox, sequence, ondrag, }
}
```

A hitbox can be made from `Wams.Rectangle` or `Wams.Polygon2D`.

`Wams.Polygon2D` accepts an array of points – vertices of the resulting polygon.

### Custom events

Sometimes, you would like to tell devices to execute client-side code at a specific time. Or you would like to communicate some client-side event to the server. To allow that, Wams provides **custom events**.

##### From Client to Server

Let's say we would like to send a message from the client to the server. Wams methods are exposed to the client via the global `Wams` object.


To **dispatch a server event**, use `Wams.dispatch()` method:

```javascript
// client.js

Wams.dispatch('my-message', { foo: 'bar' });
```

This dispatches a custom event to the server called `my-message` and sends a payload object.

To **listen to this event on the server**, use `app.on()` method:

```javascript
// server.js

app.on('my-message', handleMyMessage);

function handleMyMessage(data) {
  console.log(data.foo); // logs 'bar' to the server terminal
}
```

##### From Server to Client

To **dispatch a client event** from the server, use `app.dispatch()` method.

```javascript
// server.js

app.dispatch('my-other-message', { bar: 'foo' });
```

To **listen to this event on the client**, use `Wams.on()` method:

```javascript
// client.js

Wams.on('my-other-message', handleMyOtherMessage);

function handleMyOtherMessage(data) {
  console.log(data.bar); // logs 'foo' to the browser console
}
```

*Under the hood*, client-side events are implemented with the DOM's [CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent). If you want to trigger a Wams client event _on the client_, you can dispatch a custom event on the document element.

### Interaction rights

To give different clients different rights for interacting with items, use `view.index` to differentiate between connected devices.

For example, let's say we are making a card game and would like to only allow a card owner to flip it.

To do that, first we'll add an index to the card item to show who its owner is.

```javascript
// during creation
let card = app.spawn(image(url, {
  /* ... */
  owner: 1,
}))

// or later
card.owner = 1;
```

> **NOTE** `owner` number property does not have special meaning. You can use any property of any type.

Now, we will only flip the card if the event comes from the card owner:


```javascript
function flipCard(event) {
  if (event.view.index !== event.target.owner) return; 

  const card = event.target;
  const imgsrc = card.isFaceUp ? card_back_path : card.face;
  card.setImage(imgsrc);
  card.isFaceUp = !card.isFaceUp;
}
```

### Grouped items

Sometimes you need to spawn several items and then move or drag them together. To do that easily, you can use the `createGroup` method:

```javascript
const items = [];

items.push(app.spawn(html('<h1>hello world</h1>', 300, 100, {
  x: 300,
  y: 300,
})));

items.push(app.spawn(square(100, 100, 200, 'yellow')));

items.push(app.spawn(square(150, 150, 200, 'blue')));

const group = app.createGroup({
  items,
  ondrag: true,
});

group.moveTo(500, 300);
```
