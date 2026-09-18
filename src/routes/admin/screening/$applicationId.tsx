import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/screening/$applicationId')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admin/screening/$applicationId"!</div>
}
