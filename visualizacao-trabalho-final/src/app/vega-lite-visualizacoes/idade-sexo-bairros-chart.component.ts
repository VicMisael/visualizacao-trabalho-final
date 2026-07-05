import { Component } from '@angular/core';
import { VisualizationSpec } from 'vega-embed';
import { RendaDatum } from './models/chart-data.models';
import { buildTopIncomeNeighborhoods } from './models/chart-data.utils';
import { parseNumericValue } from './models/chart-data.models';
import { VegaLiteChartBase } from './shared/vega-lite-chart-base';

type StackedDatum = {
  cdBairro: string;
  bairro: string;
  sexo: string;
  FaixaEtaria: string;
  Populacao: number;
  selecionado?: boolean;
  [key: string]: string | number | boolean | undefined;
};

@Component({
  selector: 'app-idade-sexo-bairros-chart',
  standalone: true,
  template: `<div #chart class="w-full"></div>`,
})
export class IdadeSexoBairrosChartComponent extends VegaLiteChartBase {
  override createSpec(data: Array<Record<string, unknown>>): VisualizationSpec {
    const chaveRenda = 'Valor do rendimento nominal médio mensal das pessoas responsáveis com rendimentos por domicílios particulares permanentes ocupados';
    const top10Renda = buildTopIncomeNeighborhoods(data, chaveRenda);
    const allRenda = data
      .map((d) => ({
        ...d,
        NM_BAIRRO: typeof d['NM_BAIRRO'] === 'string' ? d['NM_BAIRRO'] : '',
        rendimento: parseNumericValue(d[chaveRenda]),
      }))
      .sort((a, b) => b.rendimento - a.rendimento) as RendaDatum[];
    const visibleRows = this.withSelectedFlag(this.includeSelectedRows(top10Renda, allRenda));
    const dados = this.buildStackedData(visibleRows);
    const faixas = ['0 a 14 anos', '15 a 29 anos', '30 a 59 anos', '60 anos ou mais'];

    const spec: VisualizationSpec = {
      $schema: 'https://vega.github.io/schema/vega-lite/v6.json',

      title: {
        text: 'Distribuição por sexo e faixa etária',
        anchor:'middle'
      },
      data: { values: dados },
      padding: 20,
      autosize: {
        type: 'fit',
        contains: 'padding',
      },

      resolve: {
        scale: {
          x: 'shared',
          y: 'shared'
        }
      },

      transform: [
        { fold: faixas, as: ['FaixaEtaria', 'Populacao'] }
      ],

      facet: {
        row: {
          field: 'sexo',
          type: 'nominal',
          title: null
        }
      },

      spec: {
        mark: 'bar',
        encoding: {
          y: {
            field: 'bairro',
            type: 'nominal',
            sort: visibleRows.map(d => d.NM_BAIRRO ?? '')
          },
          x: {
            field: 'Populacao',
            type: 'quantitative',
            stack: 'zero'
          },
          color: {
            field: 'FaixaEtaria',
            type: 'nominal'
          },
          opacity: {
            condition: { test: 'datum.selecionado === true', value: 1 },
            value: this.hasSelectedBairros() ? 0.45 : 0.9,
          },
          tooltip: [
            { field: 'bairro', type: 'nominal' },
            { field: 'sexo', type: 'nominal' },
            { field: 'FaixaEtaria', type: 'nominal' },
            { field: 'Populacao', type: 'quantitative' }
          ]
        }
      }
    };

    return spec;
  }

  private buildStackedData(top10Renda: Array<RendaDatum & { selecionado?: boolean }>): StackedDatum[] {
    return top10Renda.flatMap((d) => {
      const masculino = {
        cdBairro: String(d.CD_BAIRRO ?? '').trim(),
        bairro: d.NM_BAIRRO,
        sexo: 'Masculino',
        selecionado: d.selecionado,
        '0 a 14 anos': this.sumRange(d, ['Sexo masculino, 0 a 4 anos', 'Sexo masculino, 5 a 9 anos', 'Sexo masculino, 10 a 14 anos']),
        '15 a 29 anos': this.sumRange(d, ['Sexo masculino, 15 a 19 anos', 'Sexo masculino, 20 a 24 anos', 'Sexo masculino, 25 a 29 anos']),
        '30 a 59 anos': this.sumRange(d, ['Sexo masculino, 30 a 39 anos', 'Sexo masculino, 40 a 49 anos', 'Sexo masculino, 50 a 59 anos']),
        '60 anos ou mais': this.sumRange(d, ['Sexo masculino, 60 a 69 anos', 'Sexo masculino, 70 anos ou mais']),
      };

      const feminino = {
        cdBairro: String(d.CD_BAIRRO ?? '').trim(),
        bairro: d.NM_BAIRRO,
        sexo: 'Feminino',
        selecionado: d.selecionado,
        '0 a 14 anos': this.sumRange(d, ['Sexo feminino, 0 a 4 anos', 'Sexo feminino, 5 a 9 anos', 'Sexo feminino, 10 a 14 anos']),
        '15 a 29 anos': this.sumRange(d, ['Sexo feminino, 15 a 19 anos', 'Sexo feminino, 20 a 24 anos', 'Sexo feminino, 25 a 29 anos']),
        '30 a 59 anos': this.sumRange(d, ['Sexo feminino, 30 a 39 anos', 'Sexo feminino, 40 a 49 anos', 'Sexo feminino, 50 a 59 anos']),
        '60 anos ou mais': this.sumRange(d, ['Sexo feminino, 60 a 69 anos', 'Sexo feminino, 70 anos ou mais']),
      };

      return [masculino, feminino];
    }) as unknown as StackedDatum[];
  }

  private sumRange(d: RendaDatum, keys: string[]): number {
    return keys.reduce((acc, key) => acc + parseNumericValue(d[key]), 0);
  }
}
