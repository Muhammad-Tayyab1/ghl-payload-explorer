const GHL_API_BASE = 'https://services.leadconnectorhq.com'
const GHL_API_VERSION = '2021-07-28'

function getGhlConfig() {
  const token = process.env.GHL_PRIVATE_TOKEN
  const locationId = process.env.GHL_LOCATION_ID

  if (!token || !locationId) {
    throw new Error(
      'Missing GHL_PRIVATE_TOKEN or GHL_LOCATION_ID environment variables',
    )
  }

  return { token, locationId }
}

async function ghlFetch(path: string, init: RequestInit = {}) {
  const { token } = getGhlConfig()

  const res = await fetch(`${GHL_API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Version: GHL_API_VERSION,
      'Content-Type': 'application/json',
      ...init.headers,
    },
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`GHL API error ${res.status}: ${body}`)
  }

  return res.json()
}

export type GhlContactInput = {
  firstName?: string
  lastName?: string
  name?: string
  email?: string
  phone?: string
}

export async function upsertGhlContact(contact: GhlContactInput) {
  const { locationId } = getGhlConfig()

  return ghlFetch('/contacts/upsert', {
    method: 'POST',
    body: JSON.stringify({
      locationId,
      ...contact,
    }),
  })
}

export async function listGhlContacts(params: { limit?: number } = {}) {
  const { locationId } = getGhlConfig()
  const limit = params.limit ?? 20

  const query = new URLSearchParams({
    locationId,
    limit: String(limit),
  })

  return ghlFetch(`/contacts/?${query.toString()}`)
}

export async function getGhlContact(contactId: string) {
  return ghlFetch(`/contacts/${contactId}`)
}
