import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import CredentialsList from './components/CredentialsList'
import CredentialDetail from './components/CredentialDetail'
import VerifyCredential from './components/VerifyCredential'

function App() {
    return (
        <BrowserRouter>
            <div className="min-h-screen bg-gray-50">
                <nav className="bg-white border-b border-gray-200 mb-8">
                    <div className="container mx-auto px-6 py-4">
                        <div className="flex justify-between items-center">
                            <Link to="/" className="text-2xl font-bold text-gray-800">
                                Verifiable Credential Wallet
                            </Link>
                            <div className="flex gap-6 items-center">
                                <div className="flex gap-4">
                                    <Link to="/" className="text-gray-600 hover:text-gray-900">
                                        Credentials
                                    </Link>
                                    <Link to="/verify" className="text-gray-600 hover:text-gray-900">
                                        Verify
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </nav>

                <Routes>
                    <Route path="/" element={<CredentialsList />} />
                    <Route path="/credentials/:id" element={<CredentialDetail />} />
                    <Route path="/verify" element={<VerifyCredential />} />
                </Routes>
            </div>
        </BrowserRouter>
    )
}

export default App