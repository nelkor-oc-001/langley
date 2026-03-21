import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './ui/Layout'
import { SetupScreen } from './setup'
import { TrainingScreen } from './training/TrainingScreen'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/setup" replace />} />
          <Route path="/setup" element={<SetupScreen />} />
          <Route path="/training" element={<TrainingScreen />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
