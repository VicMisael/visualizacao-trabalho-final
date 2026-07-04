import {
  AfterViewInit,
  Directive,
  ElementRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';

import embed, { VisualizationSpec } from 'vega-embed';

@Directive()
export abstract class VegaLiteChartBase
  implements AfterViewInit, OnDestroy
{
  @ViewChild('chart', { static: true })
  protected chartContainer!: ElementRef<HTMLDivElement>;

  private resizeObserver?: ResizeObserver;

  ngAfterViewInit(): void {

    void this.render();

    this.resizeObserver = new ResizeObserver(() => {

      void this.render();

    });

    this.resizeObserver.observe(
      this.chartContainer.nativeElement.parentElement!
    );
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  protected async loadData(): Promise<Array<Record<string, unknown>>> {
    const response = await fetch('/data/bairros/Base_Fortaleza_Consolidada.json');
    return response.json();
  }

  protected async embedChart(spec: any): Promise<void> {

    spec.width =
      this.chartContainer.nativeElement.parentElement!.clientWidth;

    await embed(this.chartContainer.nativeElement, spec, {
      actions: false,
    });
  }

 protected abstract createSpec(
  data: Array<Record<string, unknown>>,
  width: number
): Promise<VisualizationSpec> | VisualizationSpec;

  private async render(): Promise<void> {

  const data = await this.loadData();

  const width =
    this.chartContainer.nativeElement.parentElement!.clientWidth;

  const spec = await this.createSpec(data, width);

  await this.embedChart(spec);

}
}