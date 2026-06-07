import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LibraryPage from './pages/LibraryPage'
import ViewerPage from './pages/ViewerPage'
import './index.css'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/kutuphane" element={<LibraryPage />} />
        <Route path="/goruntule/:docId" element={<ViewerPage />} />
        <Route path="*" element={<Navigate to="/kutuphane" />} />
      </Routes>
    </BrowserRouter>
  )
}
