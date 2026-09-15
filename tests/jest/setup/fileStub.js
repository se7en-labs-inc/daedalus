/*
 * Binary assets imported as modules.
 *
 * Webpack turns a `.png` import into a URL string through asset/resource. Jest
 * has no such rule, so the file reaches the transform chain as bytes and fails
 * to parse. Screen containers reach these through their components: the display
 * settings screen imports nine theme preview images before it renders anything.
 *
 * `.svg` is handled separately by svg-jest, which returns a component rather
 * than a string, because the application renders inline SVGs as elements.
 */
module.exports = 'test-file-stub';
