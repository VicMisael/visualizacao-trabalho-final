import { Component } from '@angular/core';
import { VisualizationSpec } from 'vega-embed';
import { parseNumericValue } from './models/chart-data.models';
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
      title: 'Top 10 bairros com maior rendimento',
      height: 300,
      padding: 20,
      autosize: {
        type: 'fit',
        contains: 'padding',
      },
      data: { values: visibleRows },
      mark: { type: 'bar', tooltip: true },
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
        color: {
          condition: { test: 'datum.selecionado === true', value: '#d62728' },
          value: '#4E79A7',
          legend: null,
        },
        opacity: {
          condition: { test: 'datum.selecionado === true', value: 1 },
          value: this.hasSelectedBairros() ? 0.45 : 0.85,
        },
      },
    };

    return spec;
  }
}
