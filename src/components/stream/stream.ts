import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy
} from "@angular/core";
import { SocketService } from '../../providers/socket';
import WSAvcPlayer from '../../../node_modules/h264-live-player/wsavc';
import { patrickServer } from '../../constantes';
import { Platform } from 'ionic-angular';

@Component({
  selector: 'stream',
  templateUrl: 'stream.html'
})
export class StreamComponent implements OnInit, AfterViewInit, OnDestroy {

  streamSocketURI = patrickServer + '/stream';
  @ViewChild('canvas') canvas: ElementRef;
  wsavc;
  connected: boolean;

  constructor(private socketservice: SocketService, private platform: Platform) {
    platform.ready().then(() => {
      this.connect();
    });
    this.connected = false;
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.wsavc.disconnect();
  }

  ngAfterViewInit() {
    this.wsavc = new WSAvcPlayer(this.canvas.nativeElement, 'webgl', 1, 35);
    this.wsavc.on('wsClosed', () => {
      console.log('Stream websocket : connection closed');            
      this.connected = false;
    });
    this.wsavc.on('wsOpened', () => {
      console.log('Stream websocket : connection opened');      
      this.connected = true;
    });
  }

  connect() {
    this.wsavc.connect(this.streamSocketURI);
    this.wsavc.on('canvasReady', () => {
      this.playStream();
    });
  }

  playStream() {
    this.wsavc.playStream();
  }

  stopStream() {
    this.wsavc.stopStream();
  }

}
