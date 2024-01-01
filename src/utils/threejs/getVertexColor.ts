import * as THREE from 'three';

export default function getVertexColor(
  mesh: THREE.Mesh,
  face: THREE.Face
): string {
  if (!face || !mesh.geometry.attributes.color) {
    return '#FFFFFF';
  }

  const threeColor = new THREE.Color(
    mesh.geometry.attributes.color.getX(face.a),
    mesh.geometry.attributes.color.getY(face.b),
    mesh.geometry.attributes.color.getZ(face.b)
  );

  return `#${threeColor.getHexString()}`;
}
