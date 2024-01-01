import {
  CameraControls,
  ContactShadows,
  GizmoHelper,
  GizmoViewcube,
} from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import React from 'react';

import { Environment } from './Environment';
import Model from './Model';

type Props = JSX.IntrinsicElements['group'] & {
  geometry: THREE.Object3D;
  onSelect: (e) => void;
  onPointerOverModel: (e) => void;
  onPointerOutModel: (e) => void;
};

export default function ThreeJsCanvas({
  geometry,
  onSelect,
  onPointerOverModel,
  onPointerOutModel,
}: Props) {
  const [mouseIsDown, setMouseIsDown] = React.useState(false);

  const handleClick = (e) => {
    onSelect(e);
    e.stopPropagation();
  };
  const handlePointerDown = (e) => {
    setMouseIsDown(true);
    e.stopPropagation();
  };
  const handlePointerUp = (e) => {
    setMouseIsDown(false);
    e.stopPropagation();
  };

  const handlePointerOver = (e) => {
    onPointerOverModel(e);
    e.stopPropagation();
  };
  const handlePointerOut = (e) => {
    onPointerOutModel(e);
    e.stopPropagation();
  };
  const handlePointerMove = (e) => {
    if (mouseIsDown) {
      if (e.buttons === 0) {
        setMouseIsDown(false);
      } else {
        // TODO We might need to debounce here
        onSelect(e);
      }
    }
  };

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
      {/* 3 frames, because the model is centered in the second frame, the third frame is just for safe measure */}
      <ContactShadows frames={3} />
      {!mouseIsDown && <CameraControls />}
      <Environment />
      <Model
        geometry={geometry}
        onClick={handleClick}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerMissed={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onPointerMove={handlePointerMove}
      />
      <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
        <GizmoViewcube />
      </GizmoHelper>
    </Canvas>
  );
}
