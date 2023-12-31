import Box from '@mui/material/Box';
import { ThreeEvent } from '@react-three/fiber';
import React from 'react';
import { useLocation } from 'react-router-dom';
import * as THREE from 'three';

import MeshList from '../components/MeshList';
import ModeSelector from '../components/ModeSelector';
import PermanentDrawer from '../components/PermanentDrawer';
import ThreeJsCanvas from '../components/threeJs/Canvas';
import useFile from '../components/threeJs/useFile';
import config from '../etc/config.json';
import { ChangedColors, changeColors } from '../utils/3mf/changeColors';
import changeMeshColor from '../utils/threejs/changeMeshColor';
import changeVertexColor from '../utils/threejs/changeVertexColor';

export default function App() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const title = config.title;
  const file = location.state?.file || searchParams.get('example');

  if (!file) {
    window.location.href = '/';
    return null;
  }

  const [selected, setSelected] = React.useState<THREE.Object3D>();
  const [object] = useFile(file);
  const [colors, setColors] = React.useState<ChangedColors>({});
  const [mode, setMode] = React.useState<'mesh' | 'vertex'>('mesh');
  const [workingColor, setWorkingColor] = React.useState<string>('#f00');
  const [showMeshList, setShowMeshList] = React.useState<boolean>(false);

  const handleSelect = (e: ThreeEvent<MouseEvent>) => {
    if (mode === 'mesh') {
      handleMeshColorChange(e.object.uuid, workingColor);
    } else if (mode === 'vertex') {
      handleVertexColorChange(e, workingColor);
    }

    setSelected(e.object);
  };

  const handleExport = async () => {
    const blob = await changeColors(file, colors);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = file.name;
    link.click();
  };

  const handleMeshColorChange = (uuid, color: string) => {
    // TODO: Debounce - no need to re-render the mesh for every color change (e.g. when dragging the color picker)
    object?.traverse((child) => {
      if (child.uuid !== uuid) {
        return;
      }
      setColors({
        ...colors,
        [child.name]: {
          ...colors[child.name],
          mesh: color,
        },
      });

      changeMeshColor(child as THREE.Mesh, color);
    });
  };

  const handleVertexColorChange = (e: ThreeEvent<MouseEvent>, color) => {
    const mesh = e.object as THREE.Mesh;

    if (e.face) {
      const existingVertices = [...(colors[mesh.name]?.vertex || [])];
      const existingVertex = existingVertices.findIndex(
        (f) => f.face === e.faceIndex
      );

      if (existingVertex > -1) {
        existingVertices.splice(existingVertex, 1);
      } else {
        existingVertices.push({
          face: e.faceIndex!,
          color,
        });
      }

      changeVertexColor(mesh, color, e.face);

      setColors({
        ...colors,
        [mesh.name]: {
          ...colors[mesh.name],
          vertex: existingVertices,
        },
      });
    }
  };

  const handleWorkingColorChange = (color) => {
    setWorkingColor(color);
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
  };

  const handleShowMeshList = (showMeshList) => {
    setShowMeshList(showMeshList);
  };

  const getMenu = () => {
    if (object) {
      return (
        <Box sx={{ p: 1 }}>
          <MeshList
            geometry={object}
            selected={selected?.uuid}
            onChange={handleMeshColorChange}
          />
        </Box>
      );
    }
    return <Box>...</Box>;
  };

  return (
    <PermanentDrawer title={title} menu={showMeshList ? getMenu() : null}>
      <Box sx={{ position: 'relative', height: '100%' }}>
        <ModeSelector
          color={workingColor}
          mode={mode}
          onColorChange={handleWorkingColorChange}
          onExport={handleExport}
          onModeChange={handleModeChange}
          onShowMeshList={handleShowMeshList}
          showMeshList={showMeshList}
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
        {object && <ThreeJsCanvas geometry={object} onSelect={handleSelect} />}
      </Box>
    </PermanentDrawer>
  );
}
