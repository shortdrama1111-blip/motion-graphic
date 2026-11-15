import React from 'react';
import {Composition} from 'remotion';
import {Main} from './Main';
import beats from './beats.json';

const frames = Math.round(beats.duration * beats.fps);
export const Root: React.FC = () => (
  <>
    <Composition id="Cyberoz16x9" component={Main} width={1920} height={1080} fps={beats.fps} durationInFrames={frames} defaultProps={{withAudio: true}} />
    <Composition id="Cyberoz1x1" component={Main} width={1080} height={1080} fps={beats.fps} durationInFrames={frames} defaultProps={{withAudio: true}} />
  </>
);
