import { NeighborhoodDatum, RacialScatterDatum, RendaDatum, ScatterDatum, MulherResponsavelScatterDatum, parseNumericValue } from './chart-data.models';

export function buildTopNeighborhoods(data: Array<Record<string, unknown>>, keys: string[]): NeighborhoodDatum[] {
  return data
    .map((d) => {
      const neighborhoodName = typeof d['NM_BAIRRO'] === 'string' ? d['NM_BAIRRO'] : '';

      return {
        ...d,
        NM_BAIRRO: neighborhoodName,
        total: keys.reduce((sum, key) => sum + parseNumericValue(d[key]), 0),
      } satisfies NeighborhoodDatum;
    })
    .sort((a, b) => Number(b.total) - Number(a.total))
    .slice(0, 10);
}

export function buildTopIncomeNeighborhoods(data: Array<Record<string, unknown>>, chaveRenda: string): RendaDatum[] {
  return data
    .map((d) => ({
      ...d,
      NM_BAIRRO: typeof d['NM_BAIRRO'] === 'string' ? d['NM_BAIRRO'] : '',
      rendimento: parseNumericValue(d[chaveRenda]),
    }))
    .sort((a, b) => b.rendimento - a.rendimento)
    .slice(0, 10) as RendaDatum[];
}

export function buildLiteracyScatterData(data: Array<Record<string, unknown>>, chaveRenda: string): ScatterDatum[] {
  const dadosBase = data.map((d) => {
    const populacao = sumValues(d, [
      '0 a 4 anos',
      '5 a 9 anos',
      '10 a 14 anos',
      '15 a 19 anos',
      '20 a 24 anos',
      '25 a 29 anos',
      '30 a 39 anos',
      '40 a 49 anos',
      '50 a 59 anos',
      '60 a 69 anos',
      '70 anos ou mais',
    ]);

    const alfabetizados = sumValues(d, [
      'Pessoas alfabetizadas, 15 a 19 anos',
      'Pessoas alfabetizadas, 20 a 24 anos',
      'Pessoas alfabetizadas, 25 a 29 anos',
      'Pessoas alfabetizadas, 30 a 34 anos',
      'Pessoas alfabetizadas, 35 a 39 anos',
      'Pessoas alfabetizadas, 40 a 44 anos',
      'Pessoas alfabetizadas, 45 a 49 anos',
      'Pessoas alfabetizadas, 50 a 54 anos',
      'Pessoas alfabetizadas, 55 a 59 anos',
      'Pessoas alfabetizadas, 60 a 64 anos',
      'Pessoas alfabetizadas, 65 a 69 anos',
      'Pessoas alfabetizadas, 70 a 79 anos',
      'Pessoas alfabetizadas, 80 anos ou mais',
    ]);

    const rendimento = parseNumericValue(d[chaveRenda]);
    const taxaAlfabetizacao = populacao > 0 ? (alfabetizados / populacao) * 100 : 0;

    return {
      bairro: typeof d['NM_BAIRRO'] === 'string' ? d['NM_BAIRRO'] : '',
      rendimento,
      populacao,
      alfabetizados,
      taxaAlfabetizacao,
      destaque: false,
    } satisfies ScatterDatum;
  });

  const topN = new Set(
    [...dadosBase]
      .sort((a, b) => b.rendimento - a.rendimento)
      .slice(0, 10)
      .map((d) => d.bairro)
  );

  return dadosBase.map((d) => ({ ...d, destaque: topN.has(d.bairro) }));
}

export function buildRacialScatterData(data: Array<Record<string, unknown>>): RacialScatterDatum[] {
  const dadosScatter = data.map((d) => {
    const rendimento = parseNumericValue(d['Valor do rendimento nominal médio mensal das pessoas responsáveis com rendimentos por domicílios particulares permanentes ocupados']);
    const populacao = sumValues(d, [
      '0 a 4 anos',
      '5 a 9 anos',
      '10 a 14 anos',
      '15 a 19 anos',
      '20 a 24 anos',
      '25 a 29 anos',
      '30 a 39 anos',
      '40 a 49 anos',
      '50 a 59 anos',
      '60 a 69 anos',
      '70 anos ou mais',
    ]);
    const racializados = sumValues(d, ['Cor ou raça é preta', 'Cor ou raça é parda', 'Cor ou raça é indígena', 'Cor ou raça é amarela']);
    const proporcaoNegra = populacao > 0 ? (racializados / populacao) * 100 : 0;

    return {
      bairro: typeof d['NM_BAIRRO'] === 'string' ? d['NM_BAIRRO'] : '',
      rendimento,
      populacao,
      racializados,
      proporcaoNegra,
      destaque: false,
    } satisfies RacialScatterDatum;
  });

  const topN = new Set(
    [...dadosScatter]
      .sort((a, b) => b.rendimento - a.rendimento)
      .slice(0, 10)
      .map((d) => d.bairro)
  );

  return dadosScatter.map((d) => ({ ...d, destaque: topN.has(d.bairro) }));
}

export function buildWomenResponsibleScatterData(data: Array<Record<string, unknown>>): MulherResponsavelScatterDatum[] {
  const dadosScatter = data.map((d) => {
    const rendimento = parseNumericValue(d['Valor do rendimento nominal médio mensal das pessoas responsáveis com rendimentos por domicílios particulares permanentes ocupados']);
    const responsaveisHomens = sumValues(d, [
      'Pessoa responsável pelo domicílio, Sexo masculino, 15 anos ou mais, Morador sabe ler e escrever',
      'Pessoa responsável pelo domicílio, Sexo masculino, 15 anos ou mais, Morador não sabe ler e escrever',
    ]);
    const responsaveisMulheres = sumValues(d, [
      'Pessoa responsável pelo domicílio, Sexo feminino, 15 anos ou mais, Morador sabe ler e escrever',
      'Pessoa responsável pelo domicílio, Sexo feminino, 15 anos ou mais, Morador não sabe ler e escrever',
    ]);
    const totalResponsaveis = responsaveisHomens + responsaveisMulheres;
    const proporcaoMulheresResponsaveis = totalResponsaveis > 0 ? (responsaveisMulheres / totalResponsaveis) * 100 : 0;

    return {
      bairro: typeof d['NM_BAIRRO'] === 'string' ? d['NM_BAIRRO'] : '',
      rendimento,
      responsaveisHomens,
      responsaveisMulheres,
      totalResponsaveis,
      proporcaoMulheresResponsaveis,
      destaque: false,
    } satisfies MulherResponsavelScatterDatum;
  });

  const topN = new Set(
    [...dadosScatter]
      .sort((a, b) => b.rendimento - a.rendimento)
      .slice(0, 10)
      .map((d) => d.bairro)
  );

  return dadosScatter.map((d) => ({ ...d, destaque: topN.has(d.bairro) }));
}

function sumValues(d: Record<string, unknown>, keys: string[]): number {
  return keys.reduce((acc, key) => acc + parseNumericValue(d[key]), 0);
}
