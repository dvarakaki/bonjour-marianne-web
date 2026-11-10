import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MotionConfig } from 'motion/react'
import { Toaster } from 'sonner'
import '@fontsource/great-vibes/400.css'
import '@fontsource/cormorant-garamond/400.css'
import '@fontsource/cormorant-garamond/500.css'
import '@fontsource/cormorant-garamond/600.css'
import '@fontsource/cormorant-garamond/400-italic.css'
import '@fontsource/cormorant-garamond/500-italic.css'
import '@fontsource-variable/jost'
import './index.css'
import App from './App'
import { RespostasProvider } from './hooks/use-respostas'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      <RespostasProvider>
        <App />
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              borderRadius: '18px',
              border: '1px solid var(--border)',
              background: 'var(--card)',
              color: 'var(--foreground)',
              fontFamily: 'inherit',
              fontSize: '15px',
            },
          }}
        />
      </RespostasProvider>
    </MotionConfig>
  </StrictMode>,
)
