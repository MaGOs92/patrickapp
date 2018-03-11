import { WebsocketService } from "./index";
import { Injectable } from "@angular/core";
import { EventEmitter } from "@angular/core/src/facade/async";


@Injectable()
export class WsWebRTCService extends WebsocketService {

  isStreaming: EventEmitter<boolean>;
  peerConnection: RTCPeerConnection;
  config = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] }
  stream: MediaStream;

  constructor() {
    super();
    this.isStreaming = new EventEmitter<boolean>();
  }

  onMessage(event) {
    console.log("WSS -> C: " + event.data);
    var dataJson = JSON.parse(event.data);
    if (dataJson["cmd"] == "send") {
      this.doHandlePeerMessage(dataJson["msg"]);
    }
  }

  createPeerConnection() {
    try {
      const peerConnection = new RTCPeerConnection(this.config);
      peerConnection.onicecandidate = event => {
        if (event.candidate) {
          var candidate = {
            type: 'candidate',
            label: event.candidate.sdpMLineIndex,
            id: event.candidate.sdpMid,
            candidate: event.candidate.candidate
          };
          this.doSend(JSON.stringify(candidate));
        } else {
          console.log("End of candidates.");
        }
      };
      // Handle event onaddstream in component
      peerConnection.onaddstream = this.onRemoteStreamAdded.bind(this);
      peerConnection.onremovestream = this.onRemoteStreamRemoved.bind(this);
      console.log("Created RTCPeerConnnection with config: " + JSON.stringify(this.config));
      this.peerConnection = peerConnection;
    }
    catch (e) {
      console.log("Failed to create PeerConnection exception: " + e.message);
    }
  }

  sld_success_cb() {
    console.log("setLocalDescription success");
  }

  sld_failure_cb() {
    console.log("setLocalDescription failed");
  }

  aic_success_cb() {
    console.log("addIceCandidate success");
  }

  aic_failure_cb() {
    console.log("addIceCandidate failed");
  }


  doHandlePeerMessage(data) {
    var dataJson = JSON.parse(data);
    console.log("Handle Message :", JSON.stringify(dataJson));

    if (dataJson["type"] == "offer") {        // Processing offer
      console.log("Offer from PeerConnection");
      var sdp_returned = this.forceChosenVideoCodec(dataJson.sdp, 'H264/90000');
      dataJson.sdp = sdp_returned;
      // Creating PeerConnection
      this.createPeerConnection();
      this.peerConnection.setRemoteDescription(new RTCSessionDescription(dataJson),
        this.onRemoteSdpSucces, this.onRemoteSdpError);
      this.peerConnection.createAnswer(sessionDescription => {
        console.log("Create answer:", sessionDescription);
        this.peerConnection.setLocalDescription(sessionDescription, this.sld_success_cb, this.sld_failure_cb);
        var data = JSON.stringify(sessionDescription);
        console.log("Sending Answer: " + data);
        this.doSend(data);
      }, error => { // error
        console.log("Create answer error:", error);
      }); // type error           
    }
    else if (dataJson["type"] == "candidate") {    // Processing candidate
      console.log("Adding ICE candiate " + dataJson.candidate);
      console.log("Adding mLineIndex " + dataJson.label);
      var ice_candidate = new RTCIceCandidate({
        sdpMLineIndex: dataJson.label,
        sdpMid: dataJson.id,
        candidate: dataJson.candidate
      });
      this.peerConnection.addIceCandidate(ice_candidate, this.aic_success_cb, this.aic_failure_cb);
    }
  }

  onRemoteStreamAdded(event) {
    console.log('Stream received');
    this.stream = event.stream;
    this.isStreaming.emit(true);
  }

  onRemoteStreamRemoved(event) {
    console.log("Remote stream removed.");
    this.isStreaming.emit(false);
  }

  onRemoteSdpError(event) {
    console.error('onRemoteSdpError', event.name, event.message);
  }

  onRemoteSdpSucces() {
    console.log('onRemoteSdpSucces');
  }

  forceChosenVideoCodec(sdp, codec) {
    return this.maybePreferCodec(sdp, 'video', 'send', codec);
  }

  forceChosenAudioCodec(sdp, codec) {
    return this.maybePreferCodec(sdp, 'audio', 'send', codec);
  }

  // Copied from AppRTC's sdputils.js:

  // Sets |codec| as the default |type| codec if it's present.
  // The format of |codec| is 'NAME/RATE', e.g. 'opus/48000'.
  maybePreferCodec(sdp, type, dir, codec) {
    var str = type + ' ' + dir + ' codec';
    if (codec === '') {
      console.log('No preference on ' + str + '.');
      return sdp;
    }

    console.log('Prefer ' + str + ': ' + codec);	// kclyu

    var sdpLines = sdp.split('\r\n');

    // Search for m line.
    var mLineIndex = this.findLine(sdpLines, 'm=', type);
    if (mLineIndex === null) {
      console.log('* not found error: ' + str + ': ' + codec);	// kclyu
      return sdp;
    }

    // If the codec is available, set it as the default in m line.
    var codecIndex = this.findLine(sdpLines, 'a=rtpmap', codec);
    console.log('mLineIndex Line: ' + sdpLines[mLineIndex]);
    console.log('found Prefered Codec in : ' + codecIndex + ': ' + sdpLines[codecIndex]);
    console.log('codecIndex', codecIndex);
    if (codecIndex) {
      var payload = this.getCodecPayloadType(sdpLines[codecIndex]);
      if (payload) {
        sdpLines[mLineIndex] = this.setDefaultCodec(sdpLines[mLineIndex], payload);
        //sdpLines[mLineIndex] = setDefaultCodecAndRemoveOthers(sdpLines, sdpLines[mLineIndex], payload);
      }
    }

    // delete id 100(VP8) and 101(VP8)

    console.log('** Modified LineIndex Line: ' + sdpLines[mLineIndex]);
    sdp = sdpLines.join('\r\n');
    return sdp;
  }

  // Find the line in sdpLines that starts with |prefix|, and, if specified,
  // contains |substr| (case-insensitive search).
  findLine(sdpLines, prefix, substr) {
    return this.findLineInRange(sdpLines, 0, -1, prefix, substr);
  }

  // Find the line in sdpLines[startLine...endLine - 1] that starts with |prefix|
  // and, if specified, contains |substr| (case-insensitive search).
  findLineInRange(sdpLines, startLine, endLine, prefix, substr) {
    var realEndLine = endLine !== -1 ? endLine : sdpLines.length;
    for (var i = startLine; i < realEndLine; ++i) {
      if (sdpLines[i].indexOf(prefix) === 0) {
        if (!substr ||
          sdpLines[i].toLowerCase().indexOf(substr.toLowerCase()) !== -1) {
          return i;
        }
      }
    }
    return null;
  }

  // Gets the codec payload type from an a=rtpmap:X line.
  getCodecPayloadType(sdpLine) {
    var pattern = new RegExp('a=rtpmap:(\\d+) \\w+\\/\\d+');
    var result = sdpLine.match(pattern);
    return (result && result.length === 2) ? result[1] : null;
  }

  // Returns a new m= line with the specified codec as the first one.
  setDefaultCodec(mLine, payload) {
    var elements = mLine.split(' ');

    // Just copy the first three parameters; codec order starts on fourth.
    var newLine = elements.slice(0, 3);

    // Put target payload first and copy in the rest.
    newLine.push(payload);
    for (var i = 3; i < elements.length; i++) {
      if (elements[i] !== payload) {
        newLine.push(elements[i]);
      }
    }
    return newLine.join(' ');
  }


  setDefaultCodecAndRemoveOthers(sdpLines, mLine, payload) {
    var elements = mLine.split(' ');

    // Just copy the first three parameters; codec order starts on fourth.
    var newLine = elements.slice(0, 3);


    // Put target payload first and copy in the rest.
    newLine.push(payload);
    for (var i = 3; i < elements.length; i++) {
      if (elements[i] !== payload) {

        //  continue to remove all matching lines
        for (var line_removed = true; line_removed;) {
          line_removed = this.RemoveLineInRange(sdpLines, 0, -1, "a=rtpmap", elements[i]);
        }
        //  continue to remove all matching lines
        for (var line_removed = true; line_removed;) {
          line_removed = this.RemoveLineInRange(sdpLines, 0, -1, "a=rtcp-fb", elements[i]);
        }
      }
    }
    return newLine.join(' ');
  }

  RemoveLineInRange(sdpLines, startLine, endLine, prefix, substr) {
    var realEndLine = endLine !== -1 ? endLine : sdpLines.length;
    for (var i = startLine; i < realEndLine; ++i) {
      if (sdpLines[i].indexOf(prefix) === 0) {
        if (!substr ||
          sdpLines[i].toLowerCase().indexOf(substr.toLowerCase()) !== -1) {
          var str = "Deleting(index: " + i + ") : " + sdpLines[i];
          console.log(str);
          sdpLines.splice(i, 1);
          return true;
        }
      }
    }
    return false;
  }
}