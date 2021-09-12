import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import MediaHandler from '../MediaHandler';
import Pusher from 'pusher-js';
import Peer from 'simple-peer';
const APP_KEY = "a30ba9a7ad2211ddd18d";

export default class App extends Component{
  constructor(){
    super();

    this.state = {
      hasMedia: false,
      otherUserId:null
    };

    this.user = window.user; // current user from app.blade.php
    this.user.stream = null;
    this.peers = {}; // pears object
    this.mediaHandler = new MediaHandler(); // media handler to hande the setup
    this.setUpPusher();
    this.callTo = this.callTo.bind(this);
    this.setUpPusher = this.setUpPusher.bind(this);
    this.startPeer = this.startPeer.bind(this);
  }

  componentDidMount(){
    //console.log('component did mout is all good');
    this.mediaHandler.getPermissions() // setup the permission request permision from user to use video
      .then((stream) => {
        this.setState({hasMedia: true});
        this.user.stream = stream;
        //console.log('permission was got and set!!!');
        try{
          //console.log('using srcObject for my video');
          this.myVideo.srcObject = stream;
          //this.userVideo.srcObject = stream;
        }catch(e){
          //console.log('using create object for my video');
          this.myVideo.src = URL.createObjectURL(stream);
        }
        //this.userVideo.play();
        this.myVideo.play();
      })
  }

  setUpPusher(){
    Pusher.logToConsole = true;
    this.pusher = new Pusher(APP_KEY, {
      authEndPoint:'/pusher/auth',
      cluster:'us2',
      auth: {
        params: this.user.id,
        headers:{
          'X-CSRF-Token': window.csrfToken
        }
      }
    });
    //console.log('set up pusher was called');
    //console.log(this.pusher);
    this.channel = this.pusher.subscribe('presence-video-channel');
    //console.log(this.channel);
    this.channel.bind(`client-signal-${this.user.id}`, (signal)=>{
      // check if we currently have a peer open ///
      //console.log('binding clinet signal');
      //console.log(signal);
      let peer = this.peers[signal.userId];
      //console.log(peer);
      // if peer not already exist we have an incoming call
      if(peer === undefined){
        this.setState({otherUserId: signal.userId});
        peer = this.startPeer(signal.userId,false);
        //console.log('peer not found starting new signal with pear with '+signal.userId);
      }
      //console.log('sent data to peer with user id '+signal.userId);
      peer.signal(signal.data);
    });
  }

  startPeer(userId, initiator=true){
    console.log('start Peer called with '+userId);
    const peer = new Peer({
      initiator,
      stream: this.user.stream,
      trickle: false
    });

    peer.on('signal', (data)=>{
      //console.log(`on signal for  user------->>>> ${userId}`);
      this.channel.trigger(`client-signal-${userId}`,{
        type:'signal',
        userId:this.user.id,
        data: data
      });
    });

    peer.on('stream', (stream)=>{
      console.log('attempting screeming !!');
      try{
        this.userVideo.srcObject = stream;
      }catch(e){
        this.userVideo.src = URL.createObjectURL(stream);
      }

      this.userVideo.play();
    });

    peer.on('close',()=>{
      let peer = this.peers[userId];
      if(peer !== undefined){
        peer.destroy();
      }
      this.peers[userId]= undefined;
    });
    return peer;
    //console.log(peer);
  }

  callTo(userId){
    this.peers[userId] = this.startPeer(userId);
  }
  render(){
    return (
      <div className="App">
          {[1,2].map((userId)=> {
            return this.user.id != userId ?
            <button onClick={()=>this.callTo(userId)} key={userId}> Call {userId}</button>:null
          })}
          <div className="container">
              <div className="video-container">
                  <video className="my-video" ref={(ref)=> {this.myVideo = ref}} > </video>
                  <video className="user-video" ref={(ref)=> {this.userVideo = ref}}> </video>
              </div>
          </div>
      </div>
    );
  }
}
// function App() {
//     return (
//         <div className="container">
//             <div className="video-container">
//                 <video className="my-video" ref={(ref)=> this.}> </video>
//             </div>
//         </div>
//     );
// }
//
// export default App;

if (document.getElementById('app')) {
    ReactDOM.render(<App />, document.getElementById('app'));
}
