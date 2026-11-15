import React from 'react';
import {Composition} from 'remotion';
import {Main} from './Main';
import beats from './beats.json';

export const Root: React.FC = () => (
  <Composition id="EparaReel" component={Main} width={1080} height={1920} fps={beats.fps}
    durationInFrames={Math.round(beats.duration * beats.fps)} defaultProps={{withAudio: true}} />
);
