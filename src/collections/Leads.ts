import type { CollectionAfterChangeHook, CollectionConfig } from 'payload'

import { upsertGhlContact } from '../lib/ghl'

const syncToGhl: CollectionAfterChangeHook = async ({
  doc,
  req,
  operation,
}) => {
  if (operation !== 'create') return doc

  try {
    await upsertGhlContact({
      name: doc.name,
      email: doc.email,
      phone: doc.phone,
    })

    await req.payload.update({
      collection: 'leads',
      id: doc.id,
      data: { ghlSyncStatus: 'synced' },
      overrideAccess: true,
      req,
    })
  } catch (err) {
    req.payload.logger.error(`Failed to sync lead ${doc.id} to GHL: ${err}`)

    await req.payload.update({
      collection: 'leads',
      id: doc.id,
      data: { ghlSyncStatus: 'failed' },
      overrideAccess: true,
      req,
    })
  }

  return doc
}

export const Leads: CollectionConfig = {
  slug: 'leads',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['name', 'email', 'phone', 'ghlSyncStatus', 'createdAt'],
  },
  access: {
    read: () => true,
    create: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'email',
      type: 'email',
      required: true,
    },
    {
      name: 'phone',
      type: 'text',
    },
    {
      name: 'ghlSyncStatus',
      type: 'select',
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Synced', value: 'synced' },
        { label: 'Failed', value: 'failed' },
      ],
      admin: {
        readOnly: true,
      },
    },
  ],
  hooks: {
    afterChange: [syncToGhl],
  },
}
