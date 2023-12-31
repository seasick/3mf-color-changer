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
type FaceIndex = number;
type ChangedColor = {
  mesh: Color;
  vertex: {
    face: FaceIndex;
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
    if (entry.filename.endsWith('3dmodel.model')) {
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
          const obj = xmlDoc.querySelector(`object[name="${key}"]`);

          if (obj) {
            // Accumulate all unique colors
            const colorSet = getUniqueColors(colors[key]);

            // Add the colors as a group
            const colorGroup = addColorGroup(xmlDoc, colorSet);

            // Fetch all triangles to later set their color
            const triangles = obj.getElementsByTagName('triangle');

            if (colors[key].mesh) {
              obj.setAttribute('pid', colorGroup);
              obj.setAttribute('pindex', '0');
            }

            // TODO Check if the colors of all triangles are the same. If so, we can set the color
            //  on the object instead of the individual triangles.

            for (let vertex of colors[key].vertex) {
              triangles[vertex.face].setAttribute('pid', colorGroup);
              triangles[vertex.face].setAttribute(
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
    } else {
      const writer = new BlobWriter();
      const data = await entry.getData!(writer);
      await zipWriter.add(entry.filename, new BlobReader(data));
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
  colorSet.add(colors.mesh);

  // Add all vertex colors
  colors.vertex.forEach((vertex) => {
    colorSet.add(vertex.color);
  });

  return [...colorSet];
}
