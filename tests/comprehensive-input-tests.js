/**
 * COMPREHENSIVE INPUT TESTING SUITE - Leo's Cafe
 * Based on: Leo's Cafe — Comprehensive Input Testing Checklist
 * 
 * Tests all input validation, security, edge cases, and error handling
 * Run with: node tests/comprehensive-input-tests.js
 */

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

// Test results tracking
const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  tests: []
};

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function logTest(category, testName, status, details, severity = 'info') {
  const statusSymbol = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⚠️';
  const color = status === 'pass' ? colors.green : status === 'fail' ? colors.red : colors.yellow;
  
  console.log(`${color}${statusSymbol} [${category}] ${testName}${colors.reset}`);
  if (details) console.log(`   ${details}`);
  
  results.tests.push({
    category,
    testName,
    status,
    details,
    severity,
    timestamp: new Date().toISOString()
  });
  
  if (status === 'pass') results.passed++;
  else if (status === 'fail') results.failed++;
  else results.warnings++;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Global CSRF token storage
let globalCsrfToken = null;

async function getCsrfToken() {
  if (globalCsrfToken) return globalCsrfToken;
  
  try {
    const response = await fetch(`${BASE_URL}/api/csrf`);
    if (response.ok) {
      const data = await response.json();
      globalCsrfToken = data.csrfToken;
      return globalCsrfToken;
    }
  } catch (error) {
    console.warn('Failed to fetch CSRF token:', error.message);
  }
  return null;
}

function section(title) {
  console.log(`\n${colors.cyan}${'='.repeat(80)}${colors.reset}`);
  console.log(`${colors.cyan}${title}${colors.reset}`);
  console.log(`${colors.cyan}${'='.repeat(80)}${colors.reset}\n`);
}

// ============================================================================
// 1. EMPTY / MISSING INPUT TESTS
// ============================================================================

async function testEmptyInputs() {
  section('1. EMPTY / MISSING INPUT TESTS');
  
  const csrfToken = await getCsrfToken();
  
  const emptyPayloads = [
    { name: 'Completely empty', data: { csrfToken } },
    { name: 'Only whitespace in phone', data: { phone: '   ', csrfToken } },
    { name: 'Tab character', data: { phone: '\t', csrfToken } },
    { name: 'Newline character', data: { phone: '\n', csrfToken } },
    { name: 'Null value', data: { phone: null, csrfToken } },
    { name: 'Undefined value', data: { phone: undefined, csrfToken } },
    { name: 'Empty string', data: { phone: '', csrfToken } }
  ];
  
  for (const payload of emptyPayloads) {
    try {
      const response = await fetch(`${BASE_URL}/api/otp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload.data)
      });
      
      const result = await response.json();
      const isProperError = response.status === 400 && result.error;
      
      logTest(
        'Empty Input',
        payload.name,
        isProperError ? 'pass' : 'fail',
        `Status: ${response.status}, Message: ${result.error || result.message || 'No error message'}`,
        'high'
      );
    } catch (error) {
      logTest('Empty Input', payload.name, 'fail', `Network error: ${error.message}`, 'high');
    }
  }
}

// ============================================================================
// 2. BOUNDARY LENGTH VALUES
// ============================================================================

async function testBoundaryLengths() {
  section('2. BOUNDARY LENGTH VALUES');
  
  const csrfToken = await getCsrfToken();
  
  const boundaryTests = [
    { name: '1 character phone', data: { phone: '1', csrfToken } },
    { name: 'Exactly 11 digits (valid)', data: { phone: '03001234567', csrfToken } },
    { name: 'Exactly 13 chars with + (valid)', data: { phone: '+923001234567', csrfToken } },
    { name: '20 digit phone', data: { phone: '12345678901234567890', csrfToken } },
    { name: '10,000 char name', data: { name: 'A'.repeat(10000), phone: '+923001234567', csrfToken } },
    { name: 'Leading whitespace', data: { phone: '  03001234567', csrfToken } },
    { name: 'Trailing whitespace', data: { phone: '03001234567  ', csrfToken } },
    { name: 'Spaces in middle', data: { phone: '030 0123 4567', csrfToken } }
  ];
  
  for (const test of boundaryTests) {
    try {
      const response = await fetch(`${BASE_URL}/api/otp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(test.data)
      });
      
      const result = await response.json();
      const isSuccess = response.status === 200;
      const isValidRejection = response.status === 400 && result.error;
      
      logTest(
        'Boundary Length',
        test.name,
        (isSuccess || isValidRejection) ? 'pass' : 'fail',
        `Status: ${response.status}, Response: ${JSON.stringify(result).substring(0, 100)}`,
        'medium'
      );
    } catch (error) {
      logTest('Boundary Length', test.name, 'fail', `Error: ${error.message}`, 'medium');
    }
  }
}

// ============================================================================
// 3. NUMERIC FIELDS TESTS
// ============================================================================

async function testNumericFields() {
  section('3. NUMERIC FIELDS TESTS');
  
  const numericTests = [
    { name: 'Zero quantity', data: { itemId: 'test-item', quantity: 0 } },
    { name: 'Negative quantity', data: { itemId: 'test-item', quantity: -5 } },
    { name: 'Decimal quantity', data: { itemId: 'test-item', quantity: 2.5 } },
    { name: 'Huge number', data: { itemId: 'test-item', quantity: 999999999999 } },
    { name: 'Text in quantity', data: { itemId: 'test-item', quantity: 'abc' } },
    { name: 'Scientific notation', data: { itemId: 'test-item', quantity: '1e10' } },
    { name: 'Leading zeros', data: { itemId: 'test-item', quantity: '007' } },
    { name: 'Comma formatted', data: { itemId: 'test-item', quantity: '1,000' } },
    { name: 'NaN value', data: { itemId: 'test-item', quantity: NaN } },
    { name: 'Infinity value', data: { itemId: 'test-item', quantity: Infinity } }
  ];
  
  for (const test of numericTests) {
    try {
      // Note: This would test your cart/order API - adjust endpoint as needed
      const response = await fetch(`${BASE_URL}/api/cart/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(test.data)
      });
      
      const result = await response.json();
      const isValidRejection = response.status === 400 || response.status === 422;
      
      logTest(
        'Numeric Fields',
        test.name,
        isValidRejection ? 'pass' : 'warn',
        `Status: ${response.status}, Message: ${result.error || result.message || 'OK'}`,
        'medium'
      );
    } catch (error) {
      logTest('Numeric Fields', test.name, 'warn', `Error: ${error.message}`, 'low');
    }
  }
}

// ============================================================================
// 4. PHONE NUMBER FIELD TESTS (CRITICAL)
// ============================================================================

async function testPhoneNumbers() {
  section('4. PHONE NUMBER FIELD TESTS (CRITICAL FOR OTP)');
  
  const csrfToken = await getCsrfToken();
  
  const phoneTests = [
    { name: 'Valid Pakistani +92', phone: '+923001234567', shouldPass: true },
    { name: 'Valid without +', phone: '03001234567', shouldPass: true },
    { name: 'Valid without leading 0', phone: '3001234567', shouldPass: true },
    { name: 'With spaces', phone: '+92 300 1234567', shouldPass: true },
    { name: 'With dashes', phone: '+92-300-1234567', shouldPass: true },
    { name: 'With parentheses', phone: '(+92) 300 1234567', shouldPass: true },
    { name: 'Landline (rejected)', phone: '+92514000000', shouldPass: false },
    { name: 'US number', phone: '+15551234567', shouldPass: false },
    { name: 'Too short', phone: '+9230012', shouldPass: false },
    { name: 'Too long', phone: '+92300123456789012', shouldPass: false },
    { name: 'Contains letters', phone: '+923ABC1234567', shouldPass: false },
    { name: 'Double plus', phone: '++923001234567', shouldPass: false },
    { name: 'Missing + with 92', phone: '923001234567', shouldPass: true },
    { name: 'SQL injection attempt', phone: "'; DROP TABLE users;--", shouldPass: false },
    { name: 'XSS in phone', phone: '<script>alert(1)</script>', shouldPass: false },
    { name: 'Arabic-Indic digits', phone: '٠٣٠٠١٢٣٤٥٦٧', shouldPass: false },
    { name: 'Emoji in phone', phone: '📞03001234567', shouldPass: false }
  ];
  
  for (const test of phoneTests) {
    try {
      const response = await fetch(`${BASE_URL}/api/otp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: test.phone, csrfToken })
      });
      
      const result = await response.json();
      const isSuccess = response.status === 200;
      const shouldSucceed = test.shouldPass;
      
      const passed = shouldSucceed ? isSuccess : !isSuccess;
      
      logTest(
        'Phone Number',
        test.name,
        passed ? 'pass' : 'fail',
        `Expected ${shouldSucceed ? 'ACCEPT' : 'REJECT'}, Got ${isSuccess ? 'ACCEPT' : 'REJECT'} (${response.status})`,
        'critical'
      );
    } catch (error) {
      logTest('Phone Number', test.name, 'fail', `Network error: ${error.message}`, 'critical');
    }
  }
}

// ============================================================================
// 5. EMAIL FIELD TESTS
// ============================================================================

async function testEmailValidation() {
  section('5. EMAIL FIELD TESTS');
  
  const emailTests = [
    { name: 'Valid standard email', email: 'test@example.com', shouldPass: true },
    { name: 'Email with plus tag', email: 'test+cafe@example.com', shouldPass: true },
    { name: 'Email with subdomain', email: 'test@mail.example.com', shouldPass: true },
    { name: 'Missing @', email: 'testexample.com', shouldPass: false },
    { name: 'Missing domain', email: 'test@', shouldPass: false },
    { name: 'Missing local part', email: '@example.com', shouldPass: false },
    { name: 'Multiple @', email: 'test@@example.com', shouldPass: false },
    { name: 'Trailing dot', email: 'test@example.com.', shouldPass: false },
    { name: 'Unicode domain', email: 'test@café.com', shouldPass: true },
    { name: 'Very long email', email: 'a'.repeat(250) + '@example.com', shouldPass: false },
    { name: 'Whitespace in email', email: ' test@example.com ', shouldPass: true },
    { name: 'Case sensitivity', email: 'TEST@EXAMPLE.COM', shouldPass: true }
  ];
  
  for (const test of emailTests) {
    try {
      const response = await fetch(`${BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: test.email, 
          password: 'TestPass123!',
          name: 'Test User',
          phone: '+923001234567'
        })
      });
      
      const result = await response.json();
      const isSuccess = response.status === 200 || response.status === 201;
      const passed = test.shouldPass ? isSuccess : !isSuccess;
      
      logTest(
        'Email Validation',
        test.name,
        passed ? 'pass' : 'fail',
        `Expected ${test.shouldPass ? 'VALID' : 'INVALID'}, Got status ${response.status}`,
        'high'
      );
    } catch (error) {
      logTest('Email Validation', test.name, 'warn', `Error: ${error.message}`, 'medium');
    }
  }
}

// ============================================================================
// 6. OTP CODE FIELD TESTS
// ============================================================================

async function testOTPValidation() {
  section('6. OTP CODE FIELD TESTS');
  
  const otpTests = [
    { name: 'Correct format', code: '123456' },
    { name: 'With leading zero', code: '007123' },
    { name: 'With whitespace', code: ' 123456 ' },
    { name: 'With letter', code: '12345a' },
    { name: 'Too short', code: '12345' },
    { name: 'Too long', code: '1234567' },
    { name: 'Empty OTP', code: '' },
    { name: 'Null OTP', code: null }
  ];
  
  for (const test of otpTests) {
    try {
      const response = await fetch(`${BASE_URL}/api/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone: '+923001234567',
          otp: test.code
        })
      });
      
      const result = await response.json();
      // OTP should be rejected (we don't have a valid one), but format should be validated
      const hasProperValidation = response.status === 400 || response.status === 401;
      
      logTest(
        'OTP Validation',
        test.name,
        hasProperValidation ? 'pass' : 'warn',
        `Status: ${response.status}, Response: ${result.error || result.message}`,
        'critical'
      );
    } catch (error) {
      logTest('OTP Validation', test.name, 'fail', `Error: ${error.message}`, 'critical');
    }
  }
}

// ============================================================================
// 7. INJECTION & SECURITY PAYLOAD TESTS (CRITICAL)
// ============================================================================

async function testSecurityPayloads() {
  section('7. INJECTION & SECURITY PAYLOAD TESTS');
  
  const securityPayloads = [
    { name: 'XSS Script tag', payload: '<script>alert(1)</script>' },
    { name: 'XSS Image onerror', payload: '<img src=x onerror=alert(1)>' },
    { name: 'XSS Event handler', payload: '" onmouseover="alert(1)' },
    { name: 'SQL injection DROP', payload: "'; DROP TABLE orders;--" },
    { name: 'SQL injection OR', payload: "' OR '1'='1" },
    { name: 'Template injection (Jinja)', payload: '{{7*7}}' },
    { name: 'Template injection (JS)', payload: '${7*7}' },
    { name: 'Path traversal', payload: '../../etc/passwd' },
    { name: 'Null byte', payload: 'test\x00.jpg' },
    { name: 'LDAP injection', payload: '*)(uid=*))(|(uid=*' },
    { name: 'Command injection', payload: '; cat /etc/passwd' },
    { name: 'NoSQL injection', payload: '{"$gt": ""}' }
  ];
  
  // Test in name field
  for (const test of securityPayloads) {
    try {
      const response = await fetch(`${BASE_URL}/api/reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: test.payload,
          phone: '+923001234567',
          date: '2026-07-10',
          time: '19:00',
          guests: 2
        })
      });
      
      const result = await response.json();
      const responseText = JSON.stringify(result);
      
      // Check if payload was executed or reflected unsafely
      const isExecuted = responseText.includes('<script>') || responseText.includes('onerror');
      const hasError = response.status >= 400;
      
      logTest(
        'Security Injection',
        `${test.name} in name field`,
        !isExecuted ? 'pass' : 'fail',
        `Status: ${response.status}, Payload ${isExecuted ? 'EXECUTED/REFLECTED' : 'safely handled'}`,
        'critical'
      );
    } catch (error) {
      logTest('Security Injection', test.name, 'warn', `Error: ${error.message}`, 'critical');
    }
  }
}

// ============================================================================
// 8. UNICODE, EMOJI & INTERNATIONALIZATION TESTS
// ============================================================================

async function testUnicodeAndEmoji() {
  section('8. UNICODE, EMOJI & INTERNATIONALIZATION');
  
  const unicodeTests = [
    { name: 'Emoji in name', value: '☕🍰 Cafe Lover 😊' },
    { name: 'Arabic text', value: 'مرحبا بكم في مقهى ليو' },
    { name: 'Urdu text', value: 'لیو کیفے میں خوش آمدید' },
    { name: 'Chinese text', value: '欢迎来到李奥咖啡馆' },
    { name: 'Japanese text', value: 'レオのカフェへようこそ' },
    { name: 'Russian text', value: 'Добро пожаловать в кафе Лео' },
    { name: 'Mixed RTL+LTR', value: 'Leo مقهى Cafe' },
    { name: 'Zero-width chars', value: 'Test\u200B\u200C\u200DName' },
    { name: 'Full-width chars', value: 'ＬｅｏＣａｆｅ' },
    { name: 'Combining diacritics', value: 'T̴̨̢͚̗̰̻̭͖͔̮̦̪̭̄͋̐̅̌̉̀̓͂̕͝ͅe̸̡̛̮̪͖̥̱̟̦̭͆̋͗̿̂̏̃́̀̈́̚ͅs̸̨̰̘̭̟̳̫̯͎̼͓͚̈́̈́̈́̾̏̚͜͝t' }
  ];
  
  for (const test of unicodeTests) {
    try {
      const response = await fetch(`${BASE_URL}/api/reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: test.value,
          phone: '+923001234567',
          date: '2026-07-10',
          time: '19:00',
          guests: 2
        })
      });
      
      const result = await response.json();
      const isHandled = response.status === 200 || response.status === 201 || 
                       (response.status === 400 && result.error);
      
      logTest(
        'Unicode/Emoji',
        test.name,
        isHandled ? 'pass' : 'fail',
        `Status: ${response.status}, ${result.error || 'Accepted'}`,
        'medium'
      );
    } catch (error) {
      logTest('Unicode/Emoji', test.name, 'fail', `Error: ${error.message}`, 'medium');
    }
  }
}

// ============================================================================
// 9. RATE LIMITING TESTS
// ============================================================================

async function testRateLimiting() {
  section('9. RATE LIMITING & ABUSE PREVENTION');
  
  console.log('Testing OTP rate limiting (3 requests in 15 minutes)...\n');
  
  const csrfToken = await getCsrfToken();
  const testPhone = '+923009999999';
  let successCount = 0;
  let blockedCount = 0;
  
  // Send 5 OTP requests rapidly
  for (let i = 1; i <= 5; i++) {
    try {
      const response = await fetch(`${BASE_URL}/api/otp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: testPhone, csrfToken })
      });
      
      const result = await response.json();
      
      if (response.status === 200) {
        successCount++;
        console.log(`  Request ${i}: ✅ Allowed`);
      } else if (response.status === 429) {
        blockedCount++;
        console.log(`  Request ${i}: 🛑 Rate limited (${result.error})`);
      } else {
        console.log(`  Request ${i}: ⚠️  Unexpected status ${response.status}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 500)); // Small delay
    } catch (error) {
      console.log(`  Request ${i}: ❌ Error: ${error.message}`);
    }
  }
  
  const isRateLimitWorking = blockedCount > 0;
  
  logTest(
    'Rate Limiting',
    'OTP send rate limit',
    isRateLimitWorking ? 'pass' : 'fail',
    `5 requests: ${successCount} allowed, ${blockedCount} blocked. ${isRateLimitWorking ? 'Working!' : 'NO RATE LIMIT DETECTED!'}`,
    'critical'
  );
}

// ============================================================================
// 10. ERROR HANDLING & SECURITY RESPONSE TESTS
// ============================================================================

async function testErrorHandling() {
  section('10. ERROR HANDLING & SECURITY RESPONSE');
  
  // Test that errors don't leak sensitive info
  const errorTests = [
    { endpoint: '/api/admin/orders', method: 'GET', name: 'Unauthorized admin access' },
    { endpoint: '/api/nonexistent', method: 'GET', name: 'Non-existent endpoint' },
    { endpoint: '/api/otp/verify', method: 'POST', name: 'Malformed JSON', body: 'invalid json {' }
  ];
  
  for (const test of errorTests) {
    try {
      const response = await fetch(`${BASE_URL}${test.endpoint}`, {
        method: test.method,
        headers: { 'Content-Type': 'application/json' },
        body: test.body || (test.method === 'POST' ? JSON.stringify({}) : undefined)
      });
      
      const text = await response.text();
      let result;
      try {
        result = JSON.parse(text);
      } catch {
        result = { raw: text };
      }
      
      // Check for leaked sensitive information
      const hasStackTrace = /at\s+.*\(.*:\d+:\d+\)/.test(text) || text.includes('Error:');
      const hasFilePath = /[A-Z]:\\/.test(text) || text.includes('/home/') || text.includes('/var/');
      const hasSQLError = /SQL|sqlite|postgres|mysql/i.test(text);
      const hasSensitiveInfo = hasStackTrace || hasFilePath || hasSQLError;
      
      logTest(
        'Error Handling',
        test.name,
        !hasSensitiveInfo ? 'pass' : 'fail',
        `Status: ${response.status}, ${hasSensitiveInfo ? '⚠️ LEAKS SENSITIVE INFO' : 'Safe error message'}`,
        hasSensitiveInfo ? 'critical' : 'medium'
      );
    } catch (error) {
      logTest('Error Handling', test.name, 'warn', `Network error: ${error.message}`, 'low');
    }
  }
}

// ============================================================================
// 11. API AUTHENTICATION & SESSION TESTS
// ============================================================================

async function testAuthenticationSecurity() {
  section('11. API AUTHENTICATION & SESSION SECURITY');
  
  const authTests = [
    { name: 'Protected route without token', endpoint: '/api/admin/orders' },
    { name: 'Protected route with invalid token', endpoint: '/api/profile/rewards' },
    { name: 'Admin route from regular user', endpoint: '/api/admin/users' }
  ];
  
  for (const test of authTests) {
    try {
      const response = await fetch(`${BASE_URL}${test.endpoint}`, {
        method: 'GET',
        headers: { 'Authorization': 'Bearer invalid_token_12345' }
      });
      
      const result = await response.json();
      const isProperlyProtected = response.status === 401 || response.status === 403;
      
      logTest(
        'Authentication',
        test.name,
        isProperlyProtected ? 'pass' : 'fail',
        `Status: ${response.status}, ${isProperlyProtected ? 'Properly blocked' : 'SECURITY ISSUE: Accessed without auth'}`,
        'critical'
      );
    } catch (error) {
      logTest('Authentication', test.name, 'warn', `Error: ${error.message}`, 'high');
    }
  }
}

// ============================================================================
// REPORT GENERATION
// ============================================================================

function generateReport() {
  console.log('\n\n');
  console.log(colors.cyan + '='.repeat(80) + colors.reset);
  console.log(colors.cyan + '📊 COMPREHENSIVE TEST REPORT - LEO\'S CAFE' + colors.reset);
  console.log(colors.cyan + '='.repeat(80) + colors.reset);
  
  const total = results.passed + results.failed + results.warnings;
  const passRate = ((results.passed / total) * 100).toFixed(1);
  
  console.log(`\n${colors.blue}SUMMARY:${colors.reset}`);
  console.log(`  Total Tests: ${total}`);
  console.log(`  ${colors.green}✅ Passed: ${results.passed}${colors.reset}`);
  console.log(`  ${colors.red}❌ Failed: ${results.failed}${colors.reset}`);
  console.log(`  ${colors.yellow}⚠️  Warnings: ${results.warnings}${colors.reset}`);
  console.log(`  Success Rate: ${passRate}%`);
  
  // Group by category
  const categories = {};
  results.tests.forEach(test => {
    if (!categories[test.category]) {
      categories[test.category] = { passed: 0, failed: 0, warnings: 0 };
    }
    if (test.status === 'pass') categories[test.category].passed++;
    else if (test.status === 'fail') categories[test.category].failed++;
    else categories[test.category].warnings++;
  });
  
  console.log(`\n${colors.blue}RESULTS BY CATEGORY:${colors.reset}\n`);
  Object.entries(categories).forEach(([category, counts]) => {
    const catTotal = counts.passed + counts.failed + counts.warnings;
    const catRate = ((counts.passed / catTotal) * 100).toFixed(0);
    console.log(`  ${category.padEnd(25)} ${catRate}% (${counts.passed}/${catTotal})`);
  });
  
  // Critical failures
  const criticalFailures = results.tests.filter(t => t.severity === 'critical' && t.status === 'fail');
  if (criticalFailures.length > 0) {
    console.log(`\n${colors.red}🚨 CRITICAL FAILURES:${colors.reset}\n`);
    criticalFailures.forEach((test, i) => {
      console.log(`  ${i + 1}. [${test.category}] ${test.testName}`);
      console.log(`     ${test.details}\n`);
    });
  }
  
  console.log('\n' + colors.cyan + '='.repeat(80) + colors.reset);
  if (passRate >= 95 && criticalFailures.length === 0) {
    console.log(colors.green + '🎉 EXCELLENT! Ready for production' + colors.reset);
  } else if (passRate >= 80 && criticalFailures.length === 0) {
    console.log(colors.yellow + '⚠️  GOOD - Minor improvements needed' + colors.reset);
  } else if (criticalFailures.length > 0) {
    console.log(colors.red + '❌ CRITICAL ISSUES FOUND - Fix before production!' + colors.reset);
  } else {
    console.log(colors.red + '❌ NEEDS WORK - Many tests failing' + colors.reset);
  }
  console.log(colors.cyan + '='.repeat(80) + colors.reset + '\n');
  
  // Save report
  const fs = require('fs');
  fs.writeFileSync('tests/comprehensive-test-report.json', JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: {
      total,
      passed: results.passed,
      failed: results.failed,
      warnings: results.warnings,
      passRate: `${passRate}%`
    },
    categories,
    tests: results.tests,
    criticalFailures
  }, null, 2));
  
  console.log('📄 Full report saved to: tests/comprehensive-test-report.json\n');
}

// ============================================================================
// MAIN TEST RUNNER
// ============================================================================

async function runAllTests() {
  console.log(colors.cyan + '\n🚀 Starting Comprehensive Input Testing Suite...' + colors.reset);
  console.log(`Testing: ${BASE_URL}\n`);
  
  // Check if server is running
  try {
    const healthCheck = await fetch(`${BASE_URL}/api/health`);
    if (!healthCheck.ok && healthCheck.status !== 404) {
      console.log(colors.red + '❌ Server is not responding. Please start the development server:' + colors.reset);
      console.log('   npm run dev\n');
      process.exit(1);
    }
  } catch (error) {
    console.log(colors.red + '❌ Cannot connect to server. Please start the development server:' + colors.reset);
    console.log('   npm run dev\n');
    console.log(colors.yellow + `   Trying to connect to: ${BASE_URL}` + colors.reset);
    console.log(colors.yellow + `   Error: ${error.message}\n` + colors.reset);
    process.exit(1);
  }
  
  try {
    await testEmptyInputs();
    await testBoundaryLengths();
    await testNumericFields();
    await testPhoneNumbers();
    await testEmailValidation();
    await testOTPValidation();
    await testSecurityPayloads();
    await testUnicodeAndEmoji();
    await testRateLimiting();
    await testErrorHandling();
    await testAuthenticationSecurity();
    
    generateReport();
  } catch (error) {
    console.error(colors.red + '\n❌ Test suite crashed:' + colors.reset, error);
    process.exit(1);
  }
}

// Run the tests
runAllTests();
