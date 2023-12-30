export function getFaceCount(mesh: THREE.Mesh) {
  const geometry = mesh.geometry as THREE.BufferGeometry;
  const index = geometry.index;

  if (index) {
    return index.count;
  }

  return mesh.geometry.getAttribute('position').count;
}
