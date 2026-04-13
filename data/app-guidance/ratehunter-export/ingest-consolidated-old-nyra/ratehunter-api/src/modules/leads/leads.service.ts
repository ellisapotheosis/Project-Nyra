import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead } from '../../database/entities/lead.entity';
import { CreateLeadDto } from './dto/create-lead.dto';

@Injectable()
export class LeadsService {
  constructor(
    @InjectRepository(Lead)
    private readonly leadRepository: Repository<Lead>
  ) {}

  async create(createLeadDto: CreateLeadDto): Promise<Lead> {
    // Check if lead with email already exists
    const existingLead = await this.leadRepository.findOne({
      where: { email: createLeadDto.email },
    });

    if (existingLead) {
      throw new ConflictException('Lead with this email already exists');
    }

    const lead = this.leadRepository.create({
      ...createLeadDto,
      propertyValue: parseFloat(
        createLeadDto.propertyValue.replace(/[^0-9.]/g, '')
      ),
    });

    return this.leadRepository.save(lead);
  }

  async findOne(id: string): Promise<Lead> {
    const lead = await this.leadRepository.findOne({ where: { id } });

    if (!lead) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }

    return lead;
  }

  async findAll(): Promise<Lead[]> {
    return this.leadRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findByEmail(email: string): Promise<Lead | null> {
    return this.leadRepository.findOne({ where: { email } });
  }

  async updateStatus(id: string, status: string): Promise<Lead> {
    const lead = await this.findOne(id);
    lead.status = status;
    return this.leadRepository.save(lead);
  }
}
