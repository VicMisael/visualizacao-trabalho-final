import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import embed, { VisualizationSpec } from 'vega-embed';
import { RendaDatum } from './models/chart-data.models';
import { buildTopIncomeNeighborhoods } from './models/chart-data.utils';

@Component({
  selector: 'app-renda-bairros-chart',
  standalone: true,
  template: `<div #chart></div>`,
})
export class RendaBairrosChartComponent implements AfterViewInit {
  @ViewChild('chart', { static: true }) chartContainer!: ElementRef<HTMLDivElement>;

  ngAfterViewInit(): void {
    void this.renderChart();
  }

  private async renderChart(): Promise<void> {
    const response = await fetch('/data/Base_Fortaleza_Consolidada.json');
    const data = (await response.json()) as Array<Record<string, unknown>>;

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

    await embed(this.chartContainer.nativeElement, spec);
  }

}
