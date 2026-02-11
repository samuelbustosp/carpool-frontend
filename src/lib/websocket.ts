import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

let stompClient: Stomp.Client | null = null;

export const connectWebSocket = (
  token: string,
   onMessage: (payload: unknown) => void
) => {  
  const socket = new SockJS('/api/ws');

  stompClient = Stomp.over(socket);
  stompClient.debug = () => {};

  stompClient.connect(
    { Authorization: `Bearer ${token}` },
    () => {
      stompClient?.subscribe('/user/queue/notification', (message) => {
        const payload = JSON.parse(message.body);
        onMessage(payload);
      });
    }
  );
};

// AGREGAR ESTA FUNCIÓN
export const disconnectWebSocket = () => {
  if (stompClient && stompClient.connected) {
    stompClient.disconnect(() => {
    });
    stompClient = null;
  }
};