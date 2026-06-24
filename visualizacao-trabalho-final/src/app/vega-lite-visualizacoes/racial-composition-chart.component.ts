import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import embed, { VisualizationSpec } from 'vega-embed';

type NeighborhoodDatum = Record<string, unknown> & {
  NM_BAIRRO?: string;
  total: number;
};

@Component({
  selector: 'app-racial-composition-chart',
  standalone: true,
  template: `<div #chart></div>`,
})
export class RacialCompositionChartComponent implements AfterViewInit {
  @ViewChild('chart', { static: true }) chartContainer!: ElementRef<HTMLDivElement>;

  ngAfterViewInit(): void {
    void this.renderChart();
  }

  private async renderChart(): Promise<void> {
    const response = await fetch('/data/Base_Fortaleza_Consolidada.json');
    const data = (await response.json()) as Array<Record<string, unknown>>;

    const top10Bairros = this.prepareData(data);

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

    await embed(this.chartContainer.nativeElement, spec);
  }

  private prepareData(data: Array<Record<string, unknown>>): NeighborhoodDatum[] {
    return data
      .map((d) => {
        const neighborhoodName = typeof d['NM_BAIRRO'] === 'string' ? d['NM_BAIRRO'] : '';

        return {
          ...d,
          NM_BAIRRO: neighborhoodName,
          total:
            Number(d['Cor ou raça é parda'] ?? 0) +
            Number(d['Cor ou raça é branca'] ?? 0) +
            Number(d['Cor ou raça é preta'] ?? 0) +
            Number(d['Cor ou raça é amarela'] ?? 0) +
            Number(d['Cor ou raça é indígena'] ?? 0),
        } as NeighborhoodDatum;
      })
      .sort((a, b) => Number(b.total) - Number(a.total))
      .slice(0, 10);
  }
}
