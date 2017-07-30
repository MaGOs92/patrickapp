import { Component } from '@angular/core';

/*
  Generated class for the Photo component.

  See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
  for more info on Angular 2 Components.
*/
@Component({
  selector: 'photo',
  templateUrl: 'photo.html'
})
export class PhotoComponent {

  text: string;

  constructor() {
    console.log('Hello Photo Component');
    this.text = 'Hello World';
  }

}
