# 🚨 IDS/IPS MONITORING IMPLEMENTATION PLAN
## Part 4 of 10: Military-Grade Security Upgrade

**Feature**: Intrusion Detection/Prevention System (IDS/IPS)  
**Priority**: 🔴 **CRITICAL** (Required for government contracts)  
**Cost**: $30,000-50,000  
**Time**: 8-12 weeks  
**Complexity**: High  
**ROI**: Critical - Required for FedRAMP, FISMA, NIST 800-53

---

## 📊 OVERVIEW

### What It Does
- **Real-time threat detection** - Identifies attacks as they happen
- **Automated blocking** - Stops malicious traffic automatically
- **Anomaly detection** - Identifies unusual behavior patterns
- **Compliance logging** - Meets government audit requirements
- **Incident response** - Automated alerts and responses

### Why Government Contracts Require This
- ✅ **NIST 800-53**: SI-4 (Information System Monitoring)
- ✅ **FedRAMP**: Continuous monitoring requirement
- ✅ **FISMA**: Security incident detection
- ✅ **DFARS**: Cybersecurity maturity model (CMMC)
- ✅ **FAR 52.204-21**: Basic safeguarding requirements

---

## 🎯 GOVERNMENT CONTRACT REQUIREMENTS

### What You MUST Have

#### 1. Continuous Monitoring (NIST 800-53 SI-4)
- Real-time monitoring of all system activity
- Automated alerts for security events
- Centralized log aggregation
- 24/7 monitoring capability

#### 2. Incident Detection (NIST 800-53 IR-4)
- Automated threat detection
- Incident classification
- Response procedures
- Reporting to government agencies

#### 3. Audit Logging (NIST 800-53 AU-2)
- All access attempts logged
- Failed login attempts tracked
- Administrative actions recorded
- Logs retained for 1+ years

#### 4. Vulnerability Scanning (NIST 800-53 RA-5)
- Weekly vulnerability scans
- Automated patch management
- Risk assessment reports
- Remediation tracking

---

## 🏗️ TECHNICAL ARCHITECTURE

### Multi-Layer Defense

```
┌─────────────────────────────────────────────────────┐
│                   Internet Traffic                   │
└─────────────────────┬───────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────┐
│  Layer 1: Network IDS (Suricata/Snort)             │
│  - DDoS detection                                   │
│  - Port scanning detection                          │
│  - Network anomalies                                │
└─────────────────────┬───────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────┐
│  Layer 2: Web Application Firewall (ModSecurity)    │
│  - SQL injection blocking                           │
│  - XSS prevention                                   │
│  - OWASP Top 10 protection                          │
└─────────────────────┬───────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────┐
│  Layer 3: Application IDS (Custom)                  │
│  - Failed login attempts                            │
│  - Privilege escalation attempts                    │
│  - Data exfiltration detection                      │
└─────────────────────┬───────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────┐
│  Layer 4: SIEM (Splunk/ELK Stack)                  │
│  - Log aggregation                                  │
│  - Correlation analysis                             │
│  - Compliance reporting                             │
└─────────────────────────────────────────────────────┘
```

---

## 🛠️ IMPLEMENTATION OPTIONS

### Option 1: Cloud-Based (Recommended for Government)
**Tools**: AWS GuardDuty + AWS WAF + CloudWatch + Splunk Cloud  
**Cost**: $2,000-5,000/month  
**Pros**: FedRAMP authorized, managed, scalable  
**Cons**: Ongoing costs, vendor lock-in

### Option 2: Self-Hosted (Maximum Control)
**Tools**: Suricata + ModSecurity + ELK Stack + Wazuh  
**Cost**: $30K-50K setup + $500-1,000/month  
**Pros**: Full control, no vendor lock-in  
**Cons**: More complex, requires expertise

### Option 3: Hybrid (Best of Both)
**Tools**: AWS GuardDuty + Self-hosted ELK + Wazuh  
**Cost**: $20K-35K setup + $1,500-3,000/month  
**Pros**: Balance of control and convenience  
**Cons**: More complex architecture

**Recommendation**: **Option 3 (Hybrid)** for government contracts

---

## 🔧 DETAILED IMPLEMENTATION

### 1. Network IDS - Suricata

```yaml
# docker-compose.yml

services:
  suricata:
    image: jasonish/suricata:latest
    network_mode: host
    cap_add:
      - NET_ADMIN
      - SYS_NICE
    volumes:
      - ./suricata/rules:/var/lib/suricata/rules
      - ./suricata/logs:/var/log/suricata
      - ./suricata/config:/etc/suricata
    environment:
      - SURICATA_OPTIONS=-i eth0
```

```yaml
# suricata/config/suricata.yaml

vars:
  address-groups:
    HOME_NET: "[192.168.0.0/16,10.0.0.0/8]"
    EXTERNAL_NET: "!$HOME_NET"

outputs:
  - eve-log:
      enabled: yes
      filetype: regular
      filename: eve.json
      types:
        - alert
        - http
        - dns
        - tls
        - files
        - ssh

rule-files:
  - suricata.rules
  - emerging-threats.rules
  - government-specific.rules
```

### 2. Web Application Firewall - ModSecurity

```nginx
# nginx.conf

http {
    # Load ModSecurity
    modsecurity on;
    modsecurity_rules_file /etc/nginx/modsec/main.conf;
    
    server {
        listen 443 ssl;
        server_name elevate.example.com;
        
        # ModSecurity rules
        location / {
            modsecurity_rules '
                SecRuleEngine On
                SecRule ARGS "@detectSQLi" "id:1,deny,status:403"
                SecRule ARGS "@detectXSS" "id:2,deny,status:403"
            ';
            
            proxy_pass http://backend:3001;
        }
    }
}
```

```conf
# /etc/nginx/modsec/main.conf

Include /etc/nginx/modsec/modsecurity.conf
Include /usr/share/modsecurity-crs/owasp-crs.load
Include /usr/share/modsecurity-crs/rules/*.conf

# Custom government rules
SecRule REQUEST_URI "@contains /api/admin" \
    "id:1000,phase:1,deny,status:403,msg:'Admin access from unauthorized IP'"

SecRule RESPONSE_BODY "@contains SSN" \
    "id:1001,phase:4,deny,status:403,msg:'Potential PII leak detected'"
```

### 3. Application-Level IDS

```typescript
// backend/src/services/ids.service.ts

import { PrismaClient } from '@prisma/client';
import { EventEmitter } from 'events';

interface SecurityEvent {
  type: 'failed_login' | 'privilege_escalation' | 'data_exfiltration' | 'suspicious_activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  ipAddress: string;
  userAgent: string;
  details: any;
}

class IDSService extends EventEmitter {
  private prisma: PrismaClient;
  private failedLoginAttempts: Map<string, number> = new Map();
  
  constructor() {
    super();
    this.prisma = new PrismaClient();
  }
  
  /**
   * Track failed login attempts
   */
  async trackFailedLogin(email: string, ipAddress: string, userAgent: string): Promise<void> {
    const key = `${email}:${ipAddress}`;
    const attempts = (this.failedLoginAttempts.get(key) || 0) + 1;
    this.failedLoginAttempts.set(key, attempts);
    
    // Log to database
    await this.prisma.securityEvent.create({
      data: {
        type: 'failed_login',
        severity: attempts > 5 ? 'high' : 'medium',
        email,
        ipAddress,
        userAgent,
        metadata: { attempts }
      }
    });
    
    // Alert if threshold exceeded
    if (attempts >= 5) {
      this.emit('security_alert', {
        type: 'brute_force_attack',
        severity: 'high',
        email,
        ipAddress,
        attempts
      });
      
      // Auto-block IP
      await this.blockIP(ipAddress, 'Brute force attack detected');
    }
    
    // Reset after 15 minutes
    setTimeout(() => {
      this.failedLoginAttempts.delete(key);
    }, 15 * 60 * 1000);
  }
  
  /**
   * Detect privilege escalation attempts
   */
  async detectPrivilegeEscalation(
    userId: string,
    attemptedRole: string,
    currentRole: string,
    ipAddress: string
  ): Promise<void> {
    if (attemptedRole === 'admin' && currentRole !== 'admin') {
      await this.prisma.securityEvent.create({
        data: {
          type: 'privilege_escalation',
          severity: 'critical',
          userId,
          ipAddress,
          metadata: {
            attemptedRole,
            currentRole
          }
        }
      });
      
      this.emit('security_alert', {
        type: 'privilege_escalation',
        severity: 'critical',
        userId,
        attemptedRole,
        currentRole
      });
      
      // Auto-suspend user
      await this.suspendUser(userId, 'Privilege escalation attempt');
    }
  }
  
  /**
   * Detect data exfiltration
   */
  async detectDataExfiltration(
    userId: string,
    dataType: string,
    recordCount: number,
    ipAddress: string
  ): Promise<void> {
    // Alert if large data export
    if (recordCount > 1000) {
      await this.prisma.securityEvent.create({
        data: {
          type: 'data_exfiltration',
          severity: 'high',
          userId,
          ipAddress,
          metadata: {
            dataType,
            recordCount
          }
        }
      });
      
      this.emit('security_alert', {
        type: 'data_exfiltration',
        severity: 'high',
        userId,
        dataType,
        recordCount
      });
    }
  }
  
  /**
   * Detect anomalous behavior
   */
  async detectAnomaly(userId: string, ipAddress: string): Promise<void> {
    // Check for unusual access patterns
    const recentLogins = await this.prisma.session.findMany({
      where: {
        userId,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      }
    });
    
    // Multiple IPs in short time
    const uniqueIPs = new Set(recentLogins.map(s => s.ipAddress));
    if (uniqueIPs.size > 5) {
      await this.prisma.securityEvent.create({
        data: {
          type: 'suspicious_activity',
          severity: 'medium',
          userId,
          ipAddress,
          metadata: {
            reason: 'Multiple IPs in 24 hours',
            ipCount: uniqueIPs.size
          }
        }
      });
      
      this.emit('security_alert', {
        type: 'account_compromise',
        severity: 'medium',
        userId,
        ipCount: uniqueIPs.size
      });
    }
  }
  
  /**
   * Block IP address
   */
  private async blockIP(ipAddress: string, reason: string): Promise<void> {
    await this.prisma.blockedIP.create({
      data: {
        ipAddress,
        reason,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      }
    });
  }
  
  /**
   * Suspend user account
   */
  private async suspendUser(userId: string, reason: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        suspended: true,
        suspensionReason: reason
      }
    });
  }
}

export const idsService = new IDSService();
```

### 4. SIEM Integration - ELK Stack

```yaml
# docker-compose.yml

services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=true
      - ELASTIC_PASSWORD=${ELASTIC_PASSWORD}
    volumes:
      - elasticsearch-data:/usr/share/elasticsearch/data
    ports:
      - "9200:9200"
  
  logstash:
    image: docker.elastic.co/logstash/logstash:8.11.0
    volumes:
      - ./logstash/pipeline:/usr/share/logstash/pipeline
      - ./logs:/logs
    depends_on:
      - elasticsearch
  
  kibana:
    image: docker.elastic.co/kibana/kibana:8.11.0
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
      - ELASTICSEARCH_USERNAME=elastic
      - ELASTICSEARCH_PASSWORD=${ELASTIC_PASSWORD}
    ports:
      - "5601:5601"
    depends_on:
      - elasticsearch
  
  filebeat:
    image: docker.elastic.co/beats/filebeat:8.11.0
    volumes:
      - ./filebeat/filebeat.yml:/usr/share/filebeat/filebeat.yml
      - /var/log:/var/log:ro
      - /var/lib/docker/containers:/var/lib/docker/containers:ro
    depends_on:
      - elasticsearch
```

```yaml
# logstash/pipeline/security-events.conf

input {
  file {
    path => "/logs/security-events.log"
    type => "security"
  }
  
  file {
    path => "/var/log/suricata/eve.json"
    codec => json
    type => "ids"
  }
}

filter {
  if [type] == "security" {
    json {
      source => "message"
    }
    
    # Enrich with GeoIP
    geoip {
      source => "ipAddress"
    }
    
    # Add severity score
    if [severity] == "critical" {
      mutate {
        add_field => { "severity_score" => 4 }
      }
    }
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "security-events-%{+YYYY.MM.dd}"
    user => "elastic"
    password => "${ELASTIC_PASSWORD}"
  }
  
  # Alert on critical events
  if [severity] == "critical" {
    email {
      to => "security@elevate.com"
      subject => "CRITICAL Security Alert: %{type}"
      body => "Event: %{message}"
    }
  }
}
```

---

## 💾 DATABASE CHANGES

```prisma
// Add to schema.prisma

model SecurityEvent {
  id        String   @id @default(uuid())
  type      String   // 'failed_login' | 'privilege_escalation' | 'data_exfiltration' | 'suspicious_activity'
  severity  String   // 'low' | 'medium' | 'high' | 'critical'
  userId    String?  @map("user_id")
  email     String?
  ipAddress String   @map("ip_address")
  userAgent String   @map("user_agent")
  metadata  Json?
  resolved  Boolean  @default(false)
  resolvedAt DateTime? @map("resolved_at")
  resolvedBy String?  @map("resolved_by")
  createdAt DateTime @default(now()) @map("created_at")
  
  user User? @relation(fields: [userId], references: [id])
  
  @@index([type])
  @@index([severity])
  @@index([userId])
  @@index([ipAddress])
  @@index([createdAt])
  @@map("security_events")
}

model BlockedIP {
  id        String   @id @default(uuid())
  ipAddress String   @unique @map("ip_address")
  reason    String
  createdAt DateTime @default(now()) @map("created_at")
  expiresAt DateTime @map("expires_at")
  
  @@index([ipAddress])
  @@index([expiresAt])
  @@map("blocked_ips")
}

model VulnerabilityScan {
  id          String   @id @default(uuid())
  scanType    String   @map("scan_type") // 'network' | 'application' | 'dependency'
  findings    Json     // Array of vulnerabilities
  severity    String   // 'low' | 'medium' | 'high' | 'critical'
  status      String   // 'open' | 'in_progress' | 'resolved'
  scannedAt   DateTime @default(now()) @map("scanned_at")
  resolvedAt  DateTime? @map("resolved_at")
  
  @@index([scanType])
  @@index([severity])
  @@index([status])
  @@map("vulnerability_scans")
}
```

---

## 📦 NPM PACKAGES & TOOLS

```json
{
  "@elastic/elasticsearch": "^8.11.0",
  "winston": "^3.11.0",
  "winston-elasticsearch": "^0.17.4",
  "geoip-lite": "^1.4.7",
  "helmet": "^7.1.0",
  "express-rate-limit": "^7.1.5"
}
```

**System Tools**:
- Suricata (Network IDS)
- ModSecurity (WAF)
- ELK Stack (SIEM)
- Wazuh (Host IDS)
- OSSEC (File integrity)

---

## 🧪 TESTING REQUIREMENTS

- [ ] Detect SQL injection attempts
- [ ] Detect XSS attempts
- [ ] Detect brute force attacks
- [ ] Detect privilege escalation
- [ ] Detect data exfiltration
- [ ] Alert on critical events
- [ ] Auto-block malicious IPs
- [ ] Generate compliance reports

---

## 💰 COST BREAKDOWN

| Item | Cost | Notes |
|------|------|-------|
| **Development** | $20,000-30,000 | 250-375 hours |
| **Infrastructure** | $5,000-10,000 | Servers, storage |
| **Tools/Licenses** | $3,000-5,000 | Splunk, commercial rules |
| **Testing** | $2,000-5,000 | Penetration testing |
| **TOTAL Setup** | **$30,000-50,000** | One-time |
| **Monthly Ops** | **$1,500-3,000** | Ongoing monitoring |

---

## 📅 IMPLEMENTATION TIMELINE

### Week 1-2: Infrastructure Setup
- [ ] Deploy ELK Stack
- [ ] Configure Suricata
- [ ] Set up ModSecurity

### Week 3-4: Application Integration
- [ ] Implement IDS service
- [ ] Add security event logging
- [ ] Create alert system

### Week 5-6: SIEM Configuration
- [ ] Configure log aggregation
- [ ] Create dashboards
- [ ] Set up alerting rules

### Week 7-8: Testing & Tuning
- [ ] Penetration testing
- [ ] False positive tuning
- [ ] Performance optimization

### Week 9-10: Documentation & Training
- [ ] Create runbooks
- [ ] Train security team
- [ ] Document procedures

### Week 11-12: Compliance Validation
- [ ] NIST 800-53 checklist
- [ ] Generate compliance reports
- [ ] Final audit

---

## ✅ SUCCESS CRITERIA

- [ ] All NIST 800-53 SI-4 requirements met
- [ ] Real-time threat detection operational
- [ ] Automated blocking functional
- [ ] Compliance reports generated
- [ ] 24/7 monitoring capability
- [ ] Incident response procedures documented
- [ ] Government audit ready

---

**Document Status**: Part 4 of 10 Complete  
**Next**: FedRAMP Compliance Roadmap (CRITICAL for government contracts)
