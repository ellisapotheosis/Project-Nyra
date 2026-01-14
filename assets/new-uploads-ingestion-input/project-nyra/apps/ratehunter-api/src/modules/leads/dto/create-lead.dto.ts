import { IsEmail, IsEnum, IsNotEmpty, IsString, Matches } from 'class-validator';

export class CreateLeadDto {
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @Matches(/^\d{10}$/, { message: 'Phone number must be 10 digits' })
  phone: string;

  @IsNotEmpty()
  @IsEnum(['purchase', 'refinance'])
  loanType: 'purchase' | 'refinance';

  @IsNotEmpty()
  @IsString()
  propertyValue: string;

  @IsNotEmpty()
  @IsEnum(['excellent', 'good', 'fair', 'poor'])
  creditScore: 'excellent' | 'good' | 'fair' | 'poor';
}
