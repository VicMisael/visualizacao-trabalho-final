export type NeighborhoodDatum = {
  NM_BAIRRO?: string;
  total: number;
};

export type RendaDatum = {
  CD_BAIRRO?: string | number;
  NM_BAIRRO?: string;
  rendimento: number;
  [key: string]: unknown;
};

export type ScatterDatum = {
  cdBairro: string;
  bairro: string;
  rendimento: number;
  populacao: number;
  alfabetizados: number;
  taxaAlfabetizacao: number;
  destaque: boolean;
};

export type RacialScatterDatum = {
  cdBairro: string;
  bairro: string;
  rendimento: number;
  populacao: number;
  racializados: number;
  proporcaoNegra: number;
  destaque: boolean;
};

export type MulherResponsavelScatterDatum = {
  cdBairro: string;
  bairro: string;
  rendimento: number;
  responsaveisHomens: number;
  responsaveisMulheres: number;
  totalResponsaveis: number;
  proporcaoMulheresResponsaveis: number;
  destaque: boolean;
};

export function parseNumericValue(value: unknown): number {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === 'string') {
    const normalized = value.replace(/\./g, '').replace(',', '.').trim();
    const parsed = Number.parseFloat(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}
