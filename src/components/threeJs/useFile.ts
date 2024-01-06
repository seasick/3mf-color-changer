import { useEffect, useState } from 'react';
import * as THREE from 'three';

import findFaceNeighborsJob from '../../jobs/findFaceNeighbors';
import { useJobContext } from '../JobProvider';
import readFromFile from './readFromFile';
import readFromUrl from './readFromUrl';

export default function useFile(
  file: File | string | undefined
): [THREE.Object3D | null, (object: THREE.Object3D | null) => void] {
  const [object, setObject] = useState<THREE.Object3D | null>(null);
  const jobContext = useJobContext();

  // TODO Somehow this useeffect is called twice although the file didn't change.
  useEffect(() => {
    (async () => {
      if (!file) {
        return;
      }

      let object;

      if (typeof file === 'string') {
        object = await readFromUrl(file);
      } else {
        object = await readFromFile(file);
      }

      object.rotation.set(-Math.PI / 2, 0, 0); // z-up conversion

      // Objects are way too big, scale them down. Most likely this is because 3MF files are
      // using mm as the unit, and we're using <idk>.
      object.scale.set(0.01, 0.01, 0.01);

      object.traverse(function (child) {
        child.castShadow = true;
        child.receiveShadow = true;

        if (child.isMesh) {
          // Check if we have a color attribute on the geometry. If we do, we
          // can assume that the model has vertex colors.
          const geometry = child.geometry as THREE.BufferGeometry;
          const attributes = geometry.attributes;

          child.material = new THREE.MeshLambertMaterial({
            color: 0xffffff,
            vertexColors: !!attributes.color,
            flatShading: true,
          });

          if (child.geometry.index) {
            child.geometry = geometry.toNonIndexed();
          }

          jobContext.addJob(findFaceNeighborsJob(child));
        }
      });

      setObject(object);
    })();
  }, [file]);

  return [object, setObject];
}
