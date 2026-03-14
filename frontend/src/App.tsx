import AppRouter from './routes/AppRouter'
import { Toaster } from 'react-hot-toast'

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            fontFamily: 'Roboto, sans-serif',
            fontSize: '14px',
            borderRadius: '8px',
          },
          error: {
            style: {
              background: '#fff',
              color: '#8B1E3F',
              border: '1px solid #8B1E3F',
            },
          },
          success: {
            style: {
              background: '#fff',
              color: '#1E3A5F',
              border: '1px solid #1E3A5F',
            },
          },
        }}
      />
      <AppRouter />
    </>
  )
}

export default App