import type { StudioRec } from './heuristics';

/** Everything the result screen needs to rebuild a studio session from one upload. */
export interface Session {
  id: string;
  publicId: string;
  originalFilename: string;
  width: number;
  height: number;
  bytes: number;
  rec: StudioRec;
  createdAt: number;
}
