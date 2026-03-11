export type Material = 'PET' | 'PP' | 'PE';

export type ProcessOption = 'LAM' | 'CUT';

export interface PricingInput {
  productCode: string;
  quantity: number;
  widthMm: number;
  lengthM: number;
  material: Material;
  processOptions: ProcessOption[];
  asOfDate: string;
}

export interface PricingBreakdown {
  base: number;
  widthFactor: number;
  processFee: number;
  raw: number;
  marginRate: number;
  finalBeforeRounding: number;
  final: number;
  roundingUnit: number;
}

export interface PricingResult {
  unitPrice: number;
  lineAmount: number;
  version: string;
  breakdown: PricingBreakdown;
  matchedRuleIds: string[];
}

export interface OrderDraft extends PricingInput {
  customerName: string;
  customerMemo?: string;
  createdAt: string;
  pricing: PricingResult;
}
