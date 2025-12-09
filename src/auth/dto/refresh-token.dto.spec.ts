import { validate } from 'class-validator';
import { RefreshTokenDto } from './refresh-token.dto';

describe('RefreshTokenDto', () => {
  it('should validate with correct refresh token', async () => {
    const dto = new RefreshTokenDto();
    dto.refreshToken = 'valid-refresh-token-string';

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should reject empty refresh token', async () => {
    const dto = new RefreshTokenDto();
    dto.refreshToken = '';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('refreshToken');
  });

  it('should reject non-string refresh token', async () => {
    const dto = new RefreshTokenDto();
    (dto as any).refreshToken = 123;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('refreshToken');
  });
});
