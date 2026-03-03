export interface ParseResult {
  valid: boolean;
  itemCount?: number;
  stockWidth?: number;
  error?: string;
}

export interface PlacedRect {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string;
  /** 1-based placement order */
  sequence?: number;
  /** True if rect was rotated 90° for placement */
  rotated?: boolean;
}

export interface RunResult {
  packingHeight: number;
  areaWasted: number;
  utilizationFactor: number;
  placements: PlacedRect[];
  generationReports?: GenerationReport[];
}

export interface GenerationReport {
  generation: number;
  bestHeight: number;
  bestIndex: number;
  avgFitness?: number;
}

export type HeuristicMethod = 'length' | 'width' | 'area' | 'perimeter';
