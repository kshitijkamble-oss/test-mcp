import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard')({
  component: Dashboard,
});

function Dashboard() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100svh',
      background: '#000',
      color: '#fff',
      fontFamily: 'var(--font-ui, system-ui, sans-serif)',
      fontSize: '24px',
      fontWeight: 600,
      letterSpacing: '-0.01em',
    }}>
      Hello, Welcome to the Project for Adani
    </div>
  );
}
