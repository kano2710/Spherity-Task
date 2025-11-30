import { Body, Controller, Delete, Get, HttpCode, HttpStatus, NotFoundException, Param, Post } from '@nestjs/common';
import { CredentialsService } from './credentials.service';
import { CreateCredentialDto } from './dto/create-credential.dto';
import { VerifyCredentialDto } from './dto/verify-credential.dto';

@Controller('credentials')
export class CredentialsController {
    constructor(private readonly credentialsService: CredentialsService) { }

    @Post('issue')
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createCredentialDto: CreateCredentialDto) {
        return this.credentialsService.issueCredential(createCredentialDto);
    }

    @Get()
    findAll() {
        return this.credentialsService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        const credential = await this.credentialsService.findOne(id);
        if (!credential) {
            throw new NotFoundException(`Credential with ID ${id} not found`);
        }
        return credential;
    }

    @Post('verify')
    @HttpCode(HttpStatus.OK)
    async verify(@Body() verifyDto: VerifyCredentialDto) {
        return this.credentialsService.verify(verifyDto.token);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id') id: string) {
        const deleted = await this.credentialsService.remove(id);
        if (!deleted) {
            throw new NotFoundException(`Credential with ID ${id} not found`);
        }
    }
}
