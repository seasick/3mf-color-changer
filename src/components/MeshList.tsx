import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import { MuiColorInput } from 'mui-color-input';
import React, { useMemo } from 'react';
import * as THREE from 'three';

import { getColorFromMesh } from '../utils/color';

type Props = {
  geometry: THREE.Object3D;
  sx?: any;
  selected?: string;
  onChange: (uuid: string, color: string) => void;
};

export default function MeshList({ geometry, onChange, selected, sx }: Props) {
  const [open, setOpen] = React.useState({});
  const handleClick = (uuid) => (e) => {
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
        const currentColor = getColorFromMesh(child);
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
            key={child.uuid}
            selected={selected === child.uuid}
            onClick={handleClick(child.uuid)}
          >
            <MuiColorInput
              isAlphaHidden={true}
              label={label}
              value={currentColor || '#ffffff'}
              format="hex"
              onChange={(_color, colors) => onChange(child.uuid, colors.hex)}
            />
          </ListItem>
        );
      })}
    </List>
  );
}
