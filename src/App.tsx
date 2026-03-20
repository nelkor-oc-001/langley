import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './ui/Layout'

function Setup() {
  return <div className="page-setup">Setup</div>
}

function Training() {
  return <div className="page-training">Training</div>
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/setup" element={<Setup />} />
          <Route path="/training" element={<Training />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
