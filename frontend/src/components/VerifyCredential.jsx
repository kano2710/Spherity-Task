import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { credentialsApi } from '../api/credentials';
import { XCircleIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/solid';
import { CredentialDetailsView } from './CredentialDetailsView';
import { AlertBox } from './AlertBox';

export default function VerifyCredential() {
    const [searchParams] = useSearchParams();
    const [token, setToken] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const tokenFromUrl = searchParams.get('token');
        if (tokenFromUrl) {
            setToken(tokenFromUrl);
            verifyToken(tokenFromUrl);
        }
    }, [searchParams]);

    const verifyToken = async (tokenToVerify) => {
        try {
            setLoading(true);
            setError(null);
            setResult(null);
            const data = await credentialsApi.verifyCredential(tokenToVerify || token);
            setResult(data);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        verifyToken(token);
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="mb-6">
                <Link to="/" className="text-blue-600 hover:underline text-sm">
                    &larr; Back to credentials list
                </Link>
            </div>

            <h2 className="text-2xl font-bold mb-6">Verify Credential</h2>

            <form onSubmit={handleSubmit} className="mb-6">
                <div>
                    <label className="block text-sm font-medium mb-2">
                        JWT Token
                    </label>
                    <textarea
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        placeholder="Paste the JWT token here..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md h-32 font-mono text-sm"
                        required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Paste the JWT token from a verifiable credential
                    </p>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                >
                    {loading ? 'Verifying...' : 'Verify Credential'}
                </button>
            </form>

            {error && (
                <AlertBox
                    type="error"
                    icon={XCircleIcon}
                    title="Verification Failed"
                    message={error}
                />
            )}

            {result && !result.valid && (
                <AlertBox
                    type="error"
                    icon={XCircleIcon}
                    title="Credential is INVALID"
                    message={result.error || 'The credential signature is invalid or the token has been tampered with.'}
                />
            )}

            {result && result.valid && result.revoked && result.payload && (
                <AlertBox
                    type="warning"
                    icon={ExclamationTriangleIcon}
                    title="Credential is REVOKED"
                    message="The signature is valid, but this credential has been revoked by the issuer."
                >
                    <CredentialDetailsView payload={result.payload} borderColor="yellow-200" />
                </AlertBox>
            )}

            {result && result.valid && !result.revoked && result.payload && (
                <AlertBox
                    type="success"
                    icon={CheckCircleIcon}
                    title="Credential is Valid!"
                    message="This credential has been verified and the signature is authentic."
                >
                    <CredentialDetailsView payload={result.payload} borderColor="green-200" />
                </AlertBox>
            )}
        </div>
    );
}