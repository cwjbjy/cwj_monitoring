import { EventTrack } from './core/tracker';

declare global {
  interface Window {
    $track: EventTrack;
  }
}
