export interface VerifiableCredential {
    '@context': string[];
    id: string;
    type: string[];
    credentialSubject: Record<string, any>;
    issuer: string;
    issuanceDate: string;
    proof: string;
    userId: string;
}
