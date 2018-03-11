import { Component, ViewChild } from "@angular/core";
import { Platform, AlertController, Alert } from "ionic-angular";
import { StatusBar, Splashscreen } from "ionic-native";
import { PilotageComponent, StreamComponent } from "../components/index";

@Component({
  templateUrl: 'app.html'
})
export class MyApp {

  alert: Alert;
  @ViewChild(StreamComponent) stream: StreamComponent;
  @ViewChild(PilotageComponent) pilotage: PilotageComponent;

  constructor(private platform: Platform, private alertCtrl: AlertController) {
    platform.ready().then(() => {
      StatusBar.styleDefault();
      Splashscreen.hide();
      platform.registerBackButtonAction(() => {
        if (this.alert) {
          this.alert.dismiss();
          this.alert = null;     
        } else {
          this.showAlert();
         }
      });
    });
  }

  showAlert() {
    this.alert = this.alertCtrl.create({
      title: 'Quitter l\'application?',
      message: 'Etes vous sûr de vouloir quitter?',
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel',
          handler: () => {
            this.alert = null;
          }
        },
        {
          text: 'Quitter',
          handler: () => {
            this.platform.exitApp();
          }
        }
      ]
    });
    this.alert.present();
  }

  tryConnection() {
    if (!this.pilotage.connected) {
      this.pilotage.connect();
    }
    if (!this.stream.connected) {
      this.stream.connect();
    }
  }
}
