export function addColorGroup(xmlDoc: Document, colors: string[]) {
  const colorGroup = xmlDoc.createElement('m:colorgroup');
  const colorGroupId = findNextFreeId(xmlDoc).toString();
  colorGroup.setAttribute('id', colorGroupId);

  for (let i = 0; i < colors.length; i++) {
    const color = xmlDoc.createElement('m:color', {});
    color.setAttribute('color', colors[i]);
    colorGroup.appendChild(color);
  }

  xmlDoc.getElementsByTagName('resources')[0].appendChild(colorGroup);

  return colorGroupId;
}

let maxId = 100;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function findNextFreeId(xmlDoc: Document) {
  // TODO: This is not a good way to find a free id. We should instead look through the document
  return maxId++;
}
