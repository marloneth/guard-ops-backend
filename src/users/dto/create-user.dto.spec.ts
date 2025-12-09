import { validate } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

describe('CreateUserDto', () => {
  it('should validate with correct data', async () => {
    const dto = new CreateUserDto();
    dto.firstName = 'John';
    dto.lastName = 'Doe';
    dto.email = 'test@example.com';
    dto.passwordHash = 'something-encrypted';
    dto.role = { connect: { id: 1 } };

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should reject empty first name', async () => {
    const dto = new CreateUserDto();
    dto.firstName = '';
    dto.lastName = 'Doe';
    dto.email = 'test@example.com';
    dto.passwordHash = 'something-encrypted';
    dto.role = { connect: { id: 1 } };

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('firstName');
  });

  it('should reject empty last name', async () => {
    const dto = new CreateUserDto();
    dto.firstName = 'John';
    dto.lastName = '';
    dto.email = 'test@example.com';
    dto.passwordHash = 'something-encrypted';
    dto.role = { connect: { id: 1 } };

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('lastName');
  });

  it('should reject empty email', async () => {
    const dto = new CreateUserDto();
    dto.firstName = 'John';
    dto.lastName = 'Doe';
    dto.email = '';
    dto.passwordHash = 'something-encrypted';
    dto.role = { connect: { id: 1 } };

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('email');
  });

  it('should reject invalid email', async () => {
    const dto = new CreateUserDto();
    dto.firstName = 'John';
    dto.lastName = 'Doe';
    dto.email = 'not-an-email';
    dto.passwordHash = 'something-encrypted';
    dto.role = { connect: { id: 1 } };

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('email');
  });

  it('should reject empty password hash', async () => {
    const dto = new CreateUserDto();
    dto.firstName = 'John';
    dto.lastName = 'Doe';
    dto.email = 'test@example.com';
    dto.passwordHash = '';
    dto.role = { connect: { id: 1 } };

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('passwordHash');
  });
});
