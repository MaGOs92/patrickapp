import {
  Component,
  Input,
  EventEmitter,
  Output,
  OnChanges,
  ViewChild
} from "@angular/core";

@Component({
  selector: "manette",
  templateUrl: "manette.html"
})
export class ManetteComponent implements OnChanges {

  clickable: boolean = true;
  @Input() curSpeed: number;
  @Output() command: EventEmitter<any> = new EventEmitter();
  @ViewChild("manette") manette;

  constructor() {

  }

  ngOnChanges(changes) {
    this.clickable = true;
    this.updateTranslation();
  }

  updateTranslation(): string {
    let manetteHeight =  this.manette.nativeElement.offsetHeight;
    return "translateY(" + (manetteHeight / 5) * -this.curSpeed + "px)";
  }

  updateSpeed(speed: number) {
    if (this.clickable && speed !== this.curSpeed) {
      this.command.emit({
        motor: 'esc',
        speed: speed.toString()
      });
      this.clickable = false;
    }
  }
}
