import { Component } from '@angular/core';
import { VisualizationSpec } from 'vega-embed';
import { parseNumericValue } from './models/chart-data.models';
import { buildTopIncomeNeighborhoods } from './models/chart-data.utils';
import { VegaLiteChartBase } from './shared/vega-lite-chart-base';

@Component({
  selector: 'app-racial-composition-chart',
  standalone: true,
  template: `<div #chart></div>`,
})
export class RacialCompositionChartComponent extends VegaLiteChartBase {
  override createSpec(data: Array<Record<string, unknown>>): VisualizationSpec {
    const chaveRenda = 'Valor do rendimento nominal médio mensal das pessoas responsáveis com rendimentos por domicílios particulares permanentes ocupados';
    const top10Renda = buildTopIncomeNeighborhoods(data, chaveRenda);
    const allRenda = data
      .map((d) => ({
        ...d,
        NM_BAIRRO: typeof d['NM_BAIRRO'] === 'string' ? d['NM_BAIRRO'] : '',
        rendimento: parseNumericValue(d[chaveRenda]),
      }))
      .sort((a, b) => b.rendimento - a.rendimento);
    const visibleRows = this.withSelectedFlag(this.includeSelectedRows(top10Renda, allRenda));

    const spec: VisualizationSpec = {
      $schema: 'https://vega.github.io/schema/vega-lite/v6.json',
      title: 'Composição racial (%) dos 10 bairros com maior rendimento nominal médio',
      height: 350,
      padding: 20,
      autosize: {
        type: 'fit',
        contains: 'padding',
      },
      data: { values: visibleRows },
      transform: [
        {
          fold: [
            'Cor ou raça é parda',
            'Cor ou raça é branca',
            'Cor ou raça é preta',
            'Cor ou raça é amarela',
            'Cor ou raça é indígena',
          ],
          as: ['Cor', 'Valor'],
        },
      ],
      mark: { type: 'bar', tooltip: true },
      encoding: {
        x: {
          field: 'Valor',
          type: 'quantitative',
          title: 'Composição (%)',
          stack: 'normalize',
          axis: {
            format: '.0%'
          }
        },
        y: {
          field: 'NM_BAIRRO',
          type: 'nominal',
          title: 'Bairro',
          sort: {
            field: 'Valor',
            op: 'max',
            order: 'descending'
          }
        },
        color: {
          field: 'Cor',
          type: 'nominal',
          title: 'Cor/Raça',
          scale: {
            domain: [
              'Cor ou raça é branca',
              'Cor ou raça é parda',
              'Cor ou raça é preta',
              'Cor ou raça é amarela',
              'Cor ou raça é indígena',
            ],
            range: [
              '#075985', // Branca (azul)
              '#A67C52', // Parda (marrom)
              '#2F2F2F', // Preta (cinza escuro)
              '#FACC15', // Amarela
              '#16A34A', // Indígena (verde)
            ],
          },
        },
        opacity: {
          condition: { test: 'datum.selecionado === true', value: 1 },
          value: this.hasSelectedBairros() ? 0.45 : 0.9,
        },
      },
    };

    return spec;
  }
}
