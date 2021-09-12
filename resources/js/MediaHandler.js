export default class MediaHandler{
  getPermissions(){
    if(navigator.mediaDevices === undefined){
      //console.log('need to call function due to undefined navigation media');
      return new Promise((res,rej) => {
        this.getUserMedia({video: true, audio: true})
            .then((stream)=>{
              res(stream)
            })
            .catch(err=>{
              throw new Error(`Unable to fetch stream ${err}`);
            })
      })
    }
    return new Promise((res,rej) => {
      //console.log('in the promise section settin stream')
      navigator.mediaDevices.getUserMedia({video: true, audio: true})
          .then((stream)=>{
            res(stream)
          })
          .catch(err=>{
            throw new Error(`Unable to fetch stream ${err}`);
          })
    });
  }

  async getUserMedia(constraints){
    console.log('this new vavigation function was called was called!!!');
    var getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

    // some browsers dont implement interval
    if(!getUserMedia){
      console.log('media still missing!!');
      return Promise.reject(new Error('getUserMedia is not implemented in this browser'))
    }

    // Other browsers wrap the call to the old navigator.getUserMedia with a Promise
    return new Promise(function(resolve, reject){
      getUserMedia.call(navigator, constraints, resolve, reject);
    })
  }
}
