import { describe, expect, test } from 'bun:test';
import {
  validateDmaPayload,
  buildPlayIntegrityComplaintPayload,
  type DmaComplaintPayload
} from '../scripts/submit-dma';

import pkg from '../package.json';

describe('DMA Citizen Submission Module (Digital Markets Act)', () => {
  test('package.json defines submit:dma script', () => {
    expect(pkg.scripts['submit:dma']).toBeDefined();
    expect(pkg.scripts['submit:dma']).toBe('bun scripts/submit-dma.ts');
  });

  test('buildPlayIntegrityComplaintPayload produces valid payload respecting DMA form limits', () => {
    const payload = buildPlayIntegrityComplaintPayload({
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.eu'
    });

    expect(payload.topic).toBe('Contact us as an EU Citizen');
    expect(payload.subject.length).toBeGreaterThan(0);
    expect(payload.subject.length).toBeLessThanOrEqual(100);
    expect(payload.message.length).toBeGreaterThan(0);
    expect(payload.message.length).toBeLessThanOrEqual(2000);
    expect(payload.message).toContain('Play Integrity API');
    expect(payload.message).toContain('Article 6(4)');
    expect(payload.message).toContain('Article 6(7)');
  });

  test('validateDmaPayload accepts a well-formed payload (happy path)', () => {
    const valid: DmaComplaintPayload = {
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.eu',
      topic: 'Contact us as an EU Citizen',
      subject: 'Valid Short Subject Under 100 Chars',
      message: 'Valid message body under 2000 characters.'
    };

    const result = validateDmaPayload(valid);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('validateDmaPayload rejects invalid payloads (error paths / sensitivity probe)', () => {
    // 1. Subject exceeding 100 characters
    const overSubject: DmaComplaintPayload = {
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.eu',
      topic: 'Contact us as an EU Citizen',
      subject: 'A'.repeat(101),
      message: 'Valid message.'
    };
    const res1 = validateDmaPayload(overSubject);
    expect(res1.valid).toBe(false);
    expect(res1.errors.some(e => e.includes('Subject exceeds 100'))).toBe(true);

    // 2. Message exceeding 2000 characters
    const overMessage: DmaComplaintPayload = {
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.eu',
      topic: 'Contact us as an EU Citizen',
      subject: 'Valid Subject',
      message: 'B'.repeat(2001)
    };
    const res2 = validateDmaPayload(overMessage);
    expect(res2.valid).toBe(false);
    expect(res2.errors.some(e => e.includes('Message exceeds 2000'))).toBe(true);

    // 3. Missing required identity fields
    const missingFields: DmaComplaintPayload = {
      firstName: '',
      lastName: '',
      email: 'invalid-email',
      topic: '',
      subject: '',
      message: ''
    };
    const res3 = validateDmaPayload(missingFields);
    expect(res3.valid).toBe(false);
    expect(res3.errors.length).toBeGreaterThanOrEqual(4);
  });
});
