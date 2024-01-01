import Box from '@mui/material/Box';
import { ThreeEvent } from '@react-three/fiber';
import React from 'react';
import { useLocation } from 'react-router-dom';
import * as THREE from 'three';

import MeshList from '../components/MeshList';
import ModeSelector, { Mode } from '../components/ModeSelector';
import PermanentDrawer from '../components/PermanentDrawer';
import ThreeJsCanvas from '../components/threeJs/Canvas';
import useFile from '../components/threeJs/useFile';
import config from '../etc/config.json';
import { ChangedColors, changeColors } from '../utils/3mf/changeColors';
import createFileFromHttp from '../utils/createFileFromHttp';
import changeMeshColor from '../utils/threejs/changeMeshColor';
import changeVertexColor from '../utils/threejs/changeVertexColor';
import radiusRaycast from '../utils/threejs/radiusRaycast';

export default function EditRoute() {
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
  const [mode, setMode] = React.useState<Mode>('mesh');
  const [workingColor, setWorkingColor] = React.useState<string>('#f00');
  const [showMeshList, setShowMeshList] = React.useState<boolean>(false);
  const editorRef = React.useRef<HTMLDivElement>(null);

  const addVertexColor = (
    colors: ChangedColors,
    meshName: string,
    faceIndexColor: [number, string][]
  ) => {
    const existingVertices = [...(colors[meshName]?.vertex || [])];

    for (const [faceIndex, color] of faceIndexColor) {
      const existingVertex = existingVertices.findIndex(
        (f) => f.face === faceIndex
      );

      if (existingVertex > -1) {
        existingVertices.splice(existingVertex, 1);
      } else {
        existingVertices.push({
          face: faceIndex!,
          color,
        });
      }
    }

    return {
      ...colors,
      [meshName]: {
        ...colors[meshName],
        vertex: existingVertices,
      },
    };
  };

  const handleSelect = (e: ThreeEvent<MouseEvent>) => {
    if (mode === 'mesh') {
      handleMeshColorChange(e.object.uuid, workingColor);
    } else if (mode === 'vertex') {
      handleVertexColorChange(e, workingColor);
    } else if (mode === 'vertex_neighbors') {
      handleVertexNeighborColorChange(e, workingColor);
    }
    setSelected(e.object);
  };

  const handleExport = async () => {
    let fileFile = file;
    if (typeof fileFile === 'string') {
      fileFile = await createFileFromHttp(fileFile);
    }
    const blob = await changeColors(fileFile, colors);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = file.name || 'export.3mf';
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
      changeVertexColor(mesh, color, e.face);
      setColors(addVertexColor(colors, mesh.name, [[e.faceIndex!, color]]));
    }
  };

  // This function will color a single vertex on a mesh, and will seek its
  // neighbors which have the same orentation as the initial vertex
  const handleVertexNeighborColorChange = (
    e: ThreeEvent<MouseEvent>,
    color
  ) => {
    const mesh = e.object as THREE.Mesh;

    if (e.face) {
      const toBeChangedVertex: [number, string][] = [];
      const radius = 0.05;
      const intersects = radiusRaycast(e.pointer, radius, mesh, e.camera);

      // Change the color of the initial vertex
      changeVertexColor(mesh, color, e.face);
      toBeChangedVertex.push([e.faceIndex!, color]);

      // Get through adjacent faces and change the color of the vertices
      intersects.forEach((intersect) => {
        if (intersect.face) {
          changeVertexColor(mesh, color, intersect.face);
          toBeChangedVertex.push([intersect.faceIndex!, color]);
        }
      });

      setColors(addVertexColor(colors, mesh.name, toBeChangedVertex));
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

  const handlePointerOverModel = () => {
    if (editorRef.current) {
      if (mode === 'vertex_neighbors') {
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
