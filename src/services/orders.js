import { supabase } from '../lib/supabase'

export const ORDER_BUCKET = 'order-files'

export async function createOrder({ clientId, serviceName, sourceLanguage, targetLanguage, deadline, comment, file }) {
  if (!supabase) throw new Error('Supabase не настроен. Заполните .env.local.')
  const { data: order, error: orderError } = await supabase.from('orders').insert({
    client_id: clientId,
    service_name: serviceName,
    source_language: sourceLanguage,
    target_language: targetLanguage,
    deadline: deadline || null,
    comment: comment || null,
    status: 'new',
  }).select().single()
  if (orderError) throw orderError
  if (!file || typeof file.size !== 'number' || file.size === 0) return order

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const path = `${clientId}/${order.id}/${crypto.randomUUID()}-${safeName}`
  const { error: uploadError } = await supabase.storage.from(ORDER_BUCKET).upload(path, file, { upsert: false })
  if (uploadError) throw uploadError
  const { error: fileError } = await supabase.from('order_files').insert({ order_id: order.id, path, filename: file.name })
  if (fileError) throw fileError
  return order
}

export async function fetchOrders({ role, userId }) {
  if (!supabase) throw new Error('Supabase не настроен. Заполните .env.local.')
  let query = supabase.from('orders').select('*, order_files(*)').order('created_at', { ascending: false })
  if (role === 'client') query = query.eq('client_id', userId)
  if (role === 'translator') query = query.eq('translator_id', userId)
  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function updateOrder(orderId, changes) {
  if (!supabase) throw new Error('Supabase не настроен. Заполните .env.local.')
  const { data, error } = await supabase.from('orders').update({
    service_name: changes.serviceName,
    source_language: changes.sourceLanguage,
    target_language: changes.targetLanguage,
    deadline: changes.deadline || null,
    status: changes.status,
    price: changes.price === '' ? null : Number(changes.price),
    comment: changes.comment || null,
    updated_at: new Date().toISOString(),
  }).eq('id', orderId).select().single()
  if (error) throw error
  return data
}

export async function downloadOrderFile(path) {
  if (!supabase) throw new Error('Supabase не настроен. Заполните .env.local.')
  const { data, error } = await supabase.storage.from(ORDER_BUCKET).download(path)
  if (error) throw error
  return data
}
