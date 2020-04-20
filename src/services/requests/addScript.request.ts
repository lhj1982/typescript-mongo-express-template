export interface IAddScriptRequest {
  key: string;
  name: string;
  description: string;
  minNumberOfSpots: number;
  maxNumberOfSpots: number;
  duration: number;
  coverImage: string;
  tags: string[];
}
