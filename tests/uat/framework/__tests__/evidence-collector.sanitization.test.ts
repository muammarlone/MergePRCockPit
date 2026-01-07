import { sanitizeText, sanitizeObject } from '../evidence-collector';

describe('Evidence Sanitization', () => {
  describe('sanitizeText', () => {
    test('should redact API keys', () => {
      const input = 'API_KEY=abc123xyz456def789ghi012';
      const output = sanitizeText(input);
      expect(output).toContain('[REDACTED]');
      expect(output).not.toContain('abc123xyz456def789ghi012');
    });

    test('should redact Bearer tokens', () => {
      const input = 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';
      const output = sanitizeText(input);
      // JWT will be redacted first, then Authorization header catches the rest
      expect(output).toBe('Authorization: [REDACTED]');
      expect(output).not.toContain('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
    });

    test('should redact passwords', () => {
      const input = 'password: mySecretPass123';
      const output = sanitizeText(input);
      expect(output).toContain('[REDACTED]');
      expect(output).not.toContain('mySecretPass123');
    });

    test('should redact JWT tokens', () => {
      const input = 'token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U';
      const output = sanitizeText(input);
      expect(output).toContain('[REDACTED_JWT]');
      expect(output).not.toContain('eyJzdWIiOiIxMjM0NTY3ODkwIn0');
    });

    test('should redact cookies', () => {
      const input = 'Set-Cookie: sessionId=abc123; Path=/; HttpOnly';
      const output = sanitizeText(input);
      expect(output).toBe('Set-Cookie: [REDACTED]');
    });

    test('should redact authorization headers', () => {
      const input = 'Authorization: Basic dXNlcjpwYXNzd29yZA==';
      const output = sanitizeText(input);
      expect(output).toBe('Authorization: [REDACTED]');
    });

    test('should preserve non-sensitive text', () => {
      const input = 'This is normal log data without secrets';
      const output = sanitizeText(input);
      expect(output).toBe(input);
    });
  });

  describe('sanitizeObject', () => {
    test('should redact sensitive keys in objects', () => {
      const input = {
        username: 'testuser',
        password: 'secret123',
        apiKey: 'key123456',
        normalData: 'visible',
      };
      const output = sanitizeObject(input);
      expect(output.username).toBe('testuser');
      expect(output.password).toBe('[REDACTED]');
      expect(output.apiKey).toBe('[REDACTED]');
      expect(output.normalData).toBe('visible');
    });

    test('should redact nested sensitive data', () => {
      const input = {
        user: {
          name: 'test',
          credentials: {
            password: 'secret',
            token: 'abc123',
          },
        },
      };
      const output = sanitizeObject(input);
      expect(output.user.name).toBe('test');
      expect(output.user.credentials.password).toBe('[REDACTED]');
      expect(output.user.credentials.token).toBe('[REDACTED]');
    });

    test('should handle arrays with sensitive data', () => {
      const input = [
        { name: 'item1', secret: 'value1' },
        { name: 'item2', secret: 'value2' },
      ];
      const output = sanitizeObject(input);
      expect(output[0].name).toBe('item1');
      expect(output[0].secret).toBe('[REDACTED]');
      expect(output[1].name).toBe('item2');
      expect(output[1].secret).toBe('[REDACTED]');
    });

    test('should never expose sensitive patterns in output', () => {
      const sensitivePatterns = [
        'password=MySecurePass123',
        'token=abc123xyz456def789ghi',
        'Set-Cookie: sessionId=secretValue123',
      ];

      for (const sensitive of sensitivePatterns) {
        const sanitized = sanitizeText(sensitive);
        expect(sanitized).toContain('[REDACTED]');
      }
    });
  });
});
