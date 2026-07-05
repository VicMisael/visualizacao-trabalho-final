import { Component, model } from '@angular/core';
import { DrillLevel } from '../../../core/models/drill-level';

@Component({
  selector: 'app-controls',
  imports: [],
  templateUrl: './controls.html',
  styleUrl: './controls.scss',
})
export class Controls {
  drillLevel = model.required<DrillLevel>();
  automaticDrilldown = model.required<boolean>();

  protected readonly drillOptions = [
    { label: 'Distritos', value: DrillLevel.DISTRITOS },
    { label: 'Subdistritos', value: DrillLevel.SUBDISTRITOS },
    { label: 'Bairros', value: DrillLevel.BAIRRO },
    { label: 'Setores', value: DrillLevel.SETORES },
  ];

  protected selectDrillLevel(drillLevel: DrillLevel): void {
    if(!this.automaticDrilldown())
      this.drillLevel.set(drillLevel);
  }

  protected toggleAutomaticDrilldown(): void {
    this.automaticDrilldown.update((enabled) => !enabled);
  }

}
