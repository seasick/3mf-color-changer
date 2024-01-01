import * as THREE from 'three';

import { getFaceCount } from './getFaceCount';

export default function changeVertexColor(
  mesh: THREE.Mesh,
  color: string,
  face: THREE.Face
) {
  const threeColor = new THREE.Color(color);

  if (!mesh.geometry.attributes.color) {
    const facesCount = getFaceCount(mesh);
    const filledArray: number[] = [];
    const currentColor = new THREE.Color(0xffffff);

    for (let i = 0; i < facesCount; ++i) {
      filledArray.push(currentColor.r, currentColor.g, currentColor.b);
    }

    const attribute = new THREE.BufferAttribute(
      new Float32Array(filledArray),
      3
    );

    // Fill the color buffer with the new color
    mesh.geometry.setAttribute('color', attribute);

    // TODO It would be better to change the material here,
    // instead of creating a new one. Couldn't figure that out yet.
    mesh.material = new THREE.MeshLambertMaterial({
      color: 0xffffff,
      vertexColors: true,
      flatShading: true,
    });
  }

  for (const f of [face.a, face.b, face.c]) {
    mesh.geometry.attributes.color.setXYZ(
      f,
      threeColor.r,
      threeColor.g,
      threeColor.b
    );
  }

  mesh.geometry.attributes.color.needsUpdate = true;
}
