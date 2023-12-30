export function getColorFromMesh(mesh) {
  const colors = mesh.geometry.getAttribute('color');

  if (!colors) {
    return;
  }

  // Convert to hex string
  return rgbToHex(
    Math.floor(colors.getX(0) * 255),
    Math.floor(colors.getY(0) * 255),
    Math.floor(colors.getZ(0) * 255)
  );
}

export function rgbToHex(r, g, b) {
  return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

export function hexToRgb(hex) {
  hex = hex.replace('#', '');

  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  return [r, g, b];
}

function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? '0' + hex : hex;
}
