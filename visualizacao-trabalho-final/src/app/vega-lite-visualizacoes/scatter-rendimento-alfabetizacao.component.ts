import { Component } from '@angular/core';
import { VisualizationSpec } from 'vega-embed';
import { buildLiteracyScatterData } from './models/chart-data.utils';
import { VegaLiteChartBase } from './shared/vega-lite-chart-base';

@Component({
  selector: 'app-scatter-rendimento-alfabetizacao',
  standalone: true,
  template: `<div #chart></div>`,
})
export class ScatterRendimentoAlfabetizacaoComponent extends VegaLiteChartBase {
  override createSpec(data: Array<Record<string, unknown>>): VisualizationSpec {
    const chaveRenda = 'Valor do rendimento nominal médio mensal das pessoas responsáveis com rendimentos por domicílios particulares permanentes ocupados';
    const dadosScatter = buildLiteracyScatterData(data, chaveRenda);

    const points = {
      data: { values: dadosScatter },
      mark: { type: 'circle' as const, size: 90, opacity: 0.75 },
      encoding: {
        x: {
          field: 'taxaAlfabetizacao' as const,
          type: 'quantitative' as const,
          scale: { domain: [65, 100] },
          title: 'Taxa de Alfabetização (%)',
        },
        y: {
          field: 'rendimento' as const,
          type: 'quantitative' as const,
          title: 'Rendimento Médio',
        },
        color: {
          field: 'destaque' as const,
          type: 'nominal' as const,
          scale: {
            domain: [true, false],
            range: ['#d62728', '#1f77b4'],
          },
          legend: {
            title: 'Grupos',
            labelExpr: "datum.value ? 'Top 10 renda' : 'Outros bairros'",
          },
        },
        opacity: {
          condition: { test: 'datum.destaque === true', value: 1 },
          value: 0.4,
        },
        tooltip: [
          { field: 'bairro' as const, type: 'nominal' as const },
          { field: 'rendimento' as const, type: 'quantitative' as const },
          { field: 'populacao' as const, type: 'quantitative' as const },
          { field: 'alfabetizados' as const, type: 'quantitative' as const },
          { field: 'taxaAlfabetizacao' as const, type: 'quantitative' as const },
        ],
      },
    };

    const regressionLine = {
      data: { values: dadosScatter },
      transform: [
        {
          regression: 'rendimento' as const,
          on: 'taxaAlfabetizacao' as const,
          method: 'linear' as const,
        },
      ],
      mark: { type: 'line' as const, color: 'black', strokeWidth: 2 },
      encoding: {
        x: { field: 'taxaAlfabetizacao' as const, type: 'quantitative' as const },
        y: { field: 'rendimento' as const, type: 'quantitative' as const },
      },
    };

    const spec: VisualizationSpec = {
      $schema: 'https://vega.github.io/schema/vega-lite/v6.json',
      title: 'Relação entre Rendimento e Alfabetização por Bairro',
      width: 650,
      height: 450,
      layer: [points, regressionLine],
    };

    return spec;
  }
}
