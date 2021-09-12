<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use \Pusher\Pusher;

use Log;

class HomeController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('auth');
        Log::debug('we are hitting home controller');
        Log::debug(config('chatapp.pusher.cluster'));
    }

    /**
     * Show the application dashboard.
     *
     * @return \Illuminate\Contracts\Support\Renderable
     */
    public function index()
    {
        return view('home');
    }

    /**
    * @param Request $request
    *
    */
    public function authenticate(Request $request)
    {
      /*
      app_id = "1265133"
      key = "a30ba9a7ad2211ddd18d"
      secret = "18ed0b2d2b10006214a7"
      cluster = "us2"
      */


      Log::info('authentication was hit');
      $socketId = $request->socket_id;
      $channelName = $request->channel_name;
      // $pusher = new Pusher('App key','App Secret','App id',[
      //   'cluster'=> 'ap2',
      //   'encrypted'=> true
      // ])
      $pusher = new Pusher(config('chatapp.pusher.key'),config('chatapp.pusher.secret'),config('chatapp.pusher.id'),[
        'cluster'=> config('chatapp.pusher.cluster'),
        'encrypted'=> true
      ]);

      $presence_data = ['name'=>auth()->user()->name??'unknown'];
      $key = $pusher->presence_auth($channelName,$socketId,auth()->id(),$presence_data);

      Log::debug($key);
      return response($key);
    }
}
