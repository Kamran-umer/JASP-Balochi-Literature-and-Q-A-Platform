'use client'

import { useFormStatus } from 'react-dom'
import Button from './Button' // We re-use your existing Button

export default function SubmitButton({
  children,
}: {
  children: React.ReactNode
}) {
  // This hook gets the "pending" state of the form
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Loading...' : children}
    </Button>
  )
}