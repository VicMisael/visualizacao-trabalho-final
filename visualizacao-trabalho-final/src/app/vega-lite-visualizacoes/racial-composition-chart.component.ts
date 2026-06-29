import { Component } from '@angular/core';
import { VisualizationSpec } from 'vega-embed';
import { buildTopIncomeNeighborhoods, buildTopNeighborhoods } from './models/chart-data.utils';
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

    const spec: VisualizationSpec = {
      $schema: 'https://vega.github.io/schema/vega-lite/v6.json',
      title: 'Composição racial dos 10 bairros com maior rendimento',
      width: 800,
      height: 350,
      data: { values: top10Renda },
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
            field: chaveRenda,
            op: 'max',
            order: 'descending'
          }
        },
        color: {
          field: 'Cor',
          type: 'nominal',
          title: 'Cor/Raça',
          scale: { scheme: 'tableau10' },
        },
      },
    };

    return spec;
  }
}
