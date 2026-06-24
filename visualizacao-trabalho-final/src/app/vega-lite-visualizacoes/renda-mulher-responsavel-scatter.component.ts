import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import embed, { VisualizationSpec } from 'vega-embed';
import { MulherResponsavelScatterDatum } from './models/chart-data.models';
import { buildWomenResponsibleScatterData } from './models/chart-data.utils';

@Component({
  selector: 'app-renda-mulher-responsavel-scatter',
  standalone: true,
  template: `<div #chart></div>`,
})
export class RendaMulherResponsavelScatterComponent implements AfterViewInit {
  @ViewChild('chart', { static: true }) chartContainer!: ElementRef<HTMLDivElement>;

  ngAfterViewInit(): void {
    void this.renderChart();
  }

  private async renderChart(): Promise<void> {
    const response = await fetch('/data/Base_Fortaleza_Consolidada.json');
    const data = (await response.json()) as Array<Record<string, unknown>>;

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
      title: 'Correlação entre Rendimento Nominal Médio e Proporção de Mulheres Responsáveis pelo Domicílio nos Bairros de Fortaleza',
      width: 650,
      height: 450,
      layer: [points, regression],
    };

    await embed(this.chartContainer.nativeElement, spec);
  }

}
