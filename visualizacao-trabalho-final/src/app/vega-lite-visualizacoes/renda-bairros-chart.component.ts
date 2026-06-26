import { Component } from '@angular/core';
import { VisualizationSpec } from 'vega-embed';
import { buildTopIncomeNeighborhoods } from './models/chart-data.utils';
import { VegaLiteChartBase } from './shared/vega-lite-chart-base';

@Component({
  selector: 'app-renda-bairros-chart',
  standalone: true,
  template: `<div #chart></div>`,
})
export class RendaBairrosChartComponent extends VegaLiteChartBase {
  override createSpec(data: Array<Record<string, unknown>>): VisualizationSpec {
    const chaveRenda = 'Valor do rendimento nominal médio mensal das pessoas responsáveis com rendimentos por domicílios particulares permanentes ocupados';
    const top10Renda = buildTopIncomeNeighborhoods(data, chaveRenda);

    const spec: VisualizationSpec = {
      $schema: 'https://vega.github.io/schema/vega-lite/v6.json',
      title: 'Top 10 bairros com maior rendimento',
      width: 800,
      height: 300,
      data: { values: top10Renda },
      mark: { type: 'bar', tooltip: true, color: '#4E79A7' },
      encoding: {
        x: {
          field: 'rendimento',
          type: 'quantitative',
          title: 'Valor',
        },
        y: {
          field: 'NM_BAIRRO',
          type: 'nominal',
          title: 'Bairro',
          sort: '-x',
        },
      },
    };

    return spec;
  }
}
