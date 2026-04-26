import AppRouter from './routes/AppRouter'
import { Toaster } from 'sonner'

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        richColors
        toastOptions={{
          duration: 3000,
          style: {
            zIndex: 9999,
            fontFamily: 'Roboto, sans-serif',
            fontSize: '13px',
            borderRadius: '10px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            border: '1px solid rgba(0,0,0,0.06)',
          },
        }}
      />
      <AppRouter />
    </>
  )
}

export default App