import { Component } from '@angular/core';

/*
  Generated class for the Gouvernail component.

  See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
  for more info on Angular 2 Components.
*/
@Component({
  selector: 'gouvernail',
  templateUrl: 'gouvernail.html'
})
export class GouvernailComponent {

  curDirection: number = 0;

  constructor() {

  }

  updateDirection(direction: number) {
    this.curDirection = direction;
  }

  updateAiguilleRotation(): string {
    return 'rotate(' + this.curDirection * 30 + 'deg)';
  }

}
