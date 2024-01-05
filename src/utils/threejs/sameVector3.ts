export default function sameVector3(
  v1: THREE.Vector3,
  v2: THREE.Vector3,
  tolerance: number = 0.01
) {
  return (
    Math.abs(v1.x - v2.x) < tolerance &&
    Math.abs(v1.y - v2.y) < tolerance &&
    Math.abs(v1.z - v2.z) < tolerance
  );
}
