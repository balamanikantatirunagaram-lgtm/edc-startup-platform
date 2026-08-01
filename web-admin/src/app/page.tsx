import { redirect } from 'next/navigation'

/**
 * Web-admin root page.
 * Redirects directly to the admin overview.
 * The (admin) layout handles auth protection via middleware.
 */
export default function AdminRootPage() {
  redirect('/admin')
}
