import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter, Route, Routes } from 'react-router'
import MessagingLayout from './layouts/MessagingLayout.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path='t' element={<MessagingLayout />}>
          <Route index element={<App />} />
          <Route path=':id' element={<App />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
