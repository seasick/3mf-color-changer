import {
  BlobReader,
  BlobWriter,
  TextReader,
  TextWriter,
  ZipReader,
  ZipWriter,
} from '@zip.js/zip.js';

import { addColorGroup } from './addColorGroup';

type Color = string;
export type Face = {
  v1: THREE.Vector3;
  v2: THREE.Vector3;
  v3: THREE.Vector3;
};
export type ChangedColor = {
  mesh: Color;
  vertex?: {
    faceIndex: number;
    face: Face;
    color: Color;
  }[];
};
export type ChangedColors = {
  [objectName: string]: ChangedColor;
};

/* Applies the color changes to a given 3MF file and returns the content blob of the new file */
export async function changeColors(
  file: File,
  colors: ChangedColors
): Promise<Blob> {
  // Unzip the used 3mf file
  const zipFileWriter = new BlobWriter();
  const zipFileReader = new BlobReader(file);
  const zipWriter = new ZipWriter(zipFileWriter);
  const zipReader = new ZipReader(zipFileReader);
  const entries = await zipReader.getEntries();

  // Loop through all entries and add them to the new zip file. If the entry is the
  // 3dmodel.model file, we will change the colors.
  for (const entry of entries) {
    // If it's not the 3dmodel.model file, we just add it to the new zip file
    if (!entry.filename.endsWith('3dmodel.model')) {
      const writer = new BlobWriter();
      const data = await entry.getData!(writer);
      await zipWriter.add(entry.filename, new BlobReader(data));

      continue;
    }

    const writer = new TextWriter();

    if (entry.getData) {
      const data = await entry.getData(writer);
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(data, 'text/xml');

      // Check if the namespace for the material extension is loaded
      const namespace = xmlDoc.querySelector('xmlns\\:m');
      if (!namespace) {
        xmlDoc
          .getElementsByTagName('model')[0]
          .setAttribute(
            'xmlns:m',
            'http://schemas.microsoft.com/3dmanufacturing/material/2015/02'
          );
      }

      // Loop through all objects that have a color change and add a color group for each
      Object.keys(colors).forEach((key) => {
        const obj = findObjectByName(xmlDoc, key);

        if (obj) {
          // Accumulate all unique colors
          const colorSet = getUniqueColors(colors[key]);

          // Add the colors as a group
          const colorGroup = addColorGroup(xmlDoc, colorSet);

          // Fetch all triangles to later set their color
          const triangles = Array.from(obj.getElementsByTagName('triangle'));

          // Check if the colors of all triangles are the same. If so, we can set
          // the color on the object instead of the individual triangles.
          if (colorSet.length === 1) {
            obj.setAttribute('pid', colorGroup);
            obj.setAttribute('pindex', '0');
          }

          for (const vertex of colors[key].vertex || []) {
            // Find the index of the vertex in the existing list
            const triangleIdx = findTriangleIndex(obj, vertex.face);

            triangles[triangleIdx].setAttribute('pid', colorGroup);
            triangles[triangleIdx].setAttribute(
              'p1',
              colorSet.findIndex((color) => color === vertex.color).toString()
            );
          }
        }
      });

      // Save the file
      const serializer = new XMLSerializer();
      const xmlString = serializer.serializeToString(xmlDoc);

      await zipWriter.add(entry.filename, new TextReader(xmlString));
    } else {
      throw new Error('ZIP entry does not have a getData method');
    }
  }

  // Download the file
  await zipWriter.close();

  // Get the data blob and return it
  return zipFileWriter.getData();
}

function getUniqueColors(colors: ChangedColor): string[] {
  const colorSet = new Set<string>();

  // Add the mesh color
  if (colors.mesh) {
    colorSet.add(colors.mesh);
  }

  // Add all vertex colors
  colors.vertex?.forEach((vertex) => {
    colorSet.add(vertex.color);
  });

  return [...colorSet];
}

function findObjectByName(xmlDoc: Document, name: string): Element | null {
  const object = xmlDoc.querySelector(`object[name="${name}"]`);

  // If we don't find an object with the given name, we check if there is only one
  // object in the file. If so, we can assume that this is the object we want to
  // modify.
  if (!object) {
    const objects = xmlDoc.querySelectorAll('object');
    if (objects.length === 1) {
      return objects[0];
    }
  }

  return object;
}

function findTriangleIndex(mesh: Element, face: Face): number {
  // I have vertices in the 3MF file, and I have coordinates from ThreeJS.
  // The coordinates in the 3MF file can have different precision then the ones
  // from ThreeJS. So I need to find the vertex in the 3MF file that matches the
  // coordinates from ThreeJS. I do this by looping through all vertices and
  // comparing the coordinates. I get all vertices for the face and can find the index
  // of the triangle in the list.
  const vertices = Array.from(mesh.getElementsByTagName('vertex'));
  const triangles = Array.from(mesh.getElementsByTagName('triangle'));
  const coords = { v1: 0, v2: 0, v3: 0 };

  const check = (x: number, y: number, z: number, face) => {
    return (
      x.toFixed(4) === face.x.toFixed(4) &&
      y.toFixed(4) === face.y.toFixed(4) &&
      z.toFixed(4) === face.z.toFixed(4)
    );
  };

  // Loop through all vertices
  for (let i = 0; i < vertices.length; ++i) {
    const vertex = vertices[i];

    const x = parseFloat(vertex.getAttribute('x')!);
    const y = parseFloat(vertex.getAttribute('y')!);
    const z = parseFloat(vertex.getAttribute('z')!);

    // Check if the coordinates match
    if (check(x, y, z, face.v1)) {
      coords.v1 = i;
    } else if (check(x, y, z, face.v2)) {
      coords.v2 = i;
    } else if (check(x, y, z, face.v3)) {
      coords.v3 = i;
    }
  }

  const found = mesh.querySelector(
    `triangle[v1="${coords.v1}"][v2="${coords.v2}"][v3="${coords.v3}"]`
  );

  if (!found) {
    throw new Error(
      'Could not determine correct vertex for coloring during 3MF modification'
    );
  }

  return triangles.indexOf(found!);
}
