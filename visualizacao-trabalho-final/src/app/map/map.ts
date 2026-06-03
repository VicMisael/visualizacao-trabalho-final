import { afterNextRender, Component, ElementRef, inject, viewChild } from '@angular/core';
import * as d3 from 'd3';
import { GeoDataService } from '../services/geo-data';

@Component({
  selector: 'fortal-map',
  imports: [],
  templateUrl: './map.html',
  styleUrl: './map.scss',
})
export class FortalMap {
  private readonly mapContainer = viewChild.required<ElementRef<HTMLDivElement>>('mapContainer');
  private readonly geoData = inject(GeoDataService);

  constructor() {
    afterNextRender(() => {
      this.drawMap();
    });
  }

  private async drawMap() {
    const geojson = await this.geoData.loadLayer('bairros');

    this.renderMap(geojson);
  }

  private renderMap(geojson: GeoJSON.FeatureCollection) {
    const container = this.mapContainer().nativeElement;

    const width = container.clientWidth || 900;
    const height = 600;

    d3.select(container).selectAll('*').remove();

    const projection = d3.geoMercator().fitSize([width, height], geojson);
    const path = d3.geoPath(projection);

    const svg = d3
      .select(container)
      .append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('width', '100%')
      .attr('height', '100%');


    const layer = svg.append('g').attr('class', 'map-layer');

    this.setupZoom(svg, layer);

    layer
      .selectAll('path')
      .data(geojson.features)
      .join('path')
      .attr('d', path)
      .attr('fill', '#d8efe6')
      .attr('stroke', '#38514a')
      .attr('stroke-width', 0.6)
      .on('click', (_, feature) => {
        console.log(feature.properties);
      });
  }

  private setupZoom(svg: d3.Selection<SVGSVGElement, unknown, null, undefined>, layer: d3.Selection<SVGGElement, unknown, null, undefined>) {
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 12])
      .on('zoom', (event) => {
        layer.attr('transform', event.transform.toString());
        console.log("ZOOOM")
        console.log("Transform:",event.transform)
      });

    svg.call(zoom);
  }

}
