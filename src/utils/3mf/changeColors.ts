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
export type ChangedColors = {
  [objectName: string]: Color;
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
            const colorGroup = addColorGroup(xmlDoc, [colors[key]]);
            obj.setAttribute('pid', colorGroup);
            obj.setAttribute('pindex', '0');

            // If vertices already have a color, it has to be removed from the file.
            // Otherwise, the color on the object wouldn't change.
            const vertices = obj.querySelectorAll('triangle');
            vertices.forEach((vertex) => {
              vertex.removeAttribute('pid');
              vertex.removeAttribute('p1');
            });
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
