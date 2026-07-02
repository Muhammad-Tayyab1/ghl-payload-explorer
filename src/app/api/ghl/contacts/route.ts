import { NextResponse } from 'next/server'

import { listGhlContacts } from '@/lib/ghl'

export async function GET() {
  try {
    const contacts = await listGhlContacts()
    return NextResponse.json(contacts)
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 502 },
    )
  }
}
