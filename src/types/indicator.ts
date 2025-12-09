export interface IndicatorSystem {
  name: string;
  recommended: boolean;
  description: string;
  tags: string[];
  items: string[];
  applicable: string;
  mainIndicators: string;
  weight: string;
}

export interface CustomIndicator {
  id: number;
  name: string;
  description: string;
  weight: number;
  checked: boolean;
}

export interface ModelInfo {
  modelName: string;
  dataset: string;
  scenario: string;
}