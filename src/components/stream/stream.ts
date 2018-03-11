import {
  Component,
  OnInit,
  ViewChild,
  ElementRef
} from "@angular/core";
import { raspiBoatConfig } from '../../constantes';
import { Platform } from 'ionic-angular';
import { WsWebRTCService } from "../../providers/ws-web-rtc";

@Component({
  selector: 'stream',
  templateUrl: 'stream.html'
})
export class StreamComponent implements OnInit {

  rwsServerURL = raspiBoatConfig.rwsServer.protocol + '://' + raspiBoatConfig.ip + ':' + raspiBoatConfig.rwsServer.port + '/rws/ws';
  websocket: WebSocket;
  @ViewChild('video') videoRef: ElementRef;
  video;
  connected: boolean;

  constructor(
    private platform: Platform, private wsWebRTCService: WsWebRTCService) {
      platform.ready().then(() => {
        this.connect();
      });
      this.wsWebRTCService.websocketStatus$.subscribe(wsState => {
        this.connected = (wsState === WebSocket.OPEN || wsState === WebSocket.CONNECTING);
        console.log('STREAM CONNECTED : ' + this.connected)
      });
    }

  ngOnInit() {
    console.log('INIT COMPONENNT');
    this.video = this.videoRef.nativeElement;
    this.wsWebRTCService.isStreaming.subscribe((isStreaming: boolean) => {
      console.log('STREAM RECEIVED PEERCONNECTION');
      if (isStreaming) {
        this.setVideoStream();
      }
    });
  }

  connect() {
    this.wsWebRTCService.createWebSocket(this.rwsServerURL);
  }

  setVideoStream() {
    this.video.src = URL.createObjectURL(this.wsWebRTCService.stream);
    console.log('IN VIDEO STREAM', this.wsWebRTCService.stream);
    this.video.play();
  }
}
