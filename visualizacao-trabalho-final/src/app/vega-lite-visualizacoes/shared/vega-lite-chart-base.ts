import { AfterViewInit, Directive, ElementRef, ViewChild } from '@angular/core';
import embed, { VisualizationSpec } from 'vega-embed';

@Directive()
export abstract class VegaLiteChartBase implements AfterViewInit {
  @ViewChild('chart', { static: true }) protected chartContainer!: ElementRef<HTMLDivElement>;

  ngAfterViewInit(): void {
    void this.render();
  }

  protected async loadData(): Promise<Array<Record<string, unknown>>> {
    const response = await fetch('/data/Base_Fortaleza_Consolidada.json');
    return (await response.json()) as Array<Record<string, unknown>>;
  }

  protected async embedChart(spec: VisualizationSpec): Promise<void> {
    await embed(this.chartContainer.nativeElement, spec);
  }

  protected abstract createSpec(data: Array<Record<string, unknown>>): Promise<VisualizationSpec> | VisualizationSpec;

  private async render(): Promise<void> {
    const data = await this.loadData();
    const spec = await this.createSpec(data);
    await this.embedChart(spec);
  }
}
