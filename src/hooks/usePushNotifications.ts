import type { User } from '@supabase/supabase-js'
import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)))
}

export function usePushNotifications(user: User | null) {
  const [supported, setSupported] = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setSupported('serviceWorker' in navigator && 'PushManager' in window && Boolean(VAPID_PUBLIC_KEY))
  }, [])

  useEffect(() => {
    if (!supported || !user) return
    navigator.serviceWorker.ready.then(async (registration) => {
      const subscription = await registration.pushManager.getSubscription()
      setSubscribed(Boolean(subscription))
    })
  }, [supported, user])

  const subscribe = useCallback(async () => {
    if (!supported || !user || !supabase || !VAPID_PUBLIC_KEY) return
    setError(null)
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        setError('Tienes que permitir las notificaciones cuando el iPhone te lo pregunte.')
        return
      }

      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      })
      const json = subscription.toJSON()

      const { error: dbError } = await supabase.from('push_subscriptions').upsert(
        {
          user_id: user.id,
          endpoint: json.endpoint!,
          p256dh: json.keys!.p256dh,
          auth: json.keys!.auth,
        },
        { onConflict: 'endpoint' },
      )
      if (dbError) throw dbError
      setSubscribed(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudieron activar las notificaciones.')
    }
  }, [supported, user])

  return { supported, subscribed, error, subscribe }
}
