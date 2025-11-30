import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { credentialsApi } from '../api/credentials';
import IssueCredential from './IssueCredential';

export default function CredentialsList() {
    const [credentials, setCredentials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        loadCredentials();
    }, []);

    const loadCredentials = async () => {
        try {
            setLoading(true);
            const data = await credentialsApi.getAllCredentials();
            setCredentials(data);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this credential?')) {
            return;
        }

        try {
            await credentialsApi.deleteCredential(id);
            setCredentials(credentials.filter(c => c.id !== id));
        } catch (err) {
            alert('Failed to delete credential: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleShare = (token) => {
        const verifyUrl = `${window.location.origin}/verify?token=${encodeURIComponent(token)}`;
        navigator.clipboard.writeText(verifyUrl);
        alert('Verify link copied to clipboard!');
    };

    const handleCredentialCreated = (newCredential) => {
        setCredentials([...credentials, newCredential]);
    };

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto p-6">
                <p className="text-center text-gray-600">Loading credentials...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-6xl mx-auto p-6">
                <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-800">Error loading credentials: {error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">My Credentials</h2>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                    Issue New Credential
                </button>
            </div>

            {credentials.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-600 mb-4">No credentials found</p>
                    <button onClick={() => setShowModal(true)} className="text-blue-600 hover:underline">
                        Issue your first credential
                    </button>
                </div>
            ) : (
                <div className="grid gap-4">
                    {credentials.map((credential) => {
                        if (!credential) {
                            return null;
                        }

                        return (
                            <div key={credential.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="font-semibold text-lg">
                                                {credential.type?.filter(t => t !== 'VerifiableCredential').join(', ') || 'Unknown Type'}
                                            </h3>
                                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                                Issued
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-1">
                                            Subject: {credential.credentialSubject?.id || 'Unknown'}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Issued: {new Date(credential.issuanceDate).toLocaleString()}
                                        </p>
                                    </div>

                                    <div className="flex gap-2">
                                        <Link
                                            to={`/credentials/${encodeURIComponent(credential.id)}`}
                                            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                                        >
                                            View
                                        </Link>
                                        <button
                                            onClick={() => handleShare(credential.proof)}
                                            className="px-3 py-1 text-sm border border-blue-300 text-blue-600 rounded hover:bg-blue-50"
                                        >
                                            Share
                                        </button>
                                        <button
                                            onClick={() => handleDelete(credential.id)}
                                            className="px-3 py-1 text-sm border border-red-300 text-red-600 rounded hover:bg-red-50"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50 p-4"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }} onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center p-6 border-b">
                            <h2 className="text-2xl font-bold">Issue New Credential</h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
                            >
                                &times;
                            </button>
                        </div>
                        <div className="p-6">
                            <IssueCredential
                                key="issue-credential-modal"
                                onCredentialCreated={handleCredentialCreated}
                                onClose={() => setShowModal(false)}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
