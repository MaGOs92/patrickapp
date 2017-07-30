import { Component } from '@angular/core';

/*
  Generated class for the Options component.

  See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
  for more info on Angular 2 Components.
*/
@Component({
  selector: 'options',
  templateUrl: 'options.html'
})
export class OptionsComponent {

  text: string;

  constructor() {
    console.log('Hello Options Component');
    this.text = 'Hello World';
  }

}
