import { createFileRoute } from '@tanstack/react-router';
import { DrawingsPage } from '../components/drawings';

export const Route = createFileRoute('/drawings')({
  component: DrawingsPage,
});
