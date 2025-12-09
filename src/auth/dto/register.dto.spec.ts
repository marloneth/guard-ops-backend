import { validate } from 'class-validator';
import { RegisterDto } from './register.dto';

describe('RegisterDto', () => {
  it('should validate with correct data', async () => {
    const dto = new RegisterDto();
    dto.email = 'test@example.com';
    dto.firstName = 'John';
    dto.lastName = 'Doe';
    dto.password = 'password123';

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should reject invalid email format', async () => {
    const dto = new RegisterDto();
    dto.email = 'invalid-email';
    dto.firstName = 'John';
    dto.lastName = 'Doe';
    dto.password = 'password123';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('email');
  });

  it('should reject password shorter than 6 characters', async () => {
    const dto = new RegisterDto();
    dto.email = 'test@example.com';
    dto.firstName = 'John';
    dto.lastName = 'Doe';
    dto.password = '123';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('password');
  });

  it('should reject empty email', async () => {
    const dto = new RegisterDto();
    dto.email = '';
    dto.firstName = 'John';
    dto.lastName = 'Doe';
    dto.password = 'password123';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('email');
  });

  it('should reject empty first name', async () => {
    const dto = new RegisterDto();
    dto.email = 'test@example.com';
    dto.firstName = '';
    dto.lastName = 'Doe';
    dto.password = 'password123';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('firstName');
  });

  it('should reject empty last name', async () => {
    const dto = new RegisterDto();
    dto.email = 'test@example.com';
    dto.firstName = 'John';
    dto.lastName = '';
    dto.password = 'password123';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('lastName');
  });

  it('should reject empty password', async () => {
    const dto = new RegisterDto();
    dto.email = 'test@example.com';
    dto.firstName = 'John';
    dto.lastName = 'Doe';
    dto.password = '';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('password');
  });
});
