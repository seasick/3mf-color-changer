import PaletteIcon from '@mui/icons-material/Palette';
import type { SxProps } from '@mui/material';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Popover from '@mui/material/Popover';
import React, { useMemo } from 'react';
import { HexColorPicker } from 'react-colorful';
import * as THREE from 'three';

type Props = {
  geometry: THREE.Object3D;
  sx?: SxProps;
  selected?: string;
  onChange: (uuid: string, color: string) => void;
};

export default function MeshList({ geometry, onChange, selected, sx }: Props) {
  const [open, setOpen] = React.useState({});
  const [showColorPicker, setShowColorPicker] = React.useState<
    Record<string, boolean>
  >({});
  const [colorPickerAnchorEl, setColorPickerAnchorEl] =
    React.useState<HTMLButtonElement>();

  const handleClick = (uuid) => () => {
    setOpen({
      ...open,
      [uuid]: !open[uuid],
    });
  };

  const children: THREE.Mesh[] = useMemo(() => {
    const tmp: THREE.Mesh[] = [];
    geometry.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        tmp.push(child);
      }
    });
    return tmp;
  }, [geometry]);

  return (
    <List sx={sx}>
      {children.map((child) => {
        const mesh = child as THREE.Mesh;
        const colors = mesh.geometry.getAttribute('color');
        const handleColorChange = (newColor) => onChange(child.uuid, newColor);

        const threeColor = new THREE.Color(
          colors && colors.getX(0),
          colors && colors.getY(0),
          colors && colors.getZ(0)
        );
        const hexColor = `#${threeColor.getHexString()}`;

        const handleShowColorPicker = (e) => {
          setColorPickerAnchorEl(e.currentTarget);
          setShowColorPicker({
            ...showColorPicker,
            [child.uuid]: true,
          });
        };

        const handleColorPickerClose = () => {
          setColorPickerAnchorEl(undefined);
          setShowColorPicker({
            ...showColorPicker,
            [child.uuid]: false,
          });
        };

        let label = 'Unknown';

        if (child.name) {
          label = child.name;
        } else if (child.id) {
          label = `#${child.id}`;
        } else if (child.uuid) {
          label = `${child.uuid}`;
        }

        return (
          <ListItem
            dense
            key={child.uuid}
            selected={selected === child.uuid}
            onClick={handleClick(child.uuid)}
          >
            <ListItemText primary={label} />
            <IconButton
              onClick={handleShowColorPicker}
              sx={{
                backgroundColor: hexColor,
                color: (theme) => theme.palette.getContrastText(hexColor),
              }}
            >
              <PaletteIcon />
            </IconButton>
            <Popover
              open={showColorPicker[child.uuid] || false}
              anchorEl={colorPickerAnchorEl}
              onClose={handleColorPickerClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              slotProps={{
                paper: {
                  style: {
                    backgroundColor: 'transparent',
                    boxShadow: 'none',
                  },
                },
              }}
            >
              <Box component="div" sx={{ m: 2 }}>
                <HexColorPicker color={hexColor} onChange={handleColorChange} />
              </Box>
            </Popover>
          </ListItem>
        );
      })}
    </List>
  );
}
