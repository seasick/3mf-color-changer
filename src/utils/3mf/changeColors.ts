import {
  BlobReader,
  BlobWriter,
  TextReader,
  TextWriter,
  ZipReader,
  ZipWriter,
} from '@zip.js/zip.js';

import getFace from '../threejs/getFace';
import getFaceColor from '../threejs/getFaceColor';
import { addColorGroup } from './addColorGroup';

export type Face = {
  v1: THREE.Vector3;
  v2: THREE.Vector3;
  v3: THREE.Vector3;
};

/* Applies the color changes to a given 3MF file and returns the content blob of the new file */
export async function changeColors(
  file: File,
  object: THREE.Object3D
): Promise<Blob> {
  // Unzip the used 3mf file
  const zipFileWriter = new BlobWriter();
  const zipFileReader = new BlobReader(file);
  const zipWriter = new ZipWriter(zipFileWriter);
  const zipReader = new ZipReader(zipFileReader);
  const entries = await zipReader.getEntries();
  let nextId = 100; // TODO

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

      object.traverse((child) => {
        const mesh = child as THREE.Mesh;

        if (!mesh.isMesh) {
          return;
        }
        const geometry = mesh.geometry;
        const attributes = geometry.attributes;

        // Find the object in the 3MF file that matches the mesh
        const obj = findObjectByName(xmlDoc, mesh.name);

        if (obj) {
          const triangles = Array.from(obj.getElementsByTagName('triangle'));
          const colorGroup: string[] = [];

          // Get the color of the mesh
          if (mesh.material.color) {
            colorGroup.push(`#${mesh.material.color.getHexString()}`);
          }

          // Go through all faces
          for (let i = 0; i < attributes.position.count / 3; ++i) {
            const face = getFace(mesh, i);
            const triangleIdx = findTriangleIndex(obj, face);

            // Find the color of the face
            const color = getFaceColor(mesh, face);

            // Add the color to the color group
            if (!colorGroup.includes(color)) {
              colorGroup.push(color);
            }

            // Set the pid and p1 attributes on the triangle
            triangles[triangleIdx].setAttribute('pid', nextId.toString());
            triangles[triangleIdx].setAttribute(
              'p1',
              colorGroup.findIndex((c) => c === color).toString()
            );
          }

          // It seems that in some cases, setting the color on the model is necessary. Otherwise
          // the color of the faces is not applied to the object. I don't know why this is the case.
          obj.setAttribute('pid', '100');
          obj.setAttribute('pindex', '0');

          addColorGroup(xmlDoc, colorGroup, nextId.toString());
          ++nextId;
        }
      });

      // TODO Remove unused colors and color groups

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
  const multiple = {
    v1: [] as number[],
    v2: [] as number[],
    v3: [] as number[],
  };

  const check = (x: number, y: number, z: number, face) => {
    return (
      Math.abs(x - face.x) < 0.01 &&
      Math.abs(y - face.y) < 0.01 &&
      Math.abs(z - face.z) < 0.01
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
      multiple.v1.push(i);
    }
    if (check(x, y, z, face.v2)) {
      multiple.v2.push(i);
    }
    if (check(x, y, z, face.v3)) {
      multiple.v3.push(i);
    }
  }

  let found;

  for (const v1 of multiple.v1) {
    for (const v2 of multiple.v2) {
      for (const v3 of multiple.v3) {
        if (found) {
          break;
        }

        found = mesh.querySelector(
          `triangle[v1="${v1}"][v2="${v2}"][v3="${v3}"]`
        );
      }
    }
  }

  if (!found) {
    throw new Error(
      'Could not determine correct triangle for coloring during 3MF modification'
    );
  }

  return triangles.indexOf(found!);
}
