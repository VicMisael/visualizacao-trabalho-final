import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import embed, { VisualizationSpec } from 'vega-embed';

type ScatterDatum = {
  bairro: string;
  rendimento: number;
  populacao: number;
  alfabetizados: number;
  taxaAlfabetizacao: number;
  destaque: boolean;
};

@Component({
  selector: 'app-scatter-rendimento-alfabetizacao',
  standalone: true,
  template: `<div #chart></div>`,
})
export class ScatterRendimentoAlfabetizacaoComponent implements AfterViewInit {
  @ViewChild('chart', { static: true }) chartContainer!: ElementRef<HTMLDivElement>;

  ngAfterViewInit(): void {
    void this.renderChart();
  }

  private async renderChart(): Promise<void> {
    const response = await fetch('/data/Base_Fortaleza_Consolidada.json');
    const data = (await response.json()) as Array<Record<string, unknown>>;

    const chaveRenda = 'Valor do rendimento nominal médio mensal das pessoas responsáveis com rendimentos por domicílios particulares permanentes ocupados';
    const dadosScatter = this.prepareData(data, chaveRenda);

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

    await embed(this.chartContainer.nativeElement, spec);
  }

  private prepareData(data: Array<Record<string, unknown>>, chaveRenda: string): ScatterDatum[] {
    const dadosBase = data.map((d) => {
      const populacao = this.sumValues(d, [
        '0 a 4 anos',
        '5 a 9 anos',
        '10 a 14 anos',
        '15 a 19 anos',
        '20 a 24 anos',
        '25 a 29 anos',
        '30 a 39 anos',
        '40 a 49 anos',
        '50 a 59 anos',
        '60 a 69 anos',
        '70 anos ou mais',
      ]);

      const alfabetizados = this.sumValues(d, [
        'Pessoas alfabetizadas, 15 a 19 anos',
        'Pessoas alfabetizadas, 20 a 24 anos',
        'Pessoas alfabetizadas, 25 a 29 anos',
        'Pessoas alfabetizadas, 30 a 34 anos',
        'Pessoas alfabetizadas, 35 a 39 anos',
        'Pessoas alfabetizadas, 40 a 44 anos',
        'Pessoas alfabetizadas, 45 a 49 anos',
        'Pessoas alfabetizadas, 50 a 54 anos',
        'Pessoas alfabetizadas, 55 a 59 anos',
        'Pessoas alfabetizadas, 60 a 64 anos',
        'Pessoas alfabetizadas, 65 a 69 anos',
        'Pessoas alfabetizadas, 70 a 79 anos',
        'Pessoas alfabetizadas, 80 anos ou mais',
      ]);

      const rendimento = this.parseNumber(d[chaveRenda]);
      const taxaAlfabetizacao = populacao > 0 ? (alfabetizados / populacao) * 100 : 0;

      return {
        bairro: typeof d['NM_BAIRRO'] === 'string' ? d['NM_BAIRRO'] : '',
        rendimento,
        populacao,
        alfabetizados,
        taxaAlfabetizacao,
        destaque: false,
      } satisfies ScatterDatum;
    });

    const topN = new Set(
      [...dadosBase]
        .sort((a, b) => b.rendimento - a.rendimento)
        .slice(0, 10)
        .map((d) => d.bairro)
    );

    return dadosBase.map((d) => ({ ...d, destaque: topN.has(d.bairro) }));
  }

  private sumValues(d: Record<string, unknown>, keys: string[]): number {
    return keys.reduce((acc, key) => acc + this.parseNumber(d[key]), 0);
  }

  private parseNumber(value: unknown): number {
    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : 0;
    }

    if (typeof value === 'string') {
      const normalized = value.replace(/\./g, '').replace(',', '.').trim();
      const parsed = Number.parseFloat(normalized);
      return Number.isFinite(parsed) ? parsed : 0;
    }

    return 0;
  }
}
