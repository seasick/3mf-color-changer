import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import { ThreeEvent } from '@react-three/fiber';
import React from 'react';
import * as THREE from 'three';

import Home from './components/Home';
import MeshList from './components/MeshList';
import PermanentDrawer from './components/PermanentDrawer';
import ThreeJsCanvas from './components/threeJs/Canvas';
import useFile from './components/threeJs/useFile';
import config from './etc/config.json';
import { ChangedColors, changeColors } from './utils/3mf/changeColors';
import { hexToRgb } from './utils/color';
import createFileFromHttp from './utils/createFileFromHttp';
import { getFaceCount } from './utils/geometry';

export default function App() {
  const title = config.title;
  const [file, setFile] = React.useState<File>();
  const [selected, setSelected] = React.useState<THREE.Object3D>();
  const [object] = useFile(file);
  const [colors, setColors] = React.useState<ChangedColors>({});

  const handleFileChange = async (e: string | File) => {
    if (typeof e === 'string') {
      setFile(await createFileFromHttp(e));
    } else {
      setFile(e);
    }
  };

  if (!file) {
    return (
      <PermanentDrawer title={title}>
        <Box sx={{ p: 1 }}>
          <Home onFileSelect={handleFileChange} />
        </Box>
      </PermanentDrawer>
    );
  }

  const handleSelect = (e: ThreeEvent<MouseEvent>) => {
    setSelected(e.object);
  };

  const handleReset = () => {
    setSelected(undefined);
    setFile(undefined);
  };

  const handleExport = async () => {
    const blob = await changeColors(file, colors);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = file.name;
    link.click();
  };

  const handleColorChange = (uuid, color) => {
    object?.traverse((child) => {
      if (child.uuid !== uuid) {
        return;
      }
      setColors({ ...colors, [child.name]: color });

      const mesh = child as THREE.Mesh;
      const facesCount = getFaceCount(mesh);
      const filledArray: number[] = [];
      const rgb = hexToRgb(color);

      for (let i = 0; i < facesCount; ++i) {
        filledArray.push(rgb[0] / 255);
        filledArray.push(rgb[1] / 255);
        filledArray.push(rgb[2] / 255);
      }

      const attribute = new THREE.BufferAttribute(
        new Float32Array(filledArray),
        3
      );
      attribute.needsUpdate = true;

      // Fill the color buffer with the new color
      mesh.geometry.setAttribute('color', attribute);

      mesh.material = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        specular: 0xffffff,
        shininess: 50,
        vertexColors: true,
      });

      // TODO: Without this, the color would be flat, without any distinction between shades.
      // But with it, the normals are wrong.
      mesh.geometry.computeVertexNormals();
    });
  };

  const getMenu = () => {
    if (object) {
      return (
        <Box sx={{ p: 1 }}>
          <ButtonGroup fullWidth>
            <Button onClick={handleReset} variant="contained">
              Back
            </Button>
            <Button onClick={handleExport} variant="contained">
              Export
            </Button>
          </ButtonGroup>
          <MeshList
            geometry={object}
            selected={selected?.uuid}
            onChange={handleColorChange}
          />
        </Box>
      );
    }
    return <Box>...</Box>;
  };

  return (
    <PermanentDrawer title={title} menu={getMenu()}>
      {object && <ThreeJsCanvas geometry={object} onSelect={handleSelect} />}
    </PermanentDrawer>
  );
}
