import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

@Injectable()
export class WebsocketService {

  websocket: WebSocket;
  websocketStatus$: Observable<number>

  constructor() {
    this.websocketStatus$ = Observable.create((observer: Observer<number>) => this.websocket && observer.next(this.websocket.readyState));
  }

  createWebSocket(url: string) {
    const websocket = new WebSocket(url);
    websocket.onopen = event => this.onOpen(event);
    websocket.onclose =  event => this.onClose(event);
    websocket.onmessage = event => this.onMessage(event);
    websocket.onerror = event => this.onError(event);
    this.websocket = websocket;
  }

  onOpen(event) {
    console.log("Websocket connnected: " + this.websocket.url);
    this.doRegister();
  }

  onClose(event) {
    console.log("Websocket Disconnected");
    this.doDisconnect();
  }

  onMessage(event) {
    console.log("WSS -> C: " + event.data);
  }

  onError(event) {
    console.log("An error occured while connecting : " + event.data);
  }

  webSocketSend(message: string) {
    if (this.websocket.readyState == WebSocket.OPEN ||
      this.websocket.readyState == WebSocket.CONNECTING) {
      console.log("C --> WSS: " + message);
      this.websocket.send(message);
      return true;
    }
    console.log("failed to send :" + message);
    return false;
  }

  randomString(strLength) {
    var result = [];
    strLength = strLength || 5;
    var charSet = '0123456789';
    while (strLength--) {
      result.push(charSet.charAt(Math.floor(Math.random() * charSet.length)));
    }
    return result.join('');
  }

  doRegister() {
    // No Room concept, random generate room and client id.
    var register = {
      cmd: 'register',
      roomid: this.randomString(9),
      clientid: this.randomString(8)
    };
    var register_message = JSON.stringify(register);
    this.webSocketSend(register_message);
  }

  doSend(data) {
    var message = {
      cmd: "send",
      msg: data,
      error: ""
    };
    var data_message = JSON.stringify(message);
    if (this.webSocketSend(data_message) == false) {
      console.log("Failed to send data: " + data_message);
      return false;
    };
    return true;
  }

  doDisconnect() {
    if (this.websocket.readyState == 1) {
      this.websocket.close();
    };
  }
}
