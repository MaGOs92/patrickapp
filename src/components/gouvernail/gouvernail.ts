import {
  Component,
  Input,
  EventEmitter,
  Output,
  OnChanges
} from "@angular/core";

@Component({
  selector: 'gouvernail',
  templateUrl: 'gouvernail.html'
})
export class GouvernailComponent implements OnChanges {

  clickable: boolean = true;
  @Input() curDirection: number;
  @Output() command: EventEmitter<any> = new EventEmitter();

  constructor() {

  }

  ngOnChanges(changes) {
    this.clickable = true;
    this.updateAiguilleRotation();
  }

  updateDirection(direction: number) {
    if (this.clickable && direction !== this.curDirection) {
      this.command.emit({
        motor: 'servo',
        direction: direction.toString()
      });
      this.clickable = false;
    }
  }

  updateAiguilleRotation(): string {
    return 'rotate(' + this.curDirection * 30 + 'deg)';
  }

}
