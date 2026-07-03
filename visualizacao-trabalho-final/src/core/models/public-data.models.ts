export type PublicDataValue = number | string | null;

export interface PublicDataRow {
  [key: string]: PublicDataValue | undefined;
}

export interface SimplifiedCensusRow extends PublicDataRow {
  'Quantidade de moradores'?: number;
  'Cor ou raça é branca'?: number;
  'Cor ou raça é preta'?: number;
  'Cor ou raça é amarela'?: number;
  'Cor ou raça é parda'?: number;
  'Cor ou raça é indígena'?: number;
  'Sexo masculino'?: number;
  'Sexo feminino'?: number;
  'Sexo masculino, 30 a 59 anos, Morador sabe ler e escrever'?: number;
  'Sexo masculino, 30 a 59 anos, Morador não sabe ler e escrever'?: number;
  'Sexo feminino, 30 a 59 anos, Morador sabe ler e escrever'?: number;
  'Sexo feminino, 30 a 59 anos, Morador não sabe ler e escrever'?: number;
  'Pessoa responsável pelo domicílio, Sexo masculino, 15 anos ou mais, Morador sabe ler e escrever'?: number;
  'Pessoa responsável pelo domicílio, Sexo masculino, 15 anos ou mais, Morador não sabe ler e escrever'?: number;
  'Pessoa responsável pelo domicílio, Sexo feminino, 15 anos ou mais, Morador sabe ler e escrever'?: number;
  'Pessoa responsável pelo domicílio, Sexo feminino, 15 anos ou mais, Morador não sabe ler e escrever'?: number;
  'Pessoas responsáveis em domicílios particulares permanentes ocupados'?: number;
  'Moradores em domicílios particulares permanentes ocupados'?: number;
  'Variância do número de moradores em domicílios particulares permanentes ocupados'?: number;
  'Valor do rendimento nominal médio mensal das pessoas responsáveis com rendimentos por domicílios particulares permanentes ocupados'?: number;
  'Variância do rendimento nominal mensal das pessoas responsáveis com rendimentos por domicílios particulares permanentes ocupados'?: number;
  'Valor do rendimento nominal mediano mensal das pessoas responsáveis com rendimentos por domicílios particulares permanentes ocupados'?: number;
  'Pessoa responsável pelo domicílio, 15 anos ou mais, Morador sabe ler e escrever'?: number;
}

export interface NeighborhoodRow extends SimplifiedCensusRow {
  CD_BAIRRO: number;
  NM_BAIRRO: string;
}

export type DistrictRow = SimplifiedCensusRow;

export interface SubdistrictRow extends SimplifiedCensusRow {
  CD_SUBDIST: string;
  NM_SUBDIST: string;
}

export interface CensusSectorRow extends SimplifiedCensusRow {
  CD_SETOR: number;
}

export type SubdistrictDataset = SubdistrictRow[];
export type DistrictDataset = DistrictRow[];
export type CensusSectorDataset = CensusSectorRow[];
export type NeighborhoodDataset = NeighborhoodRow[];
