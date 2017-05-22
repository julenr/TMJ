import { Component } from '@angular/core';


@Component({
  selector: 'my-app',
  template: `<h5>Trade Me {{name}}</h5>
    <input #box (keyup)="0">
    <p>{{box.value}}</p>
  `,
})
export class AppComponent  {
  name = 'Jobs';
}
