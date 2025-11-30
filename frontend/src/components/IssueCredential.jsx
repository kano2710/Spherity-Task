import { useState } from 'react';
import { credentialsApi } from '../api/credentials';
import { XCircleIcon, CheckCircleIcon } from '@heroicons/react/24/solid';
import { AlertBox } from './AlertBox';

export default function IssueCredential({ onCredentialCreated, onClose }) {
    const [formData, setFormData] = useState({
        type: '',
        subject: '',
        claims: '',
    });
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            let claims = {};
            if (formData.claims) {
                try {
                    claims = JSON.parse(formData.claims);
                } catch {
                    setError('Invalid JSON format in claims field');
                    setLoading(false);
                    return;
                }
            }

            const credentialData = {
                type: [formData.type],
                credentialSubject: {
                    id: formData.subject,
                    ...claims,
                },
            };

            const credential = await credentialsApi.issueCredential(credentialData);
            setResult(credential);
            setFormData({ type: '', subject: '', claims: '' });

            if (onCredentialCreated) {
                onCredentialCreated(credential);
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Credential Type
                    </label>
                    <input
                        type="text"
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        placeholder="e.g., Gym Membership Card"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">
                        Subject ID
                    </label>
                    <input
                        type="text"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        placeholder="e.g., did:example:user"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">
                        Claims (JSON)
                    </label>
                    <textarea
                        value={formData.claims}
                        onChange={(e) => setFormData({ ...formData, claims: e.target.value })}
                        placeholder='{"name": "Kano", "membership": "Gold", "expiryDate": "31.12.2025"}'
                        className="w-full px-3 py-2 border border-gray-300 rounded-md h-32 font-mono text-sm"
                        required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Enter valid JSON object with credential claims
                    </p>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                >
                    {loading ? 'Issuing...' : 'Issue Credential'}
                </button>
            </form>

            {error && (
                <div className="mt-4">
                    <AlertBox
                        type="error"
                        icon={XCircleIcon}
                        title="Error"
                        message={error}
                    />
                </div>
            )}

            {result && (
                <div className="mt-4">
                    <AlertBox
                        type="success"
                        icon={CheckCircleIcon}
                        title="Credential Issued Successfully!"
                        message="Your verifiable credential has been created and saved."
                    >
                        <div className="bg-white p-3 rounded border border-gray-200 overflow-auto max-h-96 mb-3">
                            <pre className="text-xs font-mono">{JSON.stringify(result, null, 2)}</pre>
                        </div>
                        {onClose && (
                            <button
                                onClick={() => onClose()}
                                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                            >
                                Back to Credentials List
                            </button>
                        )}
                    </AlertBox>
                </div>
            )}
        </div>
    );
}
