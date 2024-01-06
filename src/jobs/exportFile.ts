import * as THREE from 'three';

import { Job } from '../components/JobProvider';
import { changeColors } from '../utils/3mf/changeColors';
import ProgressPromise from '../utils/ProgressPromise';
import createFileFromHttp from '../utils/createFileFromHttp';

export const TYPE = 'exportFile';

export default function exportFileJob(
  fileOrPath: string | File,
  object: THREE.Object3D
): Job {
  return {
    type: TYPE,
    label: `Exporting file`,
    progressVariant: 'indeterminate',
    promise: new ProgressPromise(async (resolve, reject) => {
      try {
        let file: File;
        if (typeof fileOrPath === 'string') {
          file = await createFileFromHttp(fileOrPath);
        } else {
          file = fileOrPath;
        }

        const blob = await changeColors(file, object!);
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.href = url;
        link.download = file.name || 'export.3mf';
        link.click();
      } catch (e) {
        reject(e);
      }

      resolve();
    }),
  };
}
