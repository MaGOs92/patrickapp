import { Component, OnInit } from "@angular/core";
import { raspiBoatConfig } from './../../constantes';
import { Platform } from 'ionic-angular';
import { ViewChild } from "@angular/core/src/metadata/di";

@Component({
  selector: "pilotage",
  templateUrl: "pilotage.html"
})
export class PilotageComponent implements OnInit {
  motorsSocketURL: string = raspiBoatConfig.raspiBoatServer.protocol + '://' + raspiBoatConfig.ip + ':' + raspiBoatConfig.raspiBoatServer.port + '/mortors';
  motorsWs: WebSocket;

  connected: boolean;

  directionValue: number = 150;
  directionMinValue: number = -35;
  directionMaxValue: number = 35;

  speedValue: number = 150;
  speedMinValue: number = 0;
  speedMaxValue: number = 100;

  @ViewChild("uiControls") uiControlsRef;
  uiControls;

  gaugeSize: number;
  gaugeMotorthresholdsConfig = {
    "0": { color: "green" },
    "75": { color: "orange" },
    "90": { color: "red" }
  };

  constructor(private platform: Platform) {
    platform.ready().then(() => {
      this.connect();
    });
    this.connected = false;
  }

  ngOnInit() {
    this.uiControls = this.uiControlsRef.nativeElement;
    this.gaugeSize = this.uiControls.offsetHeight / 2;
  }

  connect() {
    if (this.motorsWs != undefined) {
      this.motorsWs.close();
    }

    this.motorsWs = new WebSocket(this.motorsSocketURL);

    this.motorsWs.onopen = () => {
      console.log("Motors websocket : connection opened");
      this.connected = true;
    };

    this.motorsWs.onmessage = (msg: MessageEvent) => {};

    this.motorsWs.onclose = () => {
      console.log("Motors websocket : connection closed");
      this.connected = false;
    };
  }

  sendCommand(data) {
    this.motorsWs.send(JSON.stringify(data));
  }

  fnSpeed(): number {
    return Math.floor(Math.abs(this.speedValue - 150) * 5 / 3);
  }

  fnDirection(): number {
    return Math.floor(this.directionValue - 150) * 2;
  }

  update(event) {
    this.directionValue = Math.floor(150 + -(event.deltaX / 4));
    if (this.directionValue > 185) {
      this.directionValue = 185;
    }
    if (this.directionValue < 115) {
      this.directionValue = 115;
    }
    this.speedValue = Math.floor(150 + -(event.deltaY / 4));
    if (this.speedValue > 180) {
      this.speedValue = 180;
    }
    if (this.speedValue < 90) {
      this.speedValue = 90;
    }
    this.sendCommand({
      speed: this.speedValue,
      direction: this.directionValue
    });
  }
}
