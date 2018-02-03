import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { StreamComponent, PilotageComponent, GouvernailComponent, ManetteComponent, OptionsComponent, PhotoComponent } from "../components";
import { SocketService, WatchdogService } from "../providers";
import { NgxVirtualJoystickModule } from "ngx-virtual-joystick";
import { NgxGaugeModule } from "ngx-gauge";

@NgModule({
  declarations: [
    MyApp,
    StreamComponent,
    PilotageComponent,
    GouvernailComponent,
    ManetteComponent,
    OptionsComponent,
    PhotoComponent
  ],
  imports: [
    IonicModule.forRoot(MyApp),
    NgxVirtualJoystickModule.forRoot(),
    NgxGaugeModule,
  ],
  bootstrap: [IonicApp],
  entryComponents: [MyApp],
  providers: [
    SocketService,
    WatchdogService,
    { provide: ErrorHandler, useClass: IonicErrorHandler }
  ]
})
export class AppModule {}
