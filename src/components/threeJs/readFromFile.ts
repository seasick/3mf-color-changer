import { ThreeMFLoader } from 'three/examples/jsm/loaders/3MFLoader.js';

export default function readFromFile(
  file: File
): Promise<THREE.Group<THREE.Object3DEventMap>> {
  const promise = new Promise<THREE.Group<THREE.Object3DEventMap>>(
    (resolve, reject) => {
      const reader = new FileReader();

      reader.addEventListener('load', (event) => {
        if (!event.target) {
          return;
        }

        const contents = event.target.result as ArrayBuffer;
        const loader = new ThreeMFLoader();
        const object = loader.parse(contents);

        resolve(object);
      });

      reader.addEventListener('error', (event) => {
        reject(event);
      });

      reader.readAsArrayBuffer(file);
    }
  );

  return promise;
}
