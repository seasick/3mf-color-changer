import * as THREE from 'three';

type Neighbors = number[][];

export default async function findFaceNeighbors(
  mesh: THREE.Mesh,
  onProgress?: (progress: number) => void
): Promise<Neighbors> {
  const promise = new Promise<Neighbors>((resolve) => {
    (async () => {
      // const start = Date.now();

      // Find all neighbors for each face and store them in `userdata`.
      // The index of the face is the faceId, and the value is an array of neighbors,
      // defined by their faceId.
      const faces = [] as Neighbors;
      const positions = mesh.geometry.attributes.position;
      // let minFaceId = 0;

      for (let faceId = 0; faceId < positions.count; faceId += 3) {
        const neighbors = await getNeighborFaces(
          mesh,
          faceId,
          faceId + 1,
          faceId + 2,
          0
        );
        faces[faceId / 3] = neighbors.filter(
          (neighbor) => neighbor !== faceId / 3
        );

        onProgress && onProgress(faceId / positions.count / 3);
      }

      // console.log(`Finding neighbors took ${Date.now() - start}ms`);
      resolve(faces);
    })();
  });

  return promise;
}

async function getNeighborFaces(
  mesh: THREE.Mesh,
  a: number,
  b: number,
  c: number,
  minFaceId = 0
): Promise<number[]> {
  return new Promise<number[]>((resolve) => {
    setTimeout(async () => {
      const positions = mesh.geometry.attributes.position;
      const verts = {
        v1: new THREE.Vector3().fromBufferAttribute(positions, a),
        v2: new THREE.Vector3().fromBufferAttribute(positions, b),
        v3: new THREE.Vector3().fromBufferAttribute(positions, c),
      };
      const neighbors = [] as number[];

      for (let i = minFaceId * 3; i < positions.count; i += 3) {
        const faceId = i / 3;

        // Go through the edges of the face
        for (let j = 0; j < 3; ++j) {
          const p0 = new THREE.Vector3().fromBufferAttribute(
            mesh.geometry.attributes.position,
            i + j
          );
          const p1 = new THREE.Vector3().fromBufferAttribute(
            mesh.geometry.attributes.position,
            i + ((j + 1) % 3)
          );

          if (
            (p0.equals(verts.v1) && p1.equals(verts.v2)) ||
            (p0.equals(verts.v2) && p1.equals(verts.v1)) ||
            (p0.equals(verts.v2) && p1.equals(verts.v3)) ||
            (p0.equals(verts.v3) && p1.equals(verts.v2)) ||
            (p0.equals(verts.v3) && p1.equals(verts.v1)) ||
            (p0.equals(verts.v1) && p1.equals(verts.v3))
          ) {
            neighbors.push(faceId);
            break;
          }
        }
      }
      resolve(neighbors);
    }, 1);
  });
}
