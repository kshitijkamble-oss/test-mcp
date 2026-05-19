import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    // Redirect to login for now; replace with auth guard later
    throw redirect({ to: '/login' });
  },
  component: () => null,
});
