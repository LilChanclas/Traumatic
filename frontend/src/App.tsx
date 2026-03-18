import AppRouter from './routes/AppRouter'
import { Toaster } from 'react-hot-toast'

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            fontFamily: 'Roboto, sans-serif',
            fontSize: '13px',
            background: '#fff',
            color: '#1e293b',
            borderRadius: '10px',
            borderLeft: '3px solid #22c55e',
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          },
          success: {
            style: { borderLeft: '3px solid #22c55e' },
            iconTheme: { primary: '#16a34a', secondary: '#dcfce7' },
          },
          error: {
            style: { borderLeft: '3px solid #ef4444' },
            iconTheme: { primary: '#dc2626', secondary: '#fee2e2' },
          },
        }}
      />
      <AppRouter />
    </>
  )
}

export default App