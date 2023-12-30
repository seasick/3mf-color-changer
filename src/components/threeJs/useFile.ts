import { useEffect, useState } from 'react';
import * as THREE from 'three';
import { ThreeMFLoader } from 'three/examples/jsm/loaders/3MFLoader.js';

export default function useFile(
  file: File | string | undefined
): [THREE.Object3D | null, (object: THREE.Object3D | null) => void] {
  const [object, setObject] = useState<THREE.Object3D | null>(null);

  useEffect(() => {
    if (!file) {
      return;
    }

    const afterEffect = (object) => {
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
          if (attributes.color) {
            child.material = new THREE.MeshBasicMaterial({
              vertexColors: true,
            });
          }
        }
      });

      setObject(object);
    };

    if (typeof file === 'string') {
      readFromUrl(file, afterEffect);
    } else {
      readFromFile(file, afterEffect);
    }
  }, [file]);

  return [object, setObject];
}

function readFromFile(file: File, callback: (object: THREE.Object3D) => void) {
  const reader = new FileReader();

  reader.addEventListener('load', (event) => {
    if (!event.target) {
      return;
    }

    const contents = event.target.result as ArrayBuffer;
    const loader = new ThreeMFLoader();
    const object = loader.parse(contents);

    callback(object);
  });

  reader.readAsArrayBuffer(file);
}

function readFromUrl(url: string, callback: (object: THREE.Object3D) => void) {
  fetch(url).then(async (response) => {
    const contents = await response.arrayBuffer();
    const loader = new ThreeMFLoader();
    const object = loader.parse(contents);

    callback(object);
  });
}
