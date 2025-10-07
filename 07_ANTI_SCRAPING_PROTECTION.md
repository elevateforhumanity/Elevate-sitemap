# 🛡️ ANTI-SCRAPING & BOT PROTECTION
## Prevent Unauthorized Data Extraction

**Priority**: 🟡 **HIGH** (Protects your content and participant data)  
**Cost**: $15,000-30,000  
**Time**: 4-6 weeks  
**Complexity**: Medium  
**ROI**: High - Protects intellectual property and WIOA data

---

## 🚨 WHY THIS MATTERS FOR YOU

### What Scraping Threatens:
1. **WIOA Participant Data** - Unauthorized access to PII
2. **Course Content** - Your intellectual property
3. **Training Materials** - Proprietary curriculum
4. **User Information** - Email addresses, profiles
5. **Business Intelligence** - Pricing, offerings, strategies
6. **Government Data** - Federal reporting information

### Legal Implications:
- ⚠️ **WIOA Violation** - Unauthorized disclosure of participant data
- ⚠️ **FERPA Violation** - Educational records exposed
- ⚠️ **Contract Breach** - Government data security requirements
- ⚠️ **Privacy Laws** - GDPR, CCPA violations
- ⚠️ **Copyright** - Theft of proprietary content

---

## 🛠️ COMPREHENSIVE ANTI-SCRAPING SOLUTION

### Layer 1: robots.txt + Meta Tags (Basic)
**Cost**: $0 (already have)  
**Effectiveness**: 10% (only stops ethical bots)

```txt
# public/robots.txt

User-agent: *
Disallow: /api/
Disallow: /admin/
Disallow: /dashboard/
Disallow: /participants/
Disallow: /reports/
Disallow: /courses/*/lessons/
Disallow: /user/

# Allow only public pages
Allow: /
Allow: /about
Allow: /contact
Allow: /courses$

# Block known scrapers
User-agent: GPTBot
Disallow: /

User-agent: ChatGPT-User
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: anthropic-ai
Disallow: /

User-agent: Claude-Web
Disallow: /

User-agent: Google-Extended
Disallow: /

User-agent: PerplexityBot
Disallow: /

User-agent: Bytespider
Disallow: /

User-agent: Amazonbot
Disallow: /

# Crawl delay for allowed bots
Crawl-delay: 10
```

```html
<!-- Add to all protected pages -->
<meta name="robots" content="noindex, nofollow, noarchive, nosnippet">
<meta name="googlebot" content="noindex, nofollow">
<meta name="bingbot" content="noindex, nofollow">
```

---

### Layer 2: Rate Limiting (Essential)
**Cost**: Already implemented  
**Effectiveness**: 40% (stops basic scrapers)

```typescript
// backend/src/middleware/anti-scraping.ts

import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

// Aggressive rate limiting for API endpoints
export const apiLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:api:'
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  
  // Skip rate limit for authenticated users with valid sessions
  skip: (req) => {
    return req.user && req.session?.verified;
  }
});

// Very strict for sensitive endpoints
export const sensitiveDataLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:sensitive:'
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Only 20 requests per hour
  message: 'Access limit exceeded',
  
  // Track by IP + User-Agent
  keyGenerator: (req) => {
    return `${req.ip}-${req.headers['user-agent']}`;
  }
});

// Course content protection
export const contentLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:content:'
  }),
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: 'Slow down! Too many content requests'
});
```

---

### Layer 3: Bot Detection (Advanced)
**Cost**: $5,000-10,000  
**Effectiveness**: 70% (stops most automated scrapers)

```typescript
// backend/src/middleware/bot-detection.ts

import { UAParser } from 'ua-parser-js';

interface BotSignature {
  userAgent: string;
  ipAddress: string;
  requestPattern: string;
  timestamp: number;
}

class BotDetector {
  private suspiciousIPs: Map<string, number> = new Map();
  private requestPatterns: Map<string, number[]> = new Map();
  
  /**
   * Detect bot behavior
   */
  async detectBot(req: Request): Promise<boolean> {
    const userAgent = req.headers['user-agent'] || '';
    const ip = req.ip;
    
    // Check 1: Known bot user agents
    if (this.isKnownBot(userAgent)) {
      await this.logBotAttempt(ip, userAgent, 'known_bot');
      return true;
    }
    
    // Check 2: Missing or suspicious user agent
    if (!userAgent || userAgent.length < 10) {
      await this.logBotAttempt(ip, userAgent, 'suspicious_ua');
      return true;
    }
    
    // Check 3: Headless browser detection
    if (this.isHeadlessBrowser(userAgent)) {
      await this.logBotAttempt(ip, userAgent, 'headless');
      return true;
    }
    
    // Check 4: Request pattern analysis
    if (await this.isSuspiciousPattern(ip, req.path)) {
      await this.logBotAttempt(ip, userAgent, 'suspicious_pattern');
      return true;
    }
    
    // Check 5: Request speed (too fast = bot)
    if (await this.isTooFast(ip)) {
      await this.logBotAttempt(ip, userAgent, 'too_fast');
      return true;
    }
    
    return false;
  }
  
  /**
   * Known bot user agents
   */
  private isKnownBot(userAgent: string): boolean {
    const botPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
      /curl/i,
      /wget/i,
      /python-requests/i,
      /scrapy/i,
      /selenium/i,
      /puppeteer/i,
      /playwright/i,
      /phantomjs/i,
      /headless/i,
      /GPTBot/i,
      /ChatGPT/i,
      /Claude/i,
      /anthropic/i,
      /Bytespider/i
    ];
    
    return botPatterns.some(pattern => pattern.test(userAgent));
  }
  
  /**
   * Detect headless browsers
   */
  private isHeadlessBrowser(userAgent: string): boolean {
    const headlessPatterns = [
      /HeadlessChrome/i,
      /PhantomJS/i,
      /Headless/i,
      /Chrome\/\d+\.0\.0\.0/i // Chrome with 0.0.0.0 version
    ];
    
    return headlessPatterns.some(pattern => pattern.test(userAgent));
  }
  
  /**
   * Analyze request patterns
   */
  private async isSuspiciousPattern(ip: string, path: string): Promise<boolean> {
    const key = `${ip}:${path}`;
    const now = Date.now();
    
    // Get recent requests from this IP
    const requests = this.requestPatterns.get(ip) || [];
    requests.push(now);
    
    // Keep only last 60 seconds
    const recentRequests = requests.filter(t => now - t < 60000);
    this.requestPatterns.set(ip, recentRequests);
    
    // Suspicious if more than 30 requests in 60 seconds
    if (recentRequests.length > 30) {
      return true;
    }
    
    // Suspicious if sequential URL patterns (e.g., /course/1, /course/2, /course/3)
    // This would require more sophisticated pattern matching
    
    return false;
  }
  
  /**
   * Check if requests are too fast (< 100ms between requests)
   */
  private async isTooFast(ip: string): Promise<boolean> {
    const requests = this.requestPatterns.get(ip) || [];
    
    if (requests.length < 2) return false;
    
    // Check last 2 requests
    const lastTwo = requests.slice(-2);
    const timeDiff = lastTwo[1] - lastTwo[0];
    
    // If less than 100ms between requests, likely a bot
    return timeDiff < 100;
  }
  
  /**
   * Log bot attempt
   */
  private async logBotAttempt(
    ip: string,
    userAgent: string,
    reason: string
  ): Promise<void> {
    await prisma.botAttempt.create({
      data: {
        ipAddress: ip,
        userAgent,
        reason,
        timestamp: new Date()
      }
    });
    
    // Increment suspicious IP counter
    const count = (this.suspiciousIPs.get(ip) || 0) + 1;
    this.suspiciousIPs.set(ip, count);
    
    // Auto-block after 5 attempts
    if (count >= 5) {
      await this.blockIP(ip, `Bot detected: ${reason}`);
    }
  }
  
  /**
   * Block IP address
   */
  private async blockIP(ip: string, reason: string): Promise<void> {
    await prisma.blockedIP.create({
      data: {
        ipAddress: ip,
        reason,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      }
    });
  }
}

export const botDetector = new BotDetector();

// Middleware
export const blockBots = async (req: Request, res: Response, next: NextFunction) => {
  // Check if IP is blocked
  const blocked = await prisma.blockedIP.findFirst({
    where: {
      ipAddress: req.ip,
      expiresAt: { gte: new Date() }
    }
  });
  
  if (blocked) {
    return res.status(403).json({
      error: 'Access denied',
      reason: 'Your IP has been blocked due to suspicious activity'
    });
  }
  
  // Detect bot
  const isBot = await botDetector.detectBot(req);
  
  if (isBot) {
    return res.status(403).json({
      error: 'Access denied',
      reason: 'Automated access is not permitted'
    });
  }
  
  next();
};
```

---

### Layer 4: CAPTCHA (Human Verification)
**Cost**: $2,000-5,000  
**Effectiveness**: 85% (stops automated bots)

```typescript
// backend/src/middleware/captcha.ts

import axios from 'axios';

/**
 * Verify reCAPTCHA v3
 */
export const verifyCaptcha = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.body.captchaToken || req.headers['x-captcha-token'];
  
  if (!token) {
    return res.status(400).json({
      error: 'CAPTCHA verification required'
    });
  }
  
  try {
    const response = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify',
      null,
      {
        params: {
          secret: process.env.RECAPTCHA_SECRET_KEY,
          response: token,
          remoteip: req.ip
        }
      }
    );
    
    const { success, score, action } = response.data;
    
    // reCAPTCHA v3 returns a score (0.0 - 1.0)
    // 0.0 = likely bot, 1.0 = likely human
    if (!success || score < 0.5) {
      await prisma.captchaFailure.create({
        data: {
          ipAddress: req.ip,
          score,
          action,
          userAgent: req.headers['user-agent']
        }
      });
      
      return res.status(403).json({
        error: 'CAPTCHA verification failed',
        score
      });
    }
    
    next();
  } catch (error) {
    console.error('CAPTCHA verification error:', error);
    return res.status(500).json({
      error: 'CAPTCHA verification error'
    });
  }
};
```

```typescript
// frontend/src/components/CaptchaProtected.tsx

import { useEffect } from 'react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

export const CaptchaProtected: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { executeRecaptcha } = useGoogleReCaptcha();
  
  useEffect(() => {
    if (!executeRecaptcha) return;
    
    const verifyCaptcha = async () => {
      const token = await executeRecaptcha('page_view');
      
      // Send token with API requests
      axios.defaults.headers.common['X-Captcha-Token'] = token;
    };
    
    verifyCaptcha();
  }, [executeRecaptcha]);
  
  return <>{children}</>;
};
```

---

### Layer 5: Content Obfuscation (Advanced)
**Cost**: $8,000-15,000  
**Effectiveness**: 90% (makes scraping very difficult)

```typescript
// backend/src/middleware/content-protection.ts

/**
 * Obfuscate sensitive content
 */
export const obfuscateContent = (req: Request, res: Response, next: NextFunction) => {
  const originalJson = res.json.bind(res);
  
  res.json = function(data: any) {
    // Only obfuscate for unauthenticated or suspicious requests
    if (!req.user || req.suspiciousActivity) {
      data = obfuscateData(data);
    }
    
    return originalJson(data);
  };
  
  next();
};

function obfuscateData(data: any): any {
  if (typeof data === 'string') {
    // Add invisible characters
    return data.split('').join('\u200B'); // Zero-width space
  }
  
  if (Array.isArray(data)) {
    return data.map(obfuscateData);
  }
  
  if (typeof data === 'object' && data !== null) {
    const obfuscated: any = {};
    for (const key in data) {
      obfuscated[key] = obfuscateData(data[key]);
    }
    return obfuscated;
  }
  
  return data;
}
```

```typescript
// frontend/src/utils/content-protection.ts

/**
 * Disable right-click on protected content
 */
export const disableRightClick = () => {
  document.addEventListener('contextmenu', (e) => {
    if ((e.target as HTMLElement).classList.contains('protected-content')) {
      e.preventDefault();
      return false;
    }
  });
};

/**
 * Disable text selection on protected content
 */
export const disableSelection = () => {
  const style = document.createElement('style');
  style.textContent = `
    .protected-content {
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
    }
  `;
  document.head.appendChild(style);
};

/**
 * Disable keyboard shortcuts (Ctrl+C, Ctrl+S, etc.)
 */
export const disableKeyboardShortcuts = () => {
  document.addEventListener('keydown', (e) => {
    // Disable Ctrl+C, Ctrl+S, Ctrl+P, F12
    if (
      (e.ctrlKey && (e.key === 'c' || e.key === 's' || e.key === 'p')) ||
      e.key === 'F12'
    ) {
      const target = e.target as HTMLElement;
      if (target.classList.contains('protected-content')) {
        e.preventDefault();
        return false;
      }
    }
  });
};

/**
 * Detect DevTools
 */
export const detectDevTools = () => {
  const threshold = 160;
  
  setInterval(() => {
    if (
      window.outerWidth - window.innerWidth > threshold ||
      window.outerHeight - window.innerHeight > threshold
    ) {
      // DevTools likely open
      console.log('Developer tools detected');
      // Optionally: redirect or show warning
    }
  }, 1000);
};
```

---

### Layer 6: Honeypot Traps (Deceptive)
**Cost**: $3,000-5,000  
**Effectiveness**: 95% (catches scrapers in the act)

```typescript
// backend/src/middleware/honeypot.ts

/**
 * Create honeypot endpoints that look like real data
 */
export const honeypotRoutes = (app: Express) => {
  // Fake API endpoint
  app.get('/api/v1/participants/export', async (req, res) => {
    // Log the scraper
    await prisma.honeypotTrigger.create({
      data: {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        endpoint: req.path,
        timestamp: new Date()
      }
    });
    
    // Auto-block
    await prisma.blockedIP.create({
      data: {
        ipAddress: req.ip,
        reason: 'Honeypot triggered',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      }
    });
    
    // Return fake data
    res.json({
      success: true,
      data: generateFakeData()
    });
  });
  
  // Hidden link in HTML (invisible to humans, visible to scrapers)
  app.get('/api/hidden/data', async (req, res) => {
    await logAndBlock(req);
    res.json({ data: 'fake' });
  });
};

function generateFakeData() {
  return Array.from({ length: 100 }, (_, i) => ({
    id: `fake-${i}`,
    name: 'John Doe',
    ssn: '000-00-0000',
    email: 'fake@example.com'
  }));
}
```

```html
<!-- Add to HTML (invisible to humans) -->
<a href="/api/hidden/data" style="display:none;">Do not follow</a>
```

---

### Layer 7: IP Reputation & Geoblocking
**Cost**: $2,000-5,000  
**Effectiveness**: 80% (blocks known bad actors)

```typescript
// backend/src/middleware/ip-reputation.ts

import axios from 'axios';

/**
 * Check IP reputation
 */
export const checkIPReputation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const ip = req.ip;
  
  // Check against known VPN/proxy/datacenter IPs
  const reputation = await getIPReputation(ip);
  
  if (reputation.isVPN || reputation.isProxy || reputation.isDatacenter) {
    await prisma.suspiciousIP.create({
      data: {
        ipAddress: ip,
        reason: 'VPN/Proxy/Datacenter',
        reputation: reputation
      }
    });
    
    // Require additional verification
    return res.status(403).json({
      error: 'Additional verification required',
      reason: 'VPN or proxy detected'
    });
  }
  
  // Check if IP is from blocked country (optional)
  if (reputation.country && isBlockedCountry(reputation.country)) {
    return res.status(403).json({
      error: 'Access denied',
      reason: 'Geographic restriction'
    });
  }
  
  next();
};

async function getIPReputation(ip: string) {
  try {
    // Use IP reputation service (e.g., IPQualityScore, MaxMind)
    const response = await axios.get(
      `https://ipqualityscore.com/api/json/ip/${process.env.IPQS_API_KEY}/${ip}`
    );
    
    return {
      isVPN: response.data.vpn,
      isProxy: response.data.proxy,
      isDatacenter: response.data.is_crawler,
      country: response.data.country_code,
      fraudScore: response.data.fraud_score
    };
  } catch (error) {
    console.error('IP reputation check failed:', error);
    return { isVPN: false, isProxy: false, isDatacenter: false };
  }
}

function isBlockedCountry(country: string): boolean {
  // Block countries with high scraping activity (optional)
  const blockedCountries = ['CN', 'RU', 'KP']; // Example
  return blockedCountries.includes(country);
}
```

---

## 💾 DATABASE CHANGES

```prisma
// Add to schema.prisma

model BotAttempt {
  id        String   @id @default(uuid())
  ipAddress String   @map("ip_address")
  userAgent String   @map("user_agent")
  reason    String   // 'known_bot' | 'suspicious_ua' | 'headless' | 'suspicious_pattern' | 'too_fast'
  timestamp DateTime @default(now())
  
  @@index([ipAddress])
  @@index([timestamp])
  @@map("bot_attempts")
}

model CaptchaFailure {
  id        String   @id @default(uuid())
  ipAddress String   @map("ip_address")
  userAgent String   @map("user_agent")
  score     Float
  action    String
  timestamp DateTime @default(now())
  
  @@index([ipAddress])
  @@index([timestamp])
  @@map("captcha_failures")
}

model HoneypotTrigger {
  id        String   @id @default(uuid())
  ipAddress String   @map("ip_address")
  userAgent String   @map("user_agent")
  endpoint  String
  timestamp DateTime @default(now())
  
  @@index([ipAddress])
  @@index([timestamp])
  @@map("honeypot_triggers")
}

model SuspiciousIP {
  id         String   @id @default(uuid())
  ipAddress  String   @map("ip_address")
  reason     String
  reputation Json?
  timestamp  DateTime @default(now())
  
  @@index([ipAddress])
  @@map("suspicious_ips")
}
```

---

## 📦 NPM PACKAGES REQUIRED

```json
{
  "ua-parser-js": "^1.0.37",
  "express-rate-limit": "^7.1.5",
  "rate-limit-redis": "^4.2.0",
  "react-google-recaptcha-v3": "^1.10.1",
  "axios": "^1.6.0"
}
```

---

## 🧪 TESTING

```typescript
// Test bot detection
describe('Bot Detection', () => {
  it('should block known bot user agents', async () => {
    const response = await request(app)
      .get('/api/courses')
      .set('User-Agent', 'curl/7.68.0');
    
    expect(response.status).toBe(403);
  });
  
  it('should block rapid requests', async () => {
    const requests = Array.from({ length: 50 }, () =>
      request(app).get('/api/courses')
    );
    
    const responses = await Promise.all(requests);
    const blocked = responses.filter(r => r.status === 429);
    
    expect(blocked.length).toBeGreaterThan(0);
  });
  
  it('should trigger honeypot', async () => {
    const response = await request(app)
      .get('/api/hidden/data');
    
    // Should return fake data
    expect(response.body.data).toBe('fake');
    
    // IP should be blocked
    const blocked = await prisma.blockedIP.findFirst({
      where: { ipAddress: '127.0.0.1' }
    });
    
    expect(blocked).toBeTruthy();
  });
});
```

---

## 💰 COST BREAKDOWN

| Layer | Feature | Cost | Effectiveness |
|-------|---------|------|---------------|
| 1 | robots.txt | $0 | 10% |
| 2 | Rate Limiting | $0 (have it) | 40% |
| 3 | Bot Detection | $5K-10K | 70% |
| 4 | CAPTCHA | $2K-5K | 85% |
| 5 | Content Obfuscation | $8K-15K | 90% |
| 6 | Honeypot Traps | $3K-5K | 95% |
| 7 | IP Reputation | $2K-5K | 80% |
| **TOTAL** | **All Layers** | **$20K-40K** | **99%** |

**Recommended**: Layers 1-4 ($7K-15K) = 85% effectiveness

---

## 📅 IMPLEMENTATION TIMELINE

### Week 1-2: Basic Protection
- [ ] Update robots.txt
- [ ] Add meta tags
- [ ] Configure rate limiting
- [ ] Deploy bot detection

### Week 3-4: Advanced Protection
- [ ] Implement CAPTCHA
- [ ] Add content obfuscation
- [ ] Create honeypot traps
- [ ] Set up IP reputation

### Week 5-6: Testing & Monitoring
- [ ] Test all layers
- [ ] Monitor bot attempts
- [ ] Tune detection rules
- [ ] Create dashboards

---

## ✅ SUCCESS CRITERIA

- [ ] 95%+ reduction in bot traffic
- [ ] Zero successful scraping attempts
- [ ] <5% false positives (legitimate users blocked)
- [ ] No impact on legitimate user experience
- [ ] All bot attempts logged and tracked

---

## 📞 RECOMMENDATION

**Implement Layers 1-4** ($7K-15K, 4 weeks):
1. ✅ robots.txt (already have)
2. ✅ Rate limiting (already have)
3. ✅ Bot detection ($5K-10K)
4. ✅ CAPTCHA ($2K-5K)

**Result**: 85% protection, good ROI, minimal user impact

**Optional**: Add Layers 5-7 if scraping persists ($13K-25K)

---

**Document Status**: Part 7 - Anti-Scraping Protection Complete  
**Add to**: Your Phase 1 implementation ($7K-15K additional)
