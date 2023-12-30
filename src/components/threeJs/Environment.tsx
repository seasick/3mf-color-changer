import { Grid } from '@react-three/drei';
import React, { memo } from 'react';

type Props = {
  direction?: [number, number, number];
};

export const Environment = memo(({ direction = [5, 5, 5] }: Props) => (
  <>
    <ambientLight intensity={0.8} />
    <directionalLight
      position={direction}
      intensity={0.5}
      shadow-mapSize={1024}
      castShadow
    />
    <directionalLight
      position={[-5, 5, 5]}
      intensity={0.1}
      shadow-mapSize={128}
      castShadow
    />
    <directionalLight
      position={[-5, 5, -5]}
      intensity={0.1}
      shadow-mapSize={128}
      castShadow
    />
    <directionalLight
      position={[0, 5, 0]}
      intensity={0.1}
      shadow-mapSize={128}
      castShadow
    />
    <Grid infiniteGrid={true} sectionColor="#CCCCCC" />
  </>
));
