import * as THREE from 'three';

import { getFaceCount } from './getFaceCount';

export default function changeMeshColor(mesh: THREE.Mesh, color: string) {
  const facesCount = getFaceCount(mesh);
  const filledArray: number[] = [];
  const threeColor = new THREE.Color(color);

  for (let i = 0; i < facesCount; ++i) {
    filledArray.push(threeColor.r, threeColor.g, threeColor.b);
  }

  // TODO The mesh color shouldn't be stored in the geometry, but in the material.
  //  But that would require to make the user aware that there is material collor and vertex colors.

  const attribute = new THREE.BufferAttribute(new Float32Array(filledArray), 3);
  attribute.needsUpdate = true;

  // Fill the color buffer with the new color
  mesh.geometry.setAttribute('color', attribute);
  mesh.material.vertexColors = true;
  mesh.material.needsUpdate = true;
}
