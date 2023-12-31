import React, { useEffect, useRef } from 'react';

type Props = JSX.IntrinsicElements['group'] & {
  geometry: THREE.Object3D;
};

export default function Model({ geometry, ...props }: Props) {
  const groupRef = useRef<THREE.Group>();
  const meshRef = useRef();

  useEffect(() => {
    groupRef.current?.clear();
    groupRef.current?.add(geometry);
  }, [geometry]);

  return (
    // Center object
    <mesh ref={meshRef} castShadow receiveShadow {...props}>
      <group ref={groupRef}></group>
    </mesh>
  );
}
