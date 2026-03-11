import { PricingInput, PricingResult, ProcessOption } from '@/src/types/inventory';

interface PricingRule {
  id: string;
  version: string;
  effectiveFrom: string;
  effectiveTo?: string;
  products: string[];
  materials: PricingInput['material'][];
  widthRange: [number, number];
  marginRate: number;
  roundingUnit: number;
}

const BASE_PRICE_BY_MATERIAL: Record<PricingInput['material'], number> = {
  PET: 1800,
  PP: 1600,
  PE: 1450,
};

const PROCESS_FEE: Record<ProcessOption, number> = {
  LAM: 150,
  CUT: 80,
};

const RULES: PricingRule[] = [
  {
    id: 'RULE-2026-STD-01',
    version: '2026-03-v1',
    effectiveFrom: '2026-01-01',
    products: ['FILM_STD', 'FILM_PREMIUM'],
    materials: ['PET', 'PP', 'PE'],
    widthRange: [0, 5000],
    marginRate: 0.15,
    roundingUnit: 10,
  },
];

function widthFactor(widthMm: number): number {
  if (widthMm < 800) return 1;
  if (widthMm < 1200) return 1.12;
  return 1.25;
}

function pickRule(input: PricingInput): PricingRule {
  const asOf = new Date(input.asOfDate);
  const rule = RULES.find((candidate) => {
    const from = new Date(candidate.effectiveFrom);
    const to = candidate.effectiveTo ? new Date(candidate.effectiveTo) : undefined;
    const dateMatched = asOf >= from && (!to || asOf <= to);

    return (
      dateMatched &&
      candidate.products.includes(input.productCode) &&
      candidate.materials.includes(input.material) &&
      input.widthMm >= candidate.widthRange[0] &&
      input.widthMm < candidate.widthRange[1]
    );
  });

  if (!rule) {
    throw new Error('적용 가능한 단가 룰을 찾을 수 없습니다.');
  }

  return rule;
}

function roundToUnit(value: number, unit: number): number {
  return Math.round(value / unit) * unit;
}

export function calculatePrice(input: PricingInput): PricingResult {
  const rule = pickRule(input);
  const base = BASE_PRICE_BY_MATERIAL[input.material];
  const factor = widthFactor(input.widthMm);

  const processFee = input.processOptions.reduce((acc, option) => acc + PROCESS_FEE[option], 0);
  const raw = base * factor + processFee + input.lengthM * 2;
  const finalBeforeRounding = raw * (1 + rule.marginRate);
  const unitPrice = roundToUnit(finalBeforeRounding, rule.roundingUnit);

  return {
    unitPrice,
    lineAmount: unitPrice * input.quantity,
    version: rule.version,
    matchedRuleIds: [rule.id],
    breakdown: {
      base,
      widthFactor: factor,
      processFee,
      raw,
      marginRate: rule.marginRate,
      finalBeforeRounding,
      final: unitPrice,
      roundingUnit: rule.roundingUnit,
    },
  };
}
