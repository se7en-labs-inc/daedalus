/*
 * jsdom ships no canvas implementation, so `getContext` returns null.
 *
 * That is usually harmless, because nothing under test draws. `lottie-web` is
 * the exception: it builds a one-pixel canvas and writes to its 2d context at
 * import time (`lottie.js:1308-1313`), before any component has mounted. So the
 * syncing screen, which renders the animated logos, cannot even be imported
 * without this, and neither can any screen above it.
 *
 * The stub answers the calls rather than the drawing. Nothing asserts on pixels,
 * and a jsdom test that did would be asserting on something jsdom does not have.
 */
const noop = () => {};

const context2d = {
  fillStyle: '',
  strokeStyle: '',
  globalAlpha: 1,
  lineWidth: 1,
  font: '',
  canvas: null,
  beginPath: noop,
  clearRect: noop,
  clip: noop,
  closePath: noop,
  drawImage: noop,
  fill: noop,
  fillRect: noop,
  fillText: noop,
  lineTo: noop,
  moveTo: noop,
  restore: noop,
  rotate: noop,
  save: noop,
  scale: noop,
  setTransform: noop,
  stroke: noop,
  transform: noop,
  translate: noop,
  createImageData: (width, height) => ({
    width,
    height,
    data: new Uint8ClampedArray(width * height * 4),
  }),
  getImageData: (_x, _y, width, height) => ({
    width,
    height,
    data: new Uint8ClampedArray(width * height * 4),
  }),
  putImageData: noop,
  measureText: () => ({ width: 0 }),
};

if (typeof HTMLCanvasElement !== 'undefined') {
  HTMLCanvasElement.prototype.getContext = function getContext(type) {
    return type === '2d' ? { ...context2d, canvas: this } : null;
  };
  HTMLCanvasElement.prototype.toDataURL = () => '';
}
