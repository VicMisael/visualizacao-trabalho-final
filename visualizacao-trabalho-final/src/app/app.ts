import { Component, signal } from '@angular/core';
import { FortalMap } from './map/map';
import { IncomeSectionComponent } from './story/income-section/income-section.component';
import { RaceSectionComponent } from './story/race-section/race-section.component';
import { EducationSectionComponent } from './story/education-section/education-section.component';
import { WomenSectionComponent } from './story/women-section/women-section.component';
import { AgeSectionComponent } from './story/age-section/age-section.component';
import { ConclusionSectionComponent } from './story/conclusion-section/conclusion-section.component';
import { IntroductionSectionComponent } from './story/introduction-section/introduction-sectioncomponent';

@Component({
  selector: 'app-root',
  imports: [IntroductionSectionComponent, FortalMap, IncomeSectionComponent, RaceSectionComponent, EducationSectionComponent, AgeSectionComponent, WomenSectionComponent, ConclusionSectionComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('visualizacao-trabalho-final');

  mapElementClickListener(obj: Object) {

    console.log(obj)

  }

  selectedBairrosListener(cdBairros: string[]) {

    console.log(cdBairros)

  }
}
