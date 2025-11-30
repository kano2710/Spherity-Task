import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { credentialsApi } from '../api/credentials';
import { XCircleIcon } from '@heroicons/react/24/solid';
import { AlertBox } from './AlertBox';

export default function CredentialDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [credential, setCredential] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [copiedToken, setCopiedToken] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        loadCredential();
    }, [id]);

    const loadCredential = async () => {
        try {
            setLoading(true);
            const data = await credentialsApi.getCredentialById(id);
            setCredential(data);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this credential?')) {
            return;
        }

        try {
            await credentialsApi.deleteCredential(id);
            navigate('/');
        } catch (err) {
            alert('Failed to delete credential: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleCopyToken = () => {
        navigator.clipboard.writeText(credential.proof);
        setCopiedToken(true);
    };

    const handleShare = () => {
        const verifyUrl = `${window.location.origin}/verify?token=${encodeURIComponent(credential.proof)}`;
        navigator.clipboard.writeText(verifyUrl);
        setCopied(true);
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <p className="text-center text-gray-600">Loading credential...</p>
            </div>
        );
    }

    if (error || !credential) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <AlertBox
                    type="error"
                    icon={XCircleIcon}
                    title="Error"
                    message={error || 'Invalid credential data'}
                />
                <Link to="/" className="text-blue-600 hover:underline mt-4 inline-block">
                    Back to credentials list
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="mb-6">
                <Link to="/" className="text-blue-600 hover:underline text-sm">
                    &larr; Back to credentials list
                </Link>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-2xl font-bold mb-2">
                            {credential.type?.filter(t => t !== 'VerifiableCredential').join(', ') || 'Unknown Type'}
                        </h2>
                        <span className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded">
                            Verified Credential
                        </span>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleShare}
                            className="px-4 py-2 text-sm border border-blue-300 text-blue-600 rounded hover:bg-blue-50"
                        >
                            {copied ? '✓ Link copied!' : 'Share'}
                        </button>
                        <button
                            onClick={handleDelete}
                            className="px-4 py-2 text-sm border border-red-300 text-red-600 rounded hover:bg-red-50"
                        >
                            Delete
                        </button>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">Credential ID</h3>
                        <p className="text-sm font-mono bg-gray-50 p-2 rounded border border-gray-200">
                            {credential.id}
                        </p>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">Issuer</h3>
                        <p className="text-sm">{credential.issuer}</p>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">Issuance Date</h3>
                        <p className="text-sm">
                            {new Date(credential.issuanceDate).toLocaleString()}
                        </p>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">Credential Subject</h3>
                        <div className="bg-gray-50 p-3 rounded border border-gray-200">
                            <pre className="text-xs font-mono overflow-auto">
                                {JSON.stringify(credential.credentialSubject, null, 2)}
                            </pre>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-sm font-semibold text-gray-700">JWT Token (Proof)</h3>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleCopyToken}
                                    className="text-xs text-blue-600 hover:underline"
                                >
                                    {copiedToken ? '✓ Copied!' : 'Copy'}
                                </button>
                            </div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded border border-gray-200">
                            <p className="text-xs font-mono break-all">{credential.proof}</p>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">Full Credential</h3>
                        <div className="bg-gray-50 p-3 rounded border border-gray-200 max-h-96 overflow-auto">
                            <pre className="text-xs font-mono">
                                {JSON.stringify(credential, null, 2)}
                            </pre>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
