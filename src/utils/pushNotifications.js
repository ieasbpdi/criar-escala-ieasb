import { supabase } from './supabase';

export async function checkBirthdayNotifications() {
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  try {
    const { data, error } = await supabase.from('aniversarios').select('membro_nome, dia, mes');
    if (error || !data) return;

    const today = new Date();
    const targetDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3);

    const upcoming = data.filter(b => {
      const bDate = new Date(today.getFullYear(), b.mes - 1, b.dia);
      return bDate.getDate() === targetDate.getDate() && bDate.getMonth() === targetDate.getMonth();
    });

    upcoming.forEach(b => {
      const label = `${String(b.dia).padStart(2, '0')}/${String(b.mes).padStart(2, '0')}`;
      new Notification('🎂 Aniversário em 3 dias!', {
        body: `${b.membro_nome} faz aniversário dia ${label}.`,
        icon: '/logos-igreja/SÍMBOLO - ASB - TEXTO2.svg'
      });
    });
  } catch (err) {
    console.log('Erro ao verificar aniversários:', err);
  }
}

// Chave pública VAPID (Você deve gerar um par de chaves usando a biblioteca web-push e colocar a pública aqui)
// Exemplo genérico abaixo (substitua pela sua chave pública real gerada pelo web-push)
const PUBLIC_VAPID_KEY = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDyehpRXq_XU2p0Y846bJ4y2iF9JIDb4D8YpM_v1g2yQ'; 

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function initPushNotifications() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.log('Push notifications não são suportadas neste navegador.');
    return;
  }

  try {
    // Usar a base URL correta para o GitHub Pages
    const swUrl = import.meta.env.BASE_URL + 'sw.js';
    const registration = await navigator.serviceWorker.register(swUrl);
    console.log('Service Worker registrado:', registration);

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('Permissão para notificações negada.');
      return;
    }

    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      const convertedVapidKey = urlBase64ToUint8Array(PUBLIC_VAPID_KEY);
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
      });
    }

    // Extrair endpoint e chaves
    const subJSON = subscription.toJSON();
    const endpoint = subJSON.endpoint;
    const p256dh = subJSON.keys.p256dh;
    const auth = subJSON.keys.auth;

    // Salvar no Supabase
    const { error } = await supabase.from('push_subscriptions').upsert({
      endpoint,
      p256dh,
      auth
    }, { onConflict: 'endpoint' });

    if (error) {
      console.error('Erro ao salvar subscription no Supabase:', error);
    } else {
      console.log('Push Subscription salvo com sucesso no banco!');
    }

  } catch (err) {
    console.error('Erro ao inicializar push notifications:', err);
  }
}
