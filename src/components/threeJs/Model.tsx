import React, { useEffect, useRef } from 'react';

type Props = JSX.IntrinsicElements['group'] & {
  geometry: THREE.Object3D;
  onLoad?: (e) => void;
};

export default function Model({ geometry, onLoad, onClick, ...props }: Props) {
  const groupRef = useRef<THREE.Group>();
  const meshRef = useRef();

  useEffect(() => {
    groupRef.current?.clear();
    groupRef.current?.add(geometry);
  }, [geometry]);

  return (
    // Center object
    <mesh ref={meshRef} castShadow receiveShadow onClick={onClick}>
      <group ref={groupRef}></group>
    </mesh>
  );
}
