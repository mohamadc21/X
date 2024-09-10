import Pusher from "pusher-js";
import PusherServer from "pusher";

export const pusherServer = new PusherServer({
  appId: '1861383',
  key: '3d936b170fa2a02eb890',
  secret: 'c0a5d1644c9ef65058d1',
  cluster: 'eu',
  useTLS: true,
});


export const pusherClient = new Pusher('3d936b170fa2a02eb890', {
  cluster: 'eu',
});