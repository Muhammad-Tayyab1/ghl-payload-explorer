import { NextResponse } from 'next/server'
import { getPayload } from 'payload'

import config from '@payload-config'
import { listGhlContacts } from '@/lib/ghl'

export async function GET(request: Request) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: request.headers })

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const contacts = await listGhlContacts()
    return NextResponse.json(contacts)
  } catch (err) {
    payload.logger.error(`Failed to list GHL contacts: ${err}`)
    return NextResponse.json({ error: 'Failed to reach GHL' }, { status: 502 })
  }
}
