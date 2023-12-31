import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import CreateIcon from '@mui/icons-material/Create';
import FiberNewIcon from '@mui/icons-material/FiberNew';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatPaintIcon from '@mui/icons-material/FormatPaint';
import PaletteIcon from '@mui/icons-material/Palette';
import {
  Badge,
  Box,
  ButtonGroup,
  IconButton,
  Popover,
  Tooltip,
} from '@mui/material';
import React from 'react';
import { HexColorPicker } from 'react-colorful';
import { useNavigate } from 'react-router-dom';

type Mode = 'mesh' | 'vertex';
type Props = {
  color: string;
  mode: Mode;
  onColorChange: (color: string) => void;
  onExport: () => void;
  onModeChange: (mode: Mode) => void;
  onShowMeshList: (showMeshList: boolean) => void;
  showMeshList: boolean;
  sx?: any;
};

const defaultColors = [
  '#d53e4f',
  '#f46d43',
  '#fdae61',
  '#fee08b',
  '#e6f598',
  '#abdda4',
  '#66c2a5',
  '#3288bd',
];

export default function ModeSelector({
  color,
  mode,
  onColorChange,
  onExport,
  onModeChange,
  onShowMeshList,
  showMeshList,
  sx,
}: Props) {
  const [showColorPicker, setShowColorPicker] = React.useState(false);
  const [colorPickerAnchorEl, setColorPickerAnchorEl] =
    React.useState<HTMLButtonElement>();
  const navigate = useNavigate();

  const handleModeClick = (newMode: Mode) => () => onModeChange(newMode);
  const handleColorChange = (newColor) => onColorChange(newColor);
  const handleExportClick = onExport;
  const handleResetClick = () => {
    navigate('/');
  };
  const handleMeshListClick = () => onShowMeshList(!showMeshList);

  const style = {
    border: 1,
    borderColor: '#ccc',
    borderRadius: 2,
    borderStyle: 'solid',
    m: 0.25,
  };
  const selectedStyle = {
    ...style,
    border: 2,
    borderColor: 'primary.main',
  };

  return (
    <ButtonGroup
      orientation="vertical"
      aria-label="vertical outlined button group"
      sx={sx}
    >
      <Tooltip title="Select the mesh painting tool" placement="right">
        <IconButton
          onClick={handleModeClick('mesh')}
          sx={mode === 'mesh' ? selectedStyle : style}
        >
          <FormatPaintIcon />
        </IconButton>
      </Tooltip>

      <Tooltip title="Select the vertex painting tool" placement="right">
        <IconButton
          onClick={handleModeClick('vertex')}
          sx={mode === 'vertex' ? selectedStyle : style}
        >
          <CreateIcon />
        </IconButton>
      </Tooltip>

      <Tooltip title="Select the painting color" placement="right">
        <IconButton
          sx={{
            ...style,
          }}
          onClick={(event) => {
            setColorPickerAnchorEl(event?.currentTarget);
            setShowColorPicker(!showColorPicker);
          }}
        >
          <PaletteIcon
            sx={{
              borderBottom: 6,
              borderBottomColor: color,
            }}
          />
        </IconButton>
      </Tooltip>

      <Tooltip title="Use a new model" placement="right">
        <IconButton onClick={handleResetClick} sx={{ ...style, mt: 5 }}>
          <FiberNewIcon />
        </IconButton>
      </Tooltip>

      <Tooltip title="Export your changes in a 3MF file" placement="right">
        <IconButton onClick={handleExportClick} sx={style}>
          <FileDownloadIcon />
        </IconButton>
      </Tooltip>

      <Tooltip title="Show mesh list" placement="right">
        <IconButton onClick={handleMeshListClick} sx={style}>
          {showMeshList ? <ChevronLeftIcon /> : <FormatListBulletedIcon />}
        </IconButton>
      </Tooltip>

      <Box sx={{ mt: 5 }} />
      {defaultColors.map((d) => (
        <Tooltip title="Set color" placement="right" key={d}>
          <IconButton
            onClick={() => handleColorChange(d)}
            sx={{ ...style, backgroundColor: d + ' !important', height: 40 }}
          ></IconButton>
        </Tooltip>
      ))}

      <Popover
        open={showColorPicker}
        anchorEl={colorPickerAnchorEl}
        onClose={() => setShowColorPicker(false)}
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
        <Box sx={{ m: 2 }}>
          <HexColorPicker color={color} onChange={handleColorChange} />
        </Box>
      </Popover>
    </ButtonGroup>
  );
}
