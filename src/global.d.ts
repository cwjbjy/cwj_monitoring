import { EventTrack } from "./lib/index";

declare global {
  interface Window {
    $track: EventTrack;
  }
}