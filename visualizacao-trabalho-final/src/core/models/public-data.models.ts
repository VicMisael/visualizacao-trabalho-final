export type PublicDataValue = number | string | null;

export interface PublicDataRow {
  [key: string]: PublicDataValue | undefined;
}

export interface NeighborhoodRow extends PublicDataRow {
  CD_BAIRRO: number;
  NM_BAIRRO: string;
}

export interface DistrictRow extends PublicDataRow {
  CD_DIST: number;
  NM_DIST: string;
}

export interface SubdistrictRow extends PublicDataRow {
  CD_SUBDIST: string;
  NM_SUBDIST: string;
  'Quantidade de moradores'?: number;
  'Sexo masculino'?: number;
  'Sexo feminino'?: number;
}

export interface CensusSectorRow extends PublicDataRow {
  id: number;
  CD_SETOR: number;
  SITUACAO: string;
  CD_SIT: number;
  CD_TIPO: number;
  AREA_KM2: number;
  CD_REGIAO: number;
  NM_REGIAO: string;
  CD_UF: number;
  NM_UF: string;
  CD_MUN: number;
  NM_MUN: string;
  CD_DIST: number;
  NM_DIST: string;
  CD_SUBDIST: number;
  NM_SUBDIST: string;
  CD_BAIRRO: number;
  NM_BAIRRO: string;
  'Total de pessoas'?: number;
}

export interface NeighborhoodRaceAggregateRow extends NeighborhoodRow {
  'Cor ou raça é branca'?: number;
  'Cor ou raça é preta'?: number;
  'Cor ou raça é amarela'?: number;
  'Cor ou raça é parda'?: number;
  'Cor ou raça é indígena'?: number | string;
}

export interface NeighborhoodIncomeAggregateRow extends NeighborhoodRow {
  'Pessoas responsáveis em domicílios particulares permanentes ocupados'?: number;
  'Moradores em domicílios particulares permanentes ocupados'?: number;
  'Variância do número de moradores em domicílios particulares permanentes ocupados'?: number | string;
  'Valor do rendimento nominal médio mensal das pessoas responsáveis com rendimentos por domicílios particulares permanentes ocupados'?: number | string;
  'Variância do rendimento nominal mensal das pessoas responsáveis com rendimentos por domicílios particulares permanentes ocupados'?: number | string;
  'Valor do rendimento nominal mediano mensal das pessoas responsáveis com rendimentos por domicílios particulares permanentes ocupados'?: number;
}

export interface NeighborhoodDemographyAggregateRow extends NeighborhoodRow {
  'Quantidade de moradores'?: number;
  'Sexo masculino'?: number;
  'Sexo feminino'?: number;
}

export interface NeighborhoodLiteracyAggregateRow extends NeighborhoodRow {
  '15 a 19 anos'?: number;
  '20 a 24 anos'?: number;
  '25 a 29 anos'?: number;
  '30 a 34 anos'?: number;
  '35 a 39 anos'?: number;
  '40 a 44 anos'?: number;
  '45 a 49 anos'?: number;
  '50 a 54 anos'?: number;
  '55 a 59 anos'?: number;
  '60 a 64 anos'?: number;
  '65 a 69 anos'?: number;
  '70 a 79 anos'?: number;
  '80 anos ou mais'?: number;
}

export interface ConsolidatedNeighborhoodRow
  extends NeighborhoodRow,
    NeighborhoodIncomeAggregateRow,
    NeighborhoodDemographyAggregateRow,
    NeighborhoodLiteracyAggregateRow,
    NeighborhoodRaceAggregateRow {}

export type SubdistrictDataset = SubdistrictRow[];
export type DistrictDataset = DistrictRow[];
export type CensusSectorDataset = CensusSectorRow[];
export type NeighborhoodRaceAggregateDataset = NeighborhoodRaceAggregateRow[];
export type NeighborhoodIncomeAggregateDataset = NeighborhoodIncomeAggregateRow[];
export type NeighborhoodDemographyAggregateDataset = NeighborhoodDemographyAggregateRow[];
export type NeighborhoodLiteracyAggregateDataset = NeighborhoodLiteracyAggregateRow[];
export type ConsolidatedNeighborhoodDataset = ConsolidatedNeighborhoodRow[];
