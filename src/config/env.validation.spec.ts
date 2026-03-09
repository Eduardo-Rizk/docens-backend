import { envValidationSchema } from './env.validation';

describe('envValidationSchema', () => {
  const validEnv = {
    DATABASE_URL: 'postgres://user:pass@host:6543/db',
    DIRECT_URL: 'postgres://user:pass@host:5432/db',
    SUPABASE_URL: 'https://project.supabase.co',
    SUPABASE_SERVICE_ROLE_KEY: 'service-role-key',
    CLERK_SECRET_KEY: 'sk_test_abc123',
    CLERK_JWKS_URI: 'https://example.clerk.accounts.dev/.well-known/jwks.json',
    PORT: 3001,
    NODE_ENV: 'test',
  };

  it('accepts all required vars', () => {
    const { error } = envValidationSchema.validate(validEnv, {
      allowUnknown: true,
    });
    expect(error).toBeUndefined();
  });

  it('rejects missing DATABASE_URL', () => {
    const { DATABASE_URL, ...rest } = validEnv;
    const { error } = envValidationSchema.validate(rest, {
      allowUnknown: true,
      abortEarly: false,
    });
    expect(error).toBeDefined();
    expect(error!.message).toContain('DATABASE_URL');
  });

  it('rejects missing CLERK_SECRET_KEY', () => {
    const { CLERK_SECRET_KEY, ...rest } = validEnv;
    const { error } = envValidationSchema.validate(rest, {
      allowUnknown: true,
      abortEarly: false,
    });
    expect(error).toBeDefined();
    expect(error!.message).toContain('CLERK_SECRET_KEY');
  });

  it('rejects missing CLERK_JWKS_URI', () => {
    const { CLERK_JWKS_URI, ...rest } = validEnv;
    const { error } = envValidationSchema.validate(rest, {
      allowUnknown: true,
      abortEarly: false,
    });
    expect(error).toBeDefined();
    expect(error!.message).toContain('CLERK_JWKS_URI');
  });

  it('defaults PORT to 3001 when not provided', () => {
    const { PORT, ...rest } = validEnv;
    const { value } = envValidationSchema.validate(rest, {
      allowUnknown: true,
    });
    expect(value.PORT).toBe(3001);
  });

  it('defaults NODE_ENV to development when not provided', () => {
    const { NODE_ENV, ...rest } = validEnv;
    const { value } = envValidationSchema.validate(rest, {
      allowUnknown: true,
    });
    expect(value.NODE_ENV).toBe('development');
  });
});
