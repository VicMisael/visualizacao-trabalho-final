import { Component } from '@angular/core';
import { VisualizationSpec } from 'vega-embed';
import { buildWomenResponsibleScatterData } from './models/chart-data.utils';
import { VegaLiteChartBase } from './shared/vega-lite-chart-base';

@Component({
  selector: 'app-renda-mulher-responsavel-scatter',
  standalone: true,
  template: `<div #chart></div>`,
})
export class RendaMulherResponsavelScatterComponent extends VegaLiteChartBase {
  override createSpec(data: Array<Record<string, unknown>>): VisualizationSpec {
    const dadosScatter = buildWomenResponsibleScatterData(data);

    const points = {
      data: { values: dadosScatter },
      mark: { type: 'circle' as const, size: 90, opacity: 0.75 },
      encoding: {
        x: {
          field: 'proporcaoMulheresResponsaveis' as const,
          type: 'quantitative' as const,
          title: 'Mulheres Responsáveis pelo Domicílio (%)',
        },
        y: {
          field: 'rendimento' as const,
          type: 'quantitative' as const,
          title: 'Rendimento Nominal Médio',
        },
        color: {
          field: 'destaque' as const,
          type: 'nominal' as const,
          scale: {
            domain: [true, false],
            range: ['#d62728', '#1f77b4'],
          },
          legend: {
            title: 'Grupo',
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
          { field: 'responsaveisMulheres' as const, type: 'quantitative' as const, title: 'Resp. Femininas' },
          { field: 'responsaveisHomens' as const, type: 'quantitative' as const, title: 'Resp. Masculinas' },
          { field: 'proporcaoMulheresResponsaveis' as const, type: 'quantitative' as const, title: '% Mulheres Responsáveis' },
        ],
      },
    };

    const regression = {
      data: { values: dadosScatter },
      transform: [
        {
          regression: 'rendimento' as const,
          on: 'proporcaoMulheresResponsaveis' as const,
          method: 'linear' as const,
        },
      ],
      mark: { type: 'line' as const, color: 'black', strokeWidth: 2 },
      encoding: {
        x: { field: 'proporcaoMulheresResponsaveis' as const, type: 'quantitative' as const },
        y: { field: 'rendimento' as const, type: 'quantitative' as const },
      },
    };

    const spec: VisualizationSpec = {
      $schema: 'https://vega.github.io/schema/vega-lite/v6.json',
      title: 'Correlação entre Renda e Proporção de Chefia Feminina',
      height: 450,
      padding: 20,
      autosize: {
        type: 'fit',
        contains: 'padding',
      },
      layer: [points, regression],
    };

    return spec;
  }
}
