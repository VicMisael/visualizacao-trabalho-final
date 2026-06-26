import { afterNextRender, Component, ElementRef, inject, model, output, viewChild } from '@angular/core';
import * as d3 from 'd3';
import { GeoDataService } from '../../core/services/geo-data';
import { DrillLevel } from '../../core/models/drill-level';
import { Controls } from './controls/controls';
import { FortalezaFeatureCollection, FortalezaMapFeature } from './map.types';


@Component({
  selector: 'fortal-map',
  imports: [Controls],
  templateUrl: './map.html',
  styleUrl: './map.scss',
})
export class FortalMap {

  currentDrillDownLevel = model<DrillLevel>(DrillLevel.DISTRITOS);

  elementClicked = output<FortalezaMapFeature>();

  private readonly mapContainer = viewChild.required<ElementRef<HTMLDivElement>>('mapContainer');
  private readonly geoData = inject(GeoDataService);

  private svg?: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  private zoom?: d3.ZoomBehavior<SVGSVGElement, unknown>;
  private viewportLayer?: d3.Selection<SVGGElement, unknown, null, undefined>;
  private mapLayer?: d3.Selection<SVGGElement, unknown, null, undefined>;
  private detailLayer?: d3.Selection<SVGGElement, unknown, null, undefined>;

  private path?: d3.GeoPath;
  private width = 0;
  private height = 0;


  constructor() {
    afterNextRender(() => {
      void this.initializeMap();
    });
  }

  private async initializeMap() {
    await this.drawMap();
    await this.drawDetail();
  }

  private async drawMap() {


    await this.renderMap();
  }

  private async drawDetail() {
    if (this.currentDrillDownLevel() != DrillLevel.DISTRITOS) {
      const geojson = (await this.geoData.loadLayer(this.currentDrillDownLevel())) as FortalezaFeatureCollection;

      const transform = d3.zoomTransform(this.svg?.node()!);
      this.renderDetail(this.getVisibleFeatures(geojson.features, transform));
      return;
    }

    this.clearDetailLayer();
  }

  private async renderMap() {
    const geojson = (await this.geoData.loadLayer(DrillLevel.DISTRITOS)) as FortalezaFeatureCollection;
    const container = this.mapContainer().nativeElement;

    this.width = container.clientWidth || 900;
    this.height = container.clientHeight;

    d3.select(container).selectAll('*').remove();

    const projection = d3.geoMercator().fitSize([this.width, this.height], geojson);
    const path = d3.geoPath(projection);
    this.path = path;

    const svg = d3
      .select(container)
      .append('svg')
      .attr('viewBox', `0 0 ${this.width} ${this.height}`)
      .attr('width', '100%')
      .attr('height', '100%');
    this.svg = svg;


    const viewportLayer = svg.append('g').attr('class', 'viewport-layer');
    this.mapLayer = viewportLayer.append('g').attr('class', 'map-layer');
    this.detailLayer = viewportLayer.append('g').attr('class', 'bairros-layer');
    this.viewportLayer = viewportLayer;

    this.zoom = this.setupZoom(svg, this.viewportLayer, this.width, this.height);

    this.mapLayer
      .selectAll('path')
      .data(geojson.features)
      .join('path')
      .attr('d', path)
      .attr('fill', '#d8efe6')
      .attr('stroke', '#38514a')
      .attr('stroke-width', 0.6);
  }

  private setupZoom(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    layer: d3.Selection<SVGGElement, unknown, null, undefined>,
    width: number,
    height: number,
  ): d3.ZoomBehavior<SVGSVGElement, unknown> {
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .extent([
        [0, 0],
        [2 * width, 2 * height],
      ])
      .translateExtent([
        [-width / 2, -height / 2],
        [2 * width, 2 * height],
      ])
      .scaleExtent([1, 20])
      .on('zoom', (event) => {

        layer.attr('transform', event.transform.toString());
        this.processZoom(event);
      });

    svg.call(zoom);

    return zoom;
  }



  private renderDetail(features: FortalezaMapFeature[]) {
    if (this.detailLayer == null || this.path == null) {
      return;
    }

    // console.log("[Render DEtail]", features)

    this.detailLayer
      .selectAll('path')
      .data(features)
      .join('path')
      .attr('d', this.path)
      .attr('fill', '#d8efe6')
      .attr('stroke', '#38514a')
      .attr('stroke-width', 0.6)
      .on('click', this.handleFeatureClick);

  }

  private handleFeatureClick(event: MouseEvent, feature: FortalezaMapFeature): void {
    event.stopPropagation();
    this.elementClicked.emit(feature);
    this.zoomToFeature(feature);
  }

  private clearDetailLayer(): void {
    this.detailLayer?.selectAll('*').remove();
  }


  // ==========================================
  // 1. ZOOM
  // ==========================================



  private processZoom(event: d3.D3ZoomEvent<SVGSVGElement, unknown>): void {
    //console.log("[Zoom level]", event.transform.k);
    const k = event.transform.k;
    let d: DrillLevel = DrillLevel.DISTRITOS;

    if (k > 5) {
      d = DrillLevel.SETORES;
    } else if (k > 3) {
      d = DrillLevel.BAIRRO;
    } else if (k > 2.4) {
      d = DrillLevel.SUBDISTRITOS;
    }

    this.currentDrillDownLevel.set(d)
    this.drawDetail()
  }

  private getVisibleFeatures(
    features: FortalezaMapFeature[],
    transform: d3.ZoomTransform,
  ): FortalezaMapFeature[] {
    if (!this.path || this.width === 0 || this.height === 0) {
      return [];
    }

    const viewportBounds = this.getViewportBounds(transform);

    return features.filter((feature) => {
      const featureBounds = this.path!.bounds(feature);

      return this.boundsIntersect(featureBounds, viewportBounds);
    });
  }

  private getViewportBounds(
    transform: d3.ZoomTransform,
  ): [[number, number], [number, number]] {
    return [
      transform.invert([0, 0]),
      transform.invert([this.width, this.height]),
    ];
  }

  private boundsIntersect(
    featureBounds: [[number, number], [number, number]],
    viewportBounds: [[number, number], [number, number]],
  ): boolean {
    const [[featureX0, featureY0], [featureX1, featureY1]] = featureBounds;
    const [[viewportX0, viewportY0], [viewportX1, viewportY1]] = viewportBounds;

    return (
      featureX1 >= viewportX0 &&
      featureX0 <= viewportX1 &&
      featureY1 >= viewportY0 &&
      featureY0 <= viewportY1
    );
  }

  private zoomToFeature(
    feature: FortalezaMapFeature,
  ) {
    if (!this.path || !this.svg || !this.zoom || this.width === 0 || this.height === 0) {
      return;
    }

    console.log("Zooming to Feature")
    const [[x0, y0], [x1, y1]] = this.path.bounds(feature);

    const dx = x1 - x0;
    const dy = y1 - y0;

    if (dx === 0 || dy === 0) {
      return;
    }

    const centerX = (x0 + x1) / 2;
    const centerY = (y0 + y1) / 2;
    const scale = Math.min(20, 0.60 / Math.max(dx / this.width, dy / this.height));
    const translateX = this.width / 2 - scale * centerX;
    const translateY = this.height / 2 - scale * centerY;
    const transform = d3.zoomIdentity.translate(translateX, translateY).scale(scale);

    this.svg
      .transition()
      .duration(350)
      .call(this.zoom.transform, transform);

  }
}


