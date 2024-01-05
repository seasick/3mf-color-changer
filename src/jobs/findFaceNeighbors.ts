import * as THREE from 'three';

import { Job } from '../components/JobProvider';
import ProgressPromise from '../utils/ProgressPromise';
import findFaceNeighbors from '../utils/threejs/findFaceNeighbors';

export const TYPE = 'findFaceNeighbors';

export default function findFaceNeighborsJob(object: THREE.Mesh): Job {
  const label = object.name ? `"${object.name}"` : 'the object';
  return {
    type: TYPE,
    label: `Find neighbors of ${label}`,
    promise: new ProgressPromise((resolve, reject, progress) => {
      const total = object.geometry.attributes.position.count / 3;
      let current = 0;

      findFaceNeighbors(object, () => {
        current += 1;
        progress(current / total);
      })
        .then((neighbors) => {
          object.userData.neighbors = neighbors;
          resolve();
        })
        .catch(reject);
    }),
  };
}
