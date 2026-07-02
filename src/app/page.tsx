'use client'

import { useState } from 'react'

type Status = 'idle' | 'submitting' | 'success' | 'error'

export default function HomePage() {
  const [status, setStatus] = useState<Status>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('submitting')
    setErrorMessage('')

    const form = e.currentTarget
    const data = {
      name: (form.elements.namedItem('name') as HTMLInputElement).value,
      email: (form.elements.namedItem('email') as HTMLInputElement).value,
      phone: (form.elements.namedItem('phone') as HTMLInputElement).value,
    }

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `Request failed with status ${res.status}`)
      }

      setStatus('success')
      form.reset()
    } catch (err) {
      setStatus('error')
      setErrorMessage(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  return (
    <main style={{ maxWidth: 420 }}>
      <h1>Get in touch</h1>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.75rem' }}>
        <label>
          Name
          <input name="name" type="text" required style={{ display: 'block', width: '100%' }} />
        </label>
        <label>
          Email
          <input name="email" type="email" required style={{ display: 'block', width: '100%' }} />
        </label>
        <label>
          Phone
          <input name="phone" type="tel" style={{ display: 'block', width: '100%' }} />
        </label>
        <button type="submit" disabled={status === 'submitting'}>
          {status === 'submitting' ? 'Submitting...' : 'Submit'}
        </button>
      </form>
      {status === 'success' && <p>Thanks! Your info was submitted.</p>}
      {status === 'error' && <p style={{ color: 'red' }}>Error: {errorMessage}</p>}
    </main>
  )
}
