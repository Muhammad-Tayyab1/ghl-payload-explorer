import { NextResponse } from 'next/server'
import { getPayload } from 'payload'

import config from '@payload-config'

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)

  if (!body?.name || !body?.email) {
    return NextResponse.json({ error: 'name and email are required' }, { status: 400 })
  }

  const payload = await getPayload({ config })

  const lead = await payload.create({
    collection: 'leads',
    data: {
      name: body.name,
      email: body.email,
      phone: body.phone,
    },
  })

  return NextResponse.json({ lead }, { status: 201 })
}
