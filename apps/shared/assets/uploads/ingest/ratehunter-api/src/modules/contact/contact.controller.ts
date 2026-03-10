import { Controller, Post, Body, UseGuards, ValidationPipe } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ContactService } from './contact.service';
import { CreateContactDto } from './dto/create-contact.dto';

@Controller('contact')
@UseGuards(ThrottlerGuard)
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  async create(@Body(ValidationPipe) createContactDto: CreateContactDto) {
    await this.contactService.create(createContactDto);
    return {
      success: true,
      message: 'Your message has been received. We\'ll get back to you shortly.',
    };
  }
}
