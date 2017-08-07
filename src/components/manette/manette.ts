import { Component, ViewChild } from "@angular/core";

@Component({
  selector: "manette",
  templateUrl: "manette.html"
})
export class ManetteComponent {

  curSpeed: number = 0;
  @ViewChild("manette") manette;

  constructor() {}

  getTranslation(): string {
    let manetteHeight =  this.manette.nativeElement.offsetHeight;
    return "translateY(" + (manetteHeight / 5) * -this.curSpeed + "px)";
  }

  setSpeed(speed: number) {
    this.curSpeed = speed;
  }
}
