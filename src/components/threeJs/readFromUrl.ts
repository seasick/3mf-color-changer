import { ThreeMFLoader } from 'three/examples/jsm/loaders/3MFLoader.js';

export default async function readFromUrl(
  url: string
): Promise<THREE.Group<THREE.Object3DEventMap>> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Could not load 3MF file');
  }

  const contents = await response.arrayBuffer();
  const loader = new ThreeMFLoader();
  const object = loader.parse(contents);

  return object;
}
