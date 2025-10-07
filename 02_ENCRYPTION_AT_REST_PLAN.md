# 🔐 ENCRYPTION AT REST IMPLEMENTATION PLAN
## Part 2 of 10: Military-Grade Security Upgrade

**Feature**: Encryption at Rest  
**Priority**: 🔴 **CRITICAL**  
**Cost**: $20,000-35,000  
**Time**: 6-8 weeks  
**Complexity**: High  
**ROI**: High - Required for HIPAA, PCI-DSS Level 1, SOC 2 Type II

---

## 📊 OVERVIEW

### What It Does
- Encrypts all sensitive data in the database
- Encrypts files at rest in storage (S3, local filesystem)
- Protects data if database/storage is compromised
- Required for healthcare (HIPAA), financial (PCI-DSS), and government data
- Uses AES-256-GCM encryption (industry standard)

### What Gets Encrypted
1. **User Data**: Passwords (already hashed), email, phone, SSN, addresses
2. **Payment Data**: Credit card tokens, bank account info
3. **Personal Info**: Names, birthdates, medical info, disability status
4. **Files**: Course materials, assignments, certificates, user uploads
5. **Secrets**: API keys, OAuth tokens, MFA secrets, backup codes

### What Stays Unencrypted
- User IDs, course IDs (needed for queries)
- Timestamps, status fields
- Public data (course titles, descriptions)
- Metadata (file sizes, types)

---

## 🏗️ TECHNICAL ARCHITECTURE

### Encryption Strategy

#### 1. Application-Level Encryption (Recommended)
**Pros**:
- Full control over encryption
- Works with any database
- Can encrypt specific fields
- Key rotation possible

**Cons**:
- More complex to implement
- Slight performance overhead
- Can't query encrypted fields directly

#### 2. Database-Level Encryption (Alternative)
**Pros**:
- Transparent to application
- Better performance
- Easier to implement

**Cons**:
- Database-specific
- Less granular control
- Key management tied to database

**Recommendation**: Use **Application-Level** for maximum security and portability

---

## 🔑 KEY MANAGEMENT

### Key Hierarchy

```
Master Key (AWS KMS / HashiCorp Vault)
    ↓
Data Encryption Keys (DEKs) - per table/entity type
    ↓
Individual Record Encryption
```

### Key Storage Options

#### Option 1: AWS KMS (Recommended for Production)
```typescript
// Cost: $1/month per key + $0.03 per 10,000 requests
// Pros: Managed, audited, FIPS 140-2 Level 2 validated
// Cons: AWS dependency, network latency

import { KMSClient, EncryptCommand, DecryptCommand } from '@aws-sdk/client-kms';

const kms = new KMSClient({ region: 'us-east-1' });

async function encryptData(plaintext: string): Promise<string> {
  const command = new EncryptCommand({
    KeyId: process.env.AWS_KMS_KEY_ID,
    Plaintext: Buffer.from(plaintext)
  });
  
  const response = await kms.send(command);
  return Buffer.from(response.CiphertextBlob).toString('base64');
}
```

#### Option 2: HashiCorp Vault (Recommended for On-Premise)
```typescript
// Cost: Free (open source) or $0.03/hour per instance (Enterprise)
// Pros: Self-hosted, dynamic secrets, audit logs
// Cons: Infrastructure to manage

import Vault from 'node-vault';

const vault = Vault({
  endpoint: process.env.VAULT_ADDR,
  token: process.env.VAULT_TOKEN
});

async function encryptData(plaintext: string): Promise<string> {
  const result = await vault.write('transit/encrypt/elevate-data', {
    plaintext: Buffer.from(plaintext).toString('base64')
  });
  return result.data.ciphertext;
}
```

#### Option 3: Local Key Management (Development Only)
```typescript
// Cost: Free
// Pros: Simple, no external dependencies
// Cons: NOT SECURE for production, keys in environment

import crypto from 'crypto';

const MASTER_KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'hex'); // 32 bytes

function encryptData(plaintext: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', MASTER_KEY, iv);
  
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

function decryptData(ciphertext: string): string {
  const [ivHex, authTagHex, encrypted] = ciphertext.split(':');
  
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-gcm', MASTER_KEY, iv);
  
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
```

---

## 💾 DATABASE ENCRYPTION

### Schema Changes

```prisma
// schema.prisma

model User {
  id            String   @id @default(uuid())
  
  // Encrypted fields (stored as encrypted strings)
  email         String   @unique // ENCRYPTED
  emailHash     String   @unique @map("email_hash") // For lookups
  passwordHash  String   @map("password_hash") // Already hashed, but encrypt too
  name          String   // ENCRYPTED
  phone         String?  // ENCRYPTED
  ssn           String?  // ENCRYPTED (if collecting)
  address       String?  // ENCRYPTED
  
  // Unencrypted fields (safe for queries)
  role          UserRole @default(user)
  emailVerified Boolean  @default(false)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  // ... rest of relations ...
}

model Payment {
  id              String   @id @default(uuid())
  userId          String
  
  // Encrypted payment data
  cardLast4       String?  // ENCRYPTED (even though partial)
  cardBrand       String?  // ENCRYPTED
  billingAddress  String?  // ENCRYPTED
  
  // Unencrypted (safe)
  amount          Int
  currency        String
  status          PaymentStatus
  createdAt       DateTime @default(now())
}

model EncryptionKey {
  id          String   @id @default(uuid())
  keyId       String   @unique @map("key_id") // Key identifier
  version     Int      // For key rotation
  algorithm   String   @default("aes-256-gcm")
  active      Boolean  @default(true)
  createdAt   DateTime @default(now()) @map("created_at")
  rotatedAt   DateTime? @map("rotated_at")
  
  @@index([keyId, version])
  @@map("encryption_keys")
}
```

### Encryption Service

```typescript
// backend/src/services/encryption.service.ts

import crypto from 'crypto';
import { KMSClient, EncryptCommand, DecryptCommand } from '@aws-sdk/client-kms';

interface EncryptionResult {
  ciphertext: string;
  keyId: string;
  version: number;
}

class EncryptionService {
  private kms: KMSClient;
  private keyId: string;
  
  constructor() {
    this.kms = new KMSClient({ region: process.env.AWS_REGION });
    this.keyId = process.env.AWS_KMS_KEY_ID!;
  }
  
  /**
   * Encrypt sensitive data
   */
  async encrypt(plaintext: string): Promise<EncryptionResult> {
    // Generate data encryption key (DEK)
    const dek = crypto.randomBytes(32);
    
    // Encrypt the DEK with KMS master key
    const encryptedDek = await this.encryptDEK(dek);
    
    // Encrypt data with DEK
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', dek, iv);
    
    let encrypted = cipher.update(plaintext, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    
    const authTag = cipher.getAuthTag().toString('base64');
    
    // Format: version:encryptedDEK:iv:authTag:ciphertext
    const ciphertext = [
      '1', // version
      encryptedDek,
      iv.toString('base64'),
      authTag,
      encrypted
    ].join(':');
    
    return {
      ciphertext,
      keyId: this.keyId,
      version: 1
    };
  }
  
  /**
   * Decrypt sensitive data
   */
  async decrypt(ciphertext: string): Promise<string> {
    const [version, encryptedDek, ivB64, authTagB64, encrypted] = ciphertext.split(':');
    
    // Decrypt DEK with KMS
    const dek = await this.decryptDEK(encryptedDek);
    
    // Decrypt data with DEK
    const iv = Buffer.from(ivB64, 'base64');
    const authTag = Buffer.from(authTagB64, 'base64');
    const decipher = crypto.createDecipheriv('aes-256-gcm', dek, iv);
    
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
  
  /**
   * Create searchable hash for encrypted fields
   */
  createSearchHash(plaintext: string): string {
    const hmac = crypto.createHmac('sha256', process.env.SEARCH_HASH_KEY!);
    hmac.update(plaintext.toLowerCase());
    return hmac.digest('hex');
  }
  
  private async encryptDEK(dek: Buffer): Promise<string> {
    const command = new EncryptCommand({
      KeyId: this.keyId,
      Plaintext: dek
    });
    
    const response = await this.kms.send(command);
    return Buffer.from(response.CiphertextBlob!).toString('base64');
  }
  
  private async decryptDEK(encryptedDek: string): Promise<Buffer> {
    const command = new DecryptCommand({
      CiphertextBlob: Buffer.from(encryptedDek, 'base64')
    });
    
    const response = await this.kms.send(command);
    return Buffer.from(response.Plaintext!);
  }
}

export const encryptionService = new EncryptionService();
```

### Prisma Middleware for Automatic Encryption

```typescript
// backend/src/middleware/encryption.middleware.ts

import { Prisma } from '@prisma/client';
import { encryptionService } from '../services/encryption.service';

const ENCRYPTED_FIELDS = {
  User: ['email', 'name', 'phone', 'ssn', 'address'],
  Payment: ['cardLast4', 'cardBrand', 'billingAddress']
};

export function encryptionMiddleware(prisma: Prisma.Client) {
  // Encrypt on create/update
  prisma.$use(async (params, next) => {
    const model = params.model;
    const encryptedFields = ENCRYPTED_FIELDS[model];
    
    if (!encryptedFields) {
      return next(params);
    }
    
    // Encrypt fields before write
    if (params.action === 'create' || params.action === 'update') {
      for (const field of encryptedFields) {
        if (params.args.data[field]) {
          const plaintext = params.args.data[field];
          const { ciphertext } = await encryptionService.encrypt(plaintext);
          params.args.data[field] = ciphertext;
          
          // Create search hash for email
          if (field === 'email') {
            params.args.data.emailHash = encryptionService.createSearchHash(plaintext);
          }
        }
      }
    }
    
    const result = await next(params);
    
    // Decrypt fields after read
    if (params.action === 'findUnique' || params.action === 'findFirst' || params.action === 'findMany') {
      if (Array.isArray(result)) {
        for (const record of result) {
          await decryptRecord(record, encryptedFields);
        }
      } else if (result) {
        await decryptRecord(result, encryptedFields);
      }
    }
    
    return result;
  });
}

async function decryptRecord(record: any, fields: string[]) {
  for (const field of fields) {
    if (record[field]) {
      try {
        record[field] = await encryptionService.decrypt(record[field]);
      } catch (error) {
        console.error(`Failed to decrypt ${field}:`, error);
        record[field] = '[ENCRYPTED]';
      }
    }
  }
}
```

---

## 📁 FILE ENCRYPTION

### S3 Server-Side Encryption

```typescript
// backend/src/services/storage.service.ts

import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';

class StorageService {
  private s3: S3Client;
  private bucket: string;
  
  constructor() {
    this.s3 = new S3Client({ region: process.env.AWS_REGION });
    this.bucket = process.env.S3_BUCKET!;
  }
  
  /**
   * Upload file with encryption
   */
  async uploadFile(key: string, body: Buffer, contentType: string): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      
      // Server-side encryption with AWS KMS
      ServerSideEncryption: 'aws:kms',
      SSEKMSKeyId: process.env.AWS_KMS_KEY_ID,
      
      // Or use AES-256 (simpler, but less control)
      // ServerSideEncryption: 'AES256'
    });
    
    await this.s3.send(command);
    
    return `https://${this.bucket}.s3.amazonaws.com/${key}`;
  }
  
  /**
   * Download and decrypt file
   */
  async downloadFile(key: string): Promise<Buffer> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key
    });
    
    const response = await this.s3.send(command);
    const chunks: Uint8Array[] = [];
    
    for await (const chunk of response.Body as any) {
      chunks.push(chunk);
    }
    
    return Buffer.concat(chunks);
  }
}

export const storageService = new StorageService();
```

---

## 🔄 KEY ROTATION

### Rotation Strategy

```typescript
// backend/src/services/key-rotation.service.ts

class KeyRotationService {
  /**
   * Rotate encryption keys (run quarterly)
   */
  async rotateKeys(): Promise<void> {
    console.log('Starting key rotation...');
    
    // 1. Generate new key version
    const newKeyVersion = await this.createNewKeyVersion();
    
    // 2. Re-encrypt all data with new key
    await this.reencryptAllData(newKeyVersion);
    
    // 3. Mark old key as inactive
    await this.deactivateOldKey();
    
    console.log('Key rotation complete');
  }
  
  private async createNewKeyVersion(): Promise<number> {
    const latestKey = await prisma.encryptionKey.findFirst({
      where: { active: true },
      orderBy: { version: 'desc' }
    });
    
    const newVersion = (latestKey?.version || 0) + 1;
    
    await prisma.encryptionKey.create({
      data: {
        keyId: process.env.AWS_KMS_KEY_ID!,
        version: newVersion,
        algorithm: 'aes-256-gcm',
        active: true
      }
    });
    
    return newVersion;
  }
  
  private async reencryptAllData(newVersion: number): Promise<void> {
    // Re-encrypt users
    const users = await prisma.user.findMany();
    for (const user of users) {
      // Decrypt with old key, encrypt with new key
      // This happens automatically through middleware
      await prisma.user.update({
        where: { id: user.id },
        data: { updatedAt: new Date() } // Trigger re-encryption
      });
    }
    
    // Re-encrypt payments, etc.
    // ...
  }
  
  private async deactivateOldKey(): Promise<void> {
    await prisma.encryptionKey.updateMany({
      where: { active: true },
      data: { 
        active: false,
        rotatedAt: new Date()
      }
    });
  }
}
```

---

## 📦 NPM PACKAGES REQUIRED

```json
{
  "@aws-sdk/client-kms": "^3.0",
  "@aws-sdk/client-s3": "^3.0",
  "node-vault": "^0.10.2"
}
```

---

## 🧪 TESTING REQUIREMENTS

- [ ] Encrypt/decrypt all field types
- [ ] Search by encrypted email (using hash)
- [ ] File upload/download with encryption
- [ ] Key rotation without data loss
- [ ] Performance impact (<10% overhead)
- [ ] Backup/restore encrypted data
- [ ] Audit log all encryption operations

---

## 📊 PERFORMANCE IMPACT

| Operation | Before | After | Impact |
|-----------|--------|-------|--------|
| User login | 50ms | 55ms | +10% |
| User query | 20ms | 22ms | +10% |
| File upload | 200ms | 220ms | +10% |
| Bulk export | 5s | 6s | +20% |

**Mitigation**: Cache decrypted data in Redis for frequently accessed records

---

## 💰 COST BREAKDOWN

| Item | Cost | Notes |
|------|------|-------|
| **Development** | $15,000-25,000 | 200-300 hours @ $75-80/hr |
| **AWS KMS** | $1/month per key | ~$12/year |
| **KMS API calls** | $0.03 per 10K | ~$50-100/month |
| **S3 encryption** | Free | Built into S3 |
| **Testing/QA** | $3,000-5,000 | 40-60 hours |
| **Documentation** | $2,000-3,000 | 25-35 hours |
| **TOTAL** | **$20,000-35,000** | One-time + $50-100/month |

---

## 📅 IMPLEMENTATION TIMELINE

### Week 1-2: Foundation
- [ ] Set up AWS KMS
- [ ] Create encryption service
- [ ] Add database schema changes
- [ ] Implement basic encrypt/decrypt

### Week 3-4: Database Integration
- [ ] Prisma middleware
- [ ] Migrate existing data
- [ ] Add search hashing
- [ ] Test all queries

### Week 5-6: File Encryption
- [ ] S3 encryption setup
- [ ] File upload/download
- [ ] Migrate existing files
- [ ] Test file operations

### Week 7-8: Testing & Rollout
- [ ] Performance testing
- [ ] Security audit
- [ ] Key rotation testing
- [ ] Production deployment

---

## ⚠️ RISKS & MITIGATION

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Key loss** | 🔴 Critical - All data unrecoverable | Multi-region KMS backup, key escrow |
| **Performance** | 🟡 Medium - Slower queries | Redis caching, async decryption |
| **Migration failure** | 🔴 Critical - Data corruption | Full backup, rollback plan, staged migration |
| **Cost overrun** | 🟢 Low - KMS API costs | Monitor usage, cache aggressively |

---

## ✅ SUCCESS CRITERIA

- [ ] All sensitive fields encrypted at rest
- [ ] All files encrypted in S3
- [ ] Search functionality still works
- [ ] Performance impact <15%
- [ ] Zero data loss during migration
- [ ] Key rotation tested and documented
- [ ] Compliance audit passed (HIPAA/PCI-DSS)

---

## 📞 NEXT STEPS

1. **Choose key management**: AWS KMS (recommended) or HashiCorp Vault
2. **Approve budget**: $20K-35K
3. **Assign team**: 1 senior developer + 1 QA engineer
4. **Set timeline**: 6-8 weeks
5. **Plan migration**: Staged rollout with backups

---

**Document Status**: Part 2 of 10 Complete  
**Next**: Watermarking/DRM Implementation Plan
