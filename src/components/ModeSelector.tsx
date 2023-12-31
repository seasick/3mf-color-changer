import CreateIcon from '@mui/icons-material/Create';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
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

type Mode = 'mesh' | 'vertex';
type Props = {
  color: string;
  onColorChange: (color: string) => void;
  onModeChange: (mode: Mode) => void;
  onExport: () => void;
  mode: Mode;
  sx?: any;
};

export default function ModeSelector({
  color,
  onColorChange,
  onModeChange,
  onExport,
  sx,
  mode,
}: Props) {
  const [showColorPicker, setShowColorPicker] = React.useState(false);
  const [colorPickerAnchorEl, setColorPickerAnchorEl] =
    React.useState<HTMLButtonElement>();

  const handleModeClick = (newMode: Mode) => () => onModeChange(newMode);
  const handleColorChange = (newColor) => onColorChange(newColor);
  const handleExportClick = onExport;

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
        <>
          <IconButton
            sx={{
              ...style,
            }}
            onClick={(event) => {
              setColorPickerAnchorEl(event?.currentTarget);
              setShowColorPicker(!showColorPicker);
            }}
          >
            <Badge
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              badgeContent=" "
              sx={{
                '& .MuiBadge-badge': {
                  backgroundColor: color,
                },
              }}
            >
              <PaletteIcon />
            </Badge>
          </IconButton>
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
        </>
      </Tooltip>

      <Tooltip title="Export your changes in a 3MF file" placement="right">
        <IconButton onClick={handleExportClick} sx={style}>
          <FileDownloadIcon />
        </IconButton>
      </Tooltip>
    </ButtonGroup>
  );
}
