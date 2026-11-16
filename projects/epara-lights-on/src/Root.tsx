import React from 'react';
import {Composition} from 'remotion';
import {Main} from './Main';
import B from './beats.json';
export const Root: React.FC = () => (
  <Composition id="LightsOn" component={Main} width={1080} height={1920} fps={B.fps} durationInFrames={Math.round(B.duration * B.fps)} defaultProps={{withAudio: true}} />
);
