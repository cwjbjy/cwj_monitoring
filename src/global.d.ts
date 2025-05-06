import { EventTrack } from './tracker';

declare global {
  interface Window {
    $track: EventTrack;
  }
}
