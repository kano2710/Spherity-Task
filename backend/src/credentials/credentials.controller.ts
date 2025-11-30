import { BadRequestException, Body, Controller, Delete, Get, HttpCode, HttpStatus, NotFoundException, Param, Post, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';
import { CredentialsService } from './credentials.service';
import { CreateCredentialDto } from './dto/create-credential.dto';
import { VerifyCredentialDto } from './dto/verify-credential.dto';

@ApiTags('credentials')
@Controller('credentials')
export class CredentialsController {
    constructor(private readonly credentialsService: CredentialsService) { }

    @Post('issue')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Issue a new verifiable credential',
        description: 'Creates and signs a W3C-compliant verifiable credential using EdDSA (Ed25519) algorithm'
    })
    @ApiBody({ type: CreateCredentialDto })
    @ApiResponse({
        status: 201,
        description: 'Credential successfully issued',
        schema: {
            example: {
                '@context': ['https://www.w3.org/ns/credentials/v2'],
                'id': 'urn:uuid:d4808116-9cdc-40a5-bee0-7f1f60a61b03',
                'type': ['VerifiableCredential', 'UniversityDegree'],
                'credentialSubject': {
                    'id': 'did:example:dharam',
                    'name': 'Dharam Dhameliya',
                    'degree': 'Master of Science'
                },
                'issuer': 'did:example:user-miji6ryl-m9oam8z697b',
                'issuanceDate': '2025-11-13T13:13:42.692Z',
                'userId': 'user-miji6ryl-m9oam8z697b',
                'proof': 'eyJhbGciOiJFZERTQSJ9...'
            }
        }
    })
    @ApiResponse({ status: 400, description: 'Invalid input data' })
    async create(@Body() createCredentialDto: CreateCredentialDto) {
        return this.credentialsService.issueCredential(createCredentialDto);
    }

    @Get()
    @ApiOperation({
        summary: 'Get all credentials for a user',
        description: 'Retrieves all credentials belonging to a specific user/wallet'
    })
    @ApiQuery({
        name: 'userId',
        required: true,
        description: 'User/wallet identifier',
        example: 'user-miji6ryl-m9oam8z697b'
    })
    @ApiResponse({
        status: 200,
        description: 'List of credentials',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                example: {
                    '@context': ['https://www.w3.org/ns/credentials/v2'],
                    'id': 'urn:uuid:d4808116-9cdc-40a5-bee0-7f1f60a61b03',
                    'type': ['VerifiableCredential', 'UniversityDegree'],
                    'credentialSubject': { 'id': 'did:example:dharam', 'name': 'Dharam Dhameliya', 'degree': 'Master of Science' },
                    'issuer': 'did:example:user-miji6ryl-m9oam8z697b',
                    'issuanceDate': '2025-11-13T13:13:42.692Z',
                    'userId': 'user-miji6ryl-m9oam8z697b',
                    'proof': 'eyJhbGciOiJFZERTQSJ9...'
                }
            }
        }
    })
    @ApiResponse({ status: 400, description: 'userId query parameter is required' })
    findAll(@Query('userId') userId: string) {
        if (!userId) {
            throw new BadRequestException('userId query parameter is required');
        }
        return this.credentialsService.findAll(userId);
    }

    @Get(':id')
    @ApiOperation({
        summary: 'Get a credential by ID',
        description: 'Retrieves a specific credential by its unique identifier'
    })
    @ApiParam({
        name: 'id',
        description: 'Credential ID (URN UUID format)',
        example: 'urn:uuid:d4808116-9cdc-40a5-bee0-7f1f60a61b03'
    })
    @ApiResponse({
        status: 200,
        description: 'Credential found',
        schema: {
            example: {
                '@context': ['https://www.w3.org/ns/credentials/v2'],
                'id': 'urn:uuid:d4808116-9cdc-40a5-bee0-7f1f60a61b03',
                'type': ['VerifiableCredential', 'UniversityDegree'],
                'credentialSubject': {
                    'id': 'did:example:dharam',
                    'name': 'Dharam Dhameliya',
                    'degree': 'Master of Science'
                },
                'issuer': 'did:example:user-miji6ryl-m9oam8z697b',
                'issuanceDate': '2025-11-13T13:13:42.692Z',
                'userId': 'user-miji6ryl-m9oam8z697b',
                'proof': 'eyJhbGciOiJFZERTQSJ9...'
            }
        }
    })
    @ApiResponse({ status: 404, description: 'Credential not found' })
    async findOne(@Param('id') id: string) {
        const credential = await this.credentialsService.findOne(id);
        if (!credential) {
            throw new NotFoundException(`Credential with ID ${id} not found`);
        }
        return credential;
    }

    @Post('verify')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Verify a credential',
        description: 'Verifies the EdDSA signature of a credential JWT and checks revocation status'
    })
    @ApiBody({ type: VerifyCredentialDto })
    @ApiResponse({
        status: 200,
        description: 'Verification result (valid/invalid and revocation status)',
        schema: {
            oneOf: [
                {
                    title: 'Valid & Not Revoked',
                    example: {
                        valid: true,
                        payload: {
                            '@context': ['https://www.w3.org/ns/credentials/v2'],
                            'id': 'urn:uuid:d4808116-9cdc-40a5-bee0-7f1f60a61b03',
                            'type': ['VerifiableCredential', 'UniversityDegree'],
                            'credentialSubject': { 'id': 'did:example:dharam', 'name': 'Dharam Dhameliya', 'degree': 'Master of Science' },
                            'issuer': 'did:example:user-miji6ryl-m9oam8z697b',
                            'issuanceDate': '2025-11-13T13:13:42.692Z',
                            'userId': 'user-miji6ryl-m9oam8z697b',
                            'iat': 1732975927
                        },
                        revoked: false,
                    }
                },
                {
                    title: 'Valid but Revoked',
                    example: {
                        valid: true,
                        error: 'Credential has been revoked',
                        payload: {},
                        revoked: true,
                    }
                },
                {
                    title: 'Invalid Signature',
                    example: {
                        valid: false,
                        error: 'Invalid or expired credential'
                    }
                }
            ]
        }
    })
    @ApiResponse({ status: 400, description: 'Invalid token format' })
    async verify(@Body() verifyDto: VerifyCredentialDto) {
        return this.credentialsService.verify(verifyDto.token);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({
        summary: 'Delete and revoke a credential',
        description: 'Permanently deletes a credential and adds it to the revocation list'
    })
    @ApiParam({
        name: 'id',
        description: 'Credential ID to delete',
        example: 'urn:uuid:d4808116-9cdc-40a5-bee0-7f1f60a61b03'
    })
    @ApiResponse({ status: 204, description: 'Credential successfully deleted and revoked' })
    @ApiResponse({ status: 404, description: 'Credential not found' })
    async remove(@Param('id') id: string) {
        const deleted = await this.credentialsService.remove(id);
        if (!deleted) {
            throw new NotFoundException(`Credential with ID ${id} not found`);
        }
    }
}
