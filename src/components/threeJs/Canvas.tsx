import {
  CameraControls,
  ContactShadows,
  GizmoHelper,
  GizmoViewcube,
} from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import React from 'react';
import * as THREE from 'three';

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
        // TODO It happens sometimes that camera control is tried to be attached, but it is already attached
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

  const tweenCamera = (position: THREE.Vector3) => {
    const point = new THREE.Spherical().setFromVector3(
      new THREE.Vector3(position.x, position.y, position.z)
    );
    cameraControlRef.current!.rotateTo(point.theta, point.phi, true);
    cameraControlRef.current!.fitToSphere(geometry, true);
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
        <GizmoViewcube
          onClick={(e) => {
            e.stopPropagation();
            if (
              e.eventObject.position.x === 0 &&
              e.eventObject.position.y === 0 &&
              e.eventObject.position.z === 0
            ) {
              tweenCamera(e.face!.normal);
            } else {
              tweenCamera(e.eventObject.position);
            }
            return null;
          }}
        />
      </GizmoHelper>
    </Canvas>
  );
}
