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
  const cameraControlRef = React.useRef<CameraControls | null>(null);

  // Handle the click on a mesh
  const handleClick = (e) => {
    e.stopPropagation();
    onSelect(e);
  };

  // Handles the mouse down on a mesh
  const handlePointerDown = (e) => {
    e.stopPropagation();
    setMouseIsDown(true);

    cameraControlRef.current?.disconnect();
  };

  // Handles the mouse up on a mesh, but is also used for missed & canceled
  const handlePointerUp = (e) => {
    e.stopPropagation();
    setMouseIsDown(false);

    cameraControlRef.current?.connect(
      document.getElementById('editor-canvas')!
    );
  };

  // Handles the mouse over on a mesh
  const handlePointerOver = (e) => {
    e.stopPropagation();
    onPointerOverModel(e);
  };

  // Handles the mouse out on a mesh
  const handlePointerOut = (e) => {
    e.stopPropagation();
    onPointerOutModel(e);
  };

  // Handles the mouse move on a mesh and on the canvas
  const handlePointerMove = (e) => {
    e.stopPropagation();

    if (mouseIsDown) {
      if (e.buttons === 0) {
        setMouseIsDown(false);
        cameraControlRef.current?.connect(
          document.getElementById('editor-canvas')!
        );
      } else if (e.object) {
        // TODO We might need to debounce here
        onSelect(e);
      }
    }
  };

  return (
    <Canvas
      id="editor-canvas"
      shadows
      camera={{
        fov: 35,
        zoom: 1.3,
        near: 0.1,
        far: 1000,
        position: [6, 6, 6],
      }}
      onMouseMove={handlePointerMove}
      frameloop="demand"
    >
      {/* 5 frames, because the model is centered in the second frame, the additional frames are just for safe measure */}
      <ContactShadows frames={5} />
      <CameraControls ref={cameraControlRef} />
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
