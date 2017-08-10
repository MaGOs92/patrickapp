import { Component } from '@angular/core';
import { patrickServer } from './../../constantes';
import { Platform } from 'ionic-angular';

@Component({
  selector: 'pilotage',
  templateUrl: 'pilotage.html'
})
export class PilotageComponent {

  motorsSocketURL: string = patrickServer + '/motors';
  motorsWs: WebSocket;

  curDirection: number = 0;
  curSpeed: number = 0;

  constructor(private platform: Platform) {
    platform.ready().then(() => {
      this.connect();
    });
  }

  connect() {

    if (this.motorsWs != undefined) {
      this.motorsWs.close();
    }

    this.motorsWs = new WebSocket(this.motorsSocketURL);

    this.motorsWs.onopen = () => {
      console.log('Motors websocket : connection opened');
    };

    this.motorsWs.onmessage = (msg: MessageEvent) => {
      const data = JSON.parse(msg.data);
      if (data.motor === 'servo') {
        this.curDirection = parseInt(data.direction);
      } else if (data.motor === 'esc') {
        this.curSpeed = parseInt(data.speed);
      }
    };

    this.motorsWs.onclose = () => {
      console.log('Motors websocket : connection closed');
    };
  }

  sendCommand(data) {
    console.log(data);
    this.motorsWs.send(JSON.stringify(data));
  }

}
