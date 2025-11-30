export function CredentialDetailsView({ payload, borderColor = 'gray-200' }) {
    return (
        <div className={`bg-white border border-${borderColor} rounded p-4 space-y-3`}>
            <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">Type</h3>
                <p className="text-sm">
                    {payload.type?.filter(t => t !== 'VerifiableCredential').join(', ') || 'Unknown'}
                </p>
            </div>

            <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">Issuer</h3>
                <p className="text-sm">{payload.issuer}</p>
            </div>

            <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">Issued</h3>
                <p className="text-sm">
                    {new Date(payload.issuanceDate).toLocaleString()}
                </p>
            </div>

            <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">Subject</h3>
                <div className="bg-gray-50 p-2 rounded border border-gray-200">
                    <pre className="text-xs font-mono overflow-auto">
                        {JSON.stringify(payload.credentialSubject, null, 2)}
                    </pre>
                </div>
            </div>

            <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">Full Credential</h3>
                <div className="bg-gray-50 p-2 rounded border border-gray-200 max-h-96 overflow-auto">
                    <pre className="text-xs font-mono">
                        {JSON.stringify(payload, null, 2)}
                    </pre>
                </div>
            </div>
        </div>
    );
}
