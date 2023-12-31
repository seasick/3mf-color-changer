import Box from '@mui/material/Box';
import { ThreeEvent } from '@react-three/fiber';
import React, { useEffect } from 'react';
import { useLoaderData, useLocation } from 'react-router-dom';
import * as THREE from 'three';

import config from '../etc/config.json';
import exportFileJob from '../jobs/exportFile';
import changeFaceColor from '../utils/threejs/changeFaceColor';
import changeMeshColor from '../utils/threejs/changeMeshColor';
import getFace from '../utils/threejs/getFace';
import getFaceColor from '../utils/threejs/getFaceColor';
import sameVector3 from '../utils/threejs/sameVector3';
import { useJobContext } from './JobProvider';
import ModeSelector, { Mode } from './ModeSelector';
import PermanentDrawer from './PermanentDrawer';
import ThreeJsCanvas from './threeJs/Canvas';
import useFile from './threeJs/useFile';

export type Settings = {
  workingColor?: string;
  mode?: Mode;
};
type Props = {
  onSettingsChange?: (settings: Settings) => void;
};

export default function Editor({ onSettingsChange }: Props) {
  const settings = useLoaderData() as Settings;
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const title = config.title;
  const file = location.state?.file || searchParams.get('example');
  const { addJob } = useJobContext();

  if (!file) {
    window.location.href = '/';
    return null;
  }

  const [object] = useFile(file);
  const [mode, setMode] = React.useState<Mode>(settings?.mode || 'mesh');
  const [workingColor, setWorkingColor] = React.useState<string>(
    settings?.workingColor || '#f00'
  );
  const editorRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (onSettingsChange) {
      onSettingsChange({
        mode,
        workingColor,
      });
    }
  }, [mode, workingColor]);

  const handleSelect = (e: ThreeEvent<MouseEvent>) => {
    if (mode === 'mesh') {
      handleMeshColorChange(e.object.uuid, workingColor);
    } else if (mode === 'triangle') {
      handleFaceColorChange(e, workingColor);
    } else if (mode === 'triangle_neighbors') {
      handleFaceNeighborColorChange(e, workingColor);
    } else if (mode === 'select_color' && e.face) {
      setWorkingColor(getFaceColor(e.object as THREE.Mesh, e.face));
    }
  };

  const handleExport = async () => {
    addJob(exportFileJob(file, object!));
  };

  const handleMeshColorChange = (uuid, color: string) => {
    // TODO: Debounce - no need to re-render the mesh for every color change (e.g. when dragging the color picker)
    object?.traverse((child) => {
      if (child.uuid !== uuid) {
        return;
      }

      changeMeshColor(child as THREE.Mesh, color);
    });
  };

  const handleFaceColorChange = (e: ThreeEvent<MouseEvent>, color) => {
    const mesh = e.object as THREE.Mesh;

    if (e.face) {
      changeFaceColor(mesh, color, e.face);
    }
  };

  // This function will color a single face on a mesh, and will seek its
  // neighbors which have the same orentation as the initial face
  const handleFaceNeighborColorChange = async (
    e: ThreeEvent<MouseEvent>,
    color
  ) => {
    const mesh = e.object as THREE.Mesh;

    if (e.face) {
      const initialFace = getFace(mesh, e.faceIndex!);

      // Change the color of the initial face
      changeFaceColor(mesh, color, e.face);

      const visitedNeighbors: number[] = [];
      const walkNeighbors = (
        neighborFaceIndex: number,
        expectedNormal: THREE.Vector3
      ) => {
        if (visitedNeighbors.includes(neighborFaceIndex)) {
          return;
        }
        const face = getFace(mesh, neighborFaceIndex);

        visitedNeighbors.push(neighborFaceIndex);

        if (!sameVector3(face.normal, expectedNormal)) {
          return;
        }

        changeFaceColor(mesh, color, face);
        mesh.userData.neighbors[neighborFaceIndex].forEach((neighbor) => {
          walkNeighbors(neighbor, expectedNormal);
        });
      };

      mesh.userData.neighbors[e.faceIndex!].forEach((neighbor) => {
        walkNeighbors(neighbor, initialFace.normal);
      });
    }
  };

  const handleWorkingColorChange = (color) => {
    setWorkingColor(color);
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
  };

  const handlePointerOverModel = () => {
    if (editorRef.current) {
      if (mode === 'triangle_neighbors') {
        // TODO Draw a circle around the mouse pointer to indicate brush radius
        editorRef.current.style.cursor = `crosshair`;
      } else {
        editorRef.current.style.cursor = 'crosshair';
      }
    }
  };

  const handlePointerOutModel = () => {
    if (editorRef.current) {
      editorRef.current.style.cursor = 'auto';
    }
  };

  return (
    <PermanentDrawer title={title}>
      <Box component="div" sx={{ position: 'relative', height: '100%' }}>
        <ModeSelector
          color={workingColor}
          mode={mode}
          onColorChange={handleWorkingColorChange}
          onExport={handleExport}
          onModeChange={handleModeChange}
          sx={{
            position: 'absolute',
            top: 5,
            left: 5,
            backgroundColor: 'transparent',
            zIndex: 1,
            '& .MuiButtonBase-root': {
              backgroundColor: 'white',
            },
            '& .MuiButtonBase-root: hover': {
              backgroundColor: '#efefef',
            },
          }}
        />
        {object && (
          <div style={{ height: '100%' }} ref={editorRef}>
            <ThreeJsCanvas
              geometry={object}
              onSelect={handleSelect}
              onPointerOverModel={handlePointerOverModel}
              onPointerOutModel={handlePointerOutModel}
            />
          </div>
        )}
      </Box>
    </PermanentDrawer>
  );
}
