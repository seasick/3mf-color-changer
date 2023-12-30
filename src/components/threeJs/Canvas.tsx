import {
  CameraControls,
  Center,
  ContactShadows,
  GizmoHelper,
  GizmoViewcube,
} from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import React from 'react';

import { Environment } from './Environment';
import Model from './Model';

type Props = JSX.IntrinsicElements['group'] & {
  geometry: any;
  onSelect: (e) => void;
};

export default function ThreeJsCanvas({ geometry, onSelect }: Props) {
  return (
    <Canvas
      shadows
      camera={{
        fov: 35,
        zoom: 1.3,
        near: 0.1,
        far: 1000,
        position: [6, 6, 6],
      }}
    >
      <ContactShadows frames={1} />
      <CameraControls />
      <Environment />
      <Center>
        <Model
          geometry={geometry}
          onClick={(e) => {
            onSelect(e);
            e.stopPropagation();
          }}
        />
      </Center>
      <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
        <GizmoViewcube />
      </GizmoHelper>
    </Canvas>
  );
}
