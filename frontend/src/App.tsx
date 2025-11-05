import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Mises Wallet
        </h1>
        <p className="text-gray-600 text-lg mb-6">
          Bienvenido a Mises Wallet
        </p>
        <div className="flex gap-4 justify-center">
          <div className="bg-green-100 text-green-800 px-4 py-2 rounded">
            ✅ Backend: Node.js
          </div>
          <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded">
            ✅ Frontend: React + TypeScript
          </div>
          <div className="bg-purple-100 text-purple-800 px-4 py-2 rounded">
            ✅ Tailwind CSS
          </div>
        </div>
      </div>
    </div>
  )
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  )
}

export default App

