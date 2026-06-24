import { Component } from '@angular/core';
import { VisualizationSpec } from 'vega-embed';
import { buildTopNeighborhoods } from './models/chart-data.utils';
import { VegaLiteChartBase } from './shared/vega-lite-chart-base';

@Component({
  selector: 'app-racial-composition-chart',
  standalone: true,
  template: `<div #chart></div>`,
})
export class RacialCompositionChartComponent extends VegaLiteChartBase {
  override createSpec(data: Array<Record<string, unknown>>): VisualizationSpec {
    const top10Bairros = buildTopNeighborhoods(data, [
      'Cor ou raça é parda',
      'Cor ou raça é branca',
      'Cor ou raça é preta',
      'Cor ou raça é amarela',
      'Cor ou raça é indígena',
    ]);

    const spec: VisualizationSpec = {
      $schema: 'https://vega.github.io/schema/vega-lite/v6.json',
      title: 'Composição racial dos 10 bairros mais populosos de Fortaleza',
      width: 800,
      height: 350,
      data: { values: top10Bairros },
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
          title: 'Valor',
        },
        y: {
          field: 'NM_BAIRRO',
          type: 'nominal',
          title: 'Bairro',
          sort: '-x',
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
