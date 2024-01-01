import * as THREE from 'three';

/**
 * Performs a raycast from the camera in a circular pattern centered around
 * a given point.
 *
 * @param center - The center of the circle in screen coordinates.
 * @param radius - The radius of the circle in screen coordinates.
 * @param targetMesh - The mesh to perform the raycast against.
 * @param camera - The camera used for the raycasting.
 * @returns An array of intersections between the rays and the target mesh.
 */
export default function radiusRaycast(
  center: THREE.Vector2,
  radius: number,
  targetMesh: THREE.Mesh,
  camera: THREE.Camera
) {
  const raycaster = new THREE.Raycaster();
  const intersections: THREE.Intersection[] = [];

  // Perform raycasts from the center of the circle to its edges. The area must have
  // a good coverage, so we use a small degree step.
  generatePoints(center, radius).forEach(({ x, y }) => {
    raycaster.setFromCamera(new THREE.Vector2(x, y), camera);

    const intersects = raycaster.intersectObjects([targetMesh], false);

    // Only use the first intersection, it is the closest one and should therefor
    // be the camera facing surface
    if (intersects.length > 0) {
      intersections.push(intersects[0]);
    }
  });

  return intersections;
}

function generatePoints(center, radius) {
  const coordinates: { x: number; y: number }[] = [];

  for (let i = 0; i < 360; i += 5) {
    const angle = (i * Math.PI) / 180;
    const x = center.x + radius * Math.cos(angle);
    const y = center.y + radius * Math.sin(angle);

    coordinates.push({ x, y });
  }

  return coordinates;
}
