import {
  Component, Input
} from "@angular/core";

@Component({
  selector: "gouvernail",
  templateUrl: "gouvernail.html"
})
export class GouvernailComponent {

  @Input() value: number;
  @Input() size: number;

  constructor() {}

  updateAiguilleRotation(): string {
    return "rotate(" + this.value + "deg)";
  }
}
