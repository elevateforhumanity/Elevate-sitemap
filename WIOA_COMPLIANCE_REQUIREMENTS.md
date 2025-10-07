# DOL/WIOA Compliance Requirements

## Executive Summary

This document outlines what needs to be implemented to make the Elevate LMS fully compliant with Department of Labor (DOL) and Workforce Innovation and Opportunity Act (WIOA) requirements.

**Current Status:** 🟡 Partially Compliant  
**Priority:** 🔴 Critical for Government Funding

---

## ✅ What's Already Implemented

### 1. WIOA Compliance Dashboard
**Location:** `apps/lms/src/components/admin/WIOAComplianceDashboard.tsx`

**Features Present:**
- ✅ Performance indicators tracking
- ✅ Participant demographics tracking
- ✅ Employment outcomes tracking
- ✅ Compliance status monitoring
- ✅ Reporting schedule management
- ✅ Real-time compliance alerts

### 2. Progress Tracking
**Location:** `apps/lms/backend/src/controllers/progress.controller.ts`

**Features Present:**
- ✅ Lesson completion tracking
- ✅ Course progress percentage
- ✅ Certificate generation on completion
- ✅ Enrollment tracking
- ✅ Completion dates

### 3. Data Privacy (FERPA)
**Location:** `apps/lms/legal/ferpa-compliance.md`

**Features Present:**
- ✅ FERPA compliance documentation
- ✅ Educational records protection policy
- ✅ Data security measures outlined
- ✅ Data retention policy
- ✅ Breach response procedures

### 4. Accessibility
**Features Present:**
- ✅ AccessibilityProvider component
- ✅ Accessibility settings
- ✅ Accessibility CSS

---

## 🔴 Critical Gaps - Must Implement

### 1. Participant Eligibility Documentation System

**Status:** ❌ NOT IMPLEMENTED

**Required:**
- Participant intake forms with eligibility criteria
- Documentation upload system for:
  - Proof of income (for low-income determination)
  - Veteran status documentation
  - Dislocated worker verification
  - Youth eligibility (age verification)
  - Disability documentation (if applicable)
- Eligibility determination workflow
- Case manager review and approval
- Audit trail of eligibility decisions

**Implementation Needed:**
```typescript
// apps/lms/backend/src/models/participant.model.ts
interface ParticipantEligibility {
  id: string;
  userId: string;
  
  // Demographics
  dateOfBirth: Date;
  gender: string;
  ethnicity: string;
  race: string[];
  
  // Eligibility Categories
  isVeteran: boolean;
  veteranDocumentUrl?: string;
  
  isDislocatedWorker: boolean;
  dislocatedWorkerDocumentUrl?: string;
  layoffDate?: Date;
  
  isLowIncome: boolean;
  incomeDocumentUrl?: string;
  householdSize: number;
  annualIncome: number;
  
  isYouth: boolean; // Ages 16-24
  
  hasDisability: boolean;
  disabilityDocumentUrl?: string;
  
  // Eligibility Status
  eligibilityStatus: 'pending' | 'approved' | 'denied' | 'expired';
  approvedBy?: string;
  approvedAt?: Date;
  expiresAt?: Date;
  
  // Audit Trail
  createdAt: Date;
  updatedAt: Date;
  notes: string;
}
```

**Files to Create:**
- `apps/lms/backend/src/models/participant.model.ts`
- `apps/lms/backend/src/routes/eligibility.routes.ts`
- `apps/lms/backend/src/controllers/eligibility.controller.ts`
- `apps/lms/src/pages/admin/EligibilityReview.jsx`
- `apps/lms/src/pages/student/EligibilityApplication.jsx`

---

### 2. Attendance Tracking System

**Status:** ❌ NOT IMPLEMENTED

**Required:**
- Daily attendance recording
- Clock in/clock out for in-person training
- Online session time tracking
- Absence documentation
- Attendance reports by participant
- Attendance reports by program
- Excused vs unexcused absences
- Attendance warnings and notifications

**Implementation Needed:**
```typescript
// apps/lms/backend/src/models/attendance.model.ts
interface AttendanceRecord {
  id: string;
  userId: string;
  courseId: string;
  sessionId: string;
  
  // Attendance Details
  date: Date;
  clockIn: Date;
  clockOut?: Date;
  totalMinutes: number;
  
  // Status
  status: 'present' | 'absent' | 'tardy' | 'excused';
  excuseReason?: string;
  excuseDocumentUrl?: string;
  
  // Tracking
  ipAddress: string;
  location?: string;
  verifiedBy?: string;
  
  createdAt: Date;
  updatedAt: Date;
}
```

**Files to Create:**
- `apps/lms/backend/src/models/attendance.model.ts`
- `apps/lms/backend/src/routes/attendance.routes.ts`
- `apps/lms/backend/src/controllers/attendance.controller.ts`
- `apps/lms/src/pages/instructor/AttendanceTracking.jsx`
- `apps/lms/src/components/AttendanceClockIn.jsx`

---

### 3. Employment Outcomes Tracking

**Status:** ⚠️ PARTIALLY IMPLEMENTED (Dashboard only, no data collection)

**Required:**
- Post-program employment surveys
- Job placement tracking
- Wage/salary tracking
- Employment verification
- Employer contact information
- Job retention tracking (2nd and 4th quarter)
- Credential attainment tracking
- Measurable skill gains documentation

**Implementation Needed:**
```typescript
// apps/lms/backend/src/models/employment.model.ts
interface EmploymentOutcome {
  id: string;
  userId: string;
  courseId: string;
  
  // Employment Details
  employmentStatus: 'employed' | 'unemployed' | 'continuing_education';
  employerName?: string;
  employerContact?: string;
  jobTitle?: string;
  startDate?: Date;
  
  // Wage Information
  hourlyWage?: number;
  annualSalary?: number;
  hoursPerWeek?: number;
  
  // Verification
  verificationMethod: 'pay_stub' | 'employer_contact' | 'tax_records' | 'self_reported';
  verificationDocumentUrl?: string;
  verifiedAt?: Date;
  verifiedBy?: string;
  
  // Retention Tracking
  secondQuarterRetained: boolean;
  secondQuarterVerifiedAt?: Date;
  fourthQuarterRetained: boolean;
  fourthQuarterVerifiedAt?: Date;
  
  // Credentials
  credentialEarned: boolean;
  credentialType?: string;
  credentialDate?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}
```

**Files to Create:**
- `apps/lms/backend/src/models/employment.model.ts`
- `apps/lms/backend/src/routes/employment.routes.ts`
- `apps/lms/backend/src/controllers/employment.controller.ts`
- `apps/lms/src/pages/student/EmploymentSurvey.jsx`
- `apps/lms/src/pages/admin/EmploymentOutcomes.jsx`

---

### 4. Individual Employment Plan (IEP)

**Status:** ❌ NOT IMPLEMENTED

**Required:**
- Career goals documentation
- Skills assessment
- Training plan
- Service strategy
- Progress milestones
- Case manager notes
- Participant signatures
- Regular review and updates

**Implementation Needed:**
```typescript
// apps/lms/backend/src/models/iep.model.ts
interface IndividualEmploymentPlan {
  id: string;
  userId: string;
  caseManagerId: string;
  
  // Career Goals
  careerGoal: string;
  targetOccupation: string;
  targetIndustry: string;
  
  // Assessment
  currentSkills: string[];
  skillGaps: string[];
  barriers: string[];
  strengths: string[];
  
  // Training Plan
  trainingPrograms: {
    courseId: string;
    startDate: Date;
    expectedEndDate: Date;
    status: 'planned' | 'in_progress' | 'completed';
  }[];
  
  // Services
  supportServices: {
    service: string;
    provider: string;
    startDate: Date;
    endDate?: Date;
  }[];
  
  // Milestones
  milestones: {
    description: string;
    targetDate: Date;
    completedDate?: Date;
    status: 'pending' | 'in_progress' | 'completed' | 'missed';
  }[];
  
  // Signatures
  participantSignature: string;
  participantSignedAt: Date;
  caseManagerSignature: string;
  caseManagerSignedAt: Date;
  
  // Reviews
  lastReviewDate: Date;
  nextReviewDate: Date;
  
  createdAt: Date;
  updatedAt: Date;
}
```

**Files to Create:**
- `apps/lms/backend/src/models/iep.model.ts`
- `apps/lms/backend/src/routes/iep.routes.ts`
- `apps/lms/backend/src/controllers/iep.controller.ts`
- `apps/lms/src/pages/casemanager/IEPCreation.jsx`
- `apps/lms/src/pages/student/MyIEP.jsx`

---

### 5. Measurable Skill Gains Documentation

**Status:** ❌ NOT IMPLEMENTED

**Required:**
- Pre-assessment scores
- Post-assessment scores
- Educational functioning level gains
- Competency-based progress
- Skills checklist
- Industry-recognized credentials
- Secondary school diploma/equivalent

**Implementation Needed:**
```typescript
// apps/lms/backend/src/models/skillGains.model.ts
interface MeasurableSkillGain {
  id: string;
  userId: string;
  courseId: string;
  
  // Assessment Type
  gainType: 'educational_functioning_level' | 'secondary_diploma' | 
           'secondary_transcript' | 'postsecondary_transcript' | 
           'training_milestone' | 'skills_progression';
  
  // Pre/Post Assessment
  preAssessmentScore?: number;
  preAssessmentDate?: Date;
  postAssessmentScore?: number;
  postAssessmentDate?: Date;
  
  // Educational Functioning Level
  preEFL?: string; // e.g., "Beginning Basic", "Low Intermediate"
  postEFL?: string;
  
  // Documentation
  documentationType: string;
  documentUrl: string;
  verifiedBy: string;
  verifiedAt: Date;
  
  // Skill Details
  skillArea: string;
  competenciesAchieved: string[];
  
  createdAt: Date;
  updatedAt: Date;
}
```

**Files to Create:**
- `apps/lms/backend/src/models/skillGains.model.ts`
- `apps/lms/backend/src/routes/skillGains.routes.ts`
- `apps/lms/backend/src/controllers/skillGains.controller.ts`
- `apps/lms/src/pages/instructor/SkillGainsTracking.jsx`
- `apps/lms/src/components/PrePostAssessment.jsx`

---

### 6. Case Management System

**Status:** ❌ NOT IMPLEMENTED

**Required:**
- Case manager assignment
- Case notes and documentation
- Service referrals
- Follow-up scheduling
- Participant communication log
- Support services tracking
- Barrier identification and resolution
- Case closure documentation

**Implementation Needed:**
```typescript
// apps/lms/backend/src/models/caseManagement.model.ts
interface CaseNote {
  id: string;
  userId: string;
  caseManagerId: string;
  
  // Note Details
  noteType: 'initial_intake' | 'follow_up' | 'service_referral' | 
           'barrier_identified' | 'progress_update' | 'case_closure';
  
  subject: string;
  content: string;
  
  // Services
  servicesDiscussed: string[];
  referralsMade: string[];
  
  // Follow-up
  followUpRequired: boolean;
  followUpDate?: Date;
  followUpCompleted?: boolean;
  
  // Attachments
  attachments: string[];
  
  // Confidentiality
  confidential: boolean;
  sharedWith: string[];
  
  createdAt: Date;
  updatedAt: Date;
}
```

**Files to Create:**
- `apps/lms/backend/src/models/caseManagement.model.ts`
- `apps/lms/backend/src/routes/caseManagement.routes.ts`
- `apps/lms/backend/src/controllers/caseManagement.controller.ts`
- `apps/lms/src/pages/casemanager/CaseManagement.jsx`
- `apps/lms/src/pages/casemanager/CaseNotes.jsx`

---

### 7. Financial Tracking and Cost Allocation

**Status:** ❌ NOT IMPLEMENTED

**Required:**
- Program costs per participant
- Training costs
- Support service costs
- Administrative costs
- Cost allocation by funding source
- Budget tracking
- Expenditure reports
- Cost per outcome metrics

**Implementation Needed:**
```typescript
// apps/lms/backend/src/models/financial.model.ts
interface ParticipantCost {
  id: string;
  userId: string;
  
  // Cost Categories
  trainingCosts: number;
  supportServiceCosts: number;
  administrativeCosts: number;
  
  // Funding Sources
  fundingSource: 'WIOA_Adult' | 'WIOA_Youth' | 'WIOA_Dislocated_Worker' | 
                 'TANF' | 'SNAP' | 'Other';
  
  // Cost Details
  costItems: {
    category: string;
    description: string;
    amount: number;
    date: Date;
    invoiceUrl?: string;
  }[];
  
  // Totals
  totalCost: number;
  
  createdAt: Date;
  updatedAt: Date;
}
```

**Files to Create:**
- `apps/lms/backend/src/models/financial.model.ts`
- `apps/lms/backend/src/routes/financial.routes.ts`
- `apps/lms/backend/src/controllers/financial.controller.ts`
- `apps/lms/src/pages/admin/FinancialTracking.jsx`

---

### 8. Automated Reporting System

**Status:** ⚠️ PARTIALLY IMPLEMENTED (Dashboard shows reports, but no generation)

**Required:**
- Quarterly performance reports
- Annual reports
- Participant Individual Record Layout (PIRL)
- ETA-9130 Financial Report
- ETA-9169 WIOA Quarterly Report
- Automated report generation
- Report submission tracking
- Data validation before submission

**Implementation Needed:**
```typescript
// apps/lms/backend/src/services/reporting.service.ts
class WIOAReportingService {
  // Generate PIRL (Participant Individual Record Layout)
  async generatePIRL(startDate: Date, endDate: Date): Promise<PIRLReport>;
  
  // Generate ETA-9130 Financial Report
  async generateETA9130(quarter: string, year: number): Promise<ETA9130Report>;
  
  // Generate ETA-9169 WIOA Quarterly Report
  async generateETA9169(quarter: string, year: number): Promise<ETA9169Report>;
  
  // Validate data before submission
  async validateReportData(reportType: string): Promise<ValidationResult>;
  
  // Submit report to DOL
  async submitReport(reportId: string): Promise<SubmissionResult>;
}
```

**Files to Create:**
- `apps/lms/backend/src/services/reporting.service.ts`
- `apps/lms/backend/src/models/report.model.ts`
- `apps/lms/backend/src/routes/reporting.routes.ts`
- `apps/lms/backend/src/controllers/reporting.controller.ts`
- `apps/lms/src/pages/admin/ReportGeneration.jsx`

---

### 9. Data Validation and Quality Checks

**Status:** ❌ NOT IMPLEMENTED

**Required:**
- Real-time data validation
- Data completeness checks
- Data accuracy verification
- Duplicate detection
- Missing data alerts
- Data quality dashboard
- Automated data cleaning

**Implementation Needed:**
```typescript
// apps/lms/backend/src/services/dataValidation.service.ts
class DataValidationService {
  // Validate participant data completeness
  async validateParticipantData(userId: string): Promise<ValidationResult>;
  
  // Check for missing required fields
  async checkMissingFields(): Promise<MissingFieldsReport>;
  
  // Validate employment outcomes
  async validateEmploymentData(userId: string): Promise<ValidationResult>;
  
  // Check data quality score
  async calculateDataQualityScore(): Promise<number>;
}
```

**Files to Create:**
- `apps/lms/backend/src/services/dataValidation.service.ts`
- `apps/lms/src/pages/admin/DataQuality.jsx`

---

### 10. Audit Trail System

**Status:** ⚠️ PARTIALLY IMPLEMENTED (Some logging exists)

**Required:**
- Complete audit trail of all data changes
- User action logging
- Data access logging
- Report generation logging
- Eligibility determination logging
- Case note logging
- Tamper-proof audit logs
- Audit log retention (minimum 3 years)

**Implementation Needed:**
```typescript
// apps/lms/backend/src/models/auditLog.model.ts
interface AuditLog {
  id: string;
  
  // Who
  userId: string;
  userRole: string;
  
  // What
  action: string;
  entityType: string;
  entityId: string;
  
  // Changes
  beforeData?: any;
  afterData?: any;
  
  // When/Where
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  
  // Why
  reason?: string;
  
  // Metadata
  sessionId: string;
  requestId: string;
}
```

**Files to Create:**
- `apps/lms/backend/src/middleware/auditLog.middleware.ts`
- `apps/lms/backend/src/models/auditLog.model.ts`
- `apps/lms/backend/src/services/auditLog.service.ts`
- `apps/lms/src/pages/admin/AuditLogs.jsx`

---

## 🟡 Medium Priority - Should Implement

### 11. Equal Opportunity Data Collection

**Status:** ⚠️ PARTIALLY IMPLEMENTED (Demographics in dashboard)

**Required:**
- Voluntary self-identification forms
- Race and ethnicity data
- Gender data
- Disability status
- Veteran status
- Age data
- Equal opportunity monitoring
- Non-discrimination compliance

**Files to Create:**
- `apps/lms/src/pages/student/EqualOpportunityForm.jsx`
- `apps/lms/backend/src/models/demographics.model.ts`

---

### 12. Supportive Services Tracking

**Status:** ❌ NOT IMPLEMENTED

**Required:**
- Transportation assistance
- Childcare assistance
- Housing assistance
- Other support services
- Service provider tracking
- Cost tracking
- Service effectiveness

**Files to Create:**
- `apps/lms/backend/src/models/supportServices.model.ts`
- `apps/lms/src/pages/casemanager/SupportServices.jsx`

---

### 13. Employer Partnership Management

**Status:** ❌ NOT IMPLEMENTED

**Required:**
- Employer database
- Job posting system
- Work-based learning opportunities
- Apprenticeship tracking
- Employer feedback
- Job placement coordination

**Files to Create:**
- `apps/lms/backend/src/models/employer.model.ts`
- `apps/lms/src/pages/admin/EmployerPartners.jsx`

---

### 14. Credential Verification System

**Status:** ⚠️ PARTIALLY IMPLEMENTED (Certificates generated)

**Required:**
- Industry-recognized credential tracking
- Credential verification
- Credential expiration tracking
- Continuing education tracking
- Credential registry integration

**Files to Create:**
- `apps/lms/backend/src/services/credentialVerification.service.ts`
- `apps/lms/src/pages/admin/CredentialRegistry.jsx`

---

## 📊 Implementation Priority Matrix

### Phase 1: Critical (Weeks 1-4)
1. ✅ Participant Eligibility Documentation System
2. ✅ Attendance Tracking System
3. ✅ Employment Outcomes Tracking
4. ✅ Audit Trail System

### Phase 2: High Priority (Weeks 5-8)
5. ✅ Individual Employment Plan (IEP)
6. ✅ Measurable Skill Gains Documentation
7. ✅ Case Management System
8. ✅ Automated Reporting System

### Phase 3: Medium Priority (Weeks 9-12)
9. ✅ Financial Tracking and Cost Allocation
10. ✅ Data Validation and Quality Checks
11. ✅ Equal Opportunity Data Collection
12. ✅ Supportive Services Tracking

### Phase 4: Enhancement (Weeks 13-16)
13. ✅ Employer Partnership Management
14. ✅ Credential Verification System

---

## 🔧 Technical Requirements

### Database Schema Updates
- Add 10+ new tables for compliance data
- Add audit logging to all tables
- Add soft deletes for data retention
- Add encryption for PII fields

### API Endpoints Needed
- `/api/eligibility/*` - Eligibility management
- `/api/attendance/*` - Attendance tracking
- `/api/employment/*` - Employment outcomes
- `/api/iep/*` - Individual Employment Plans
- `/api/skill-gains/*` - Measurable skill gains
- `/api/case-management/*` - Case notes and management
- `/api/financial/*` - Financial tracking
- `/api/reporting/*` - Report generation
- `/api/audit-logs/*` - Audit trail access

### Frontend Pages Needed
- Eligibility application form
- Eligibility review dashboard
- Attendance clock in/out
- Attendance reports
- Employment survey
- Employment outcomes dashboard
- IEP creation and management
- Skill gains tracking
- Case management interface
- Financial tracking dashboard
- Report generation interface
- Data quality dashboard
- Audit log viewer

---

## 📋 Compliance Checklist

### Data Collection
- [ ] Participant demographics
- [ ] Eligibility documentation
- [ ] Attendance records
- [ ] Progress tracking
- [ ] Skill gains documentation
- [ ] Employment outcomes
- [ ] Wage information
- [ ] Credential attainment
- [ ] Support services received
- [ ] Financial costs

### Reporting
- [ ] PIRL (Participant Individual Record Layout)
- [ ] ETA-9130 Financial Report
- [ ] ETA-9169 WIOA Quarterly Report
- [ ] Performance indicator reports
- [ ] Equal opportunity reports
- [ ] Audit reports

### Documentation
- [ ] Individual Employment Plans
- [ ] Case notes
- [ ] Eligibility determinations
- [ ] Service referrals
- [ ] Follow-up documentation
- [ ] Closure documentation

### Privacy & Security
- [x] FERPA compliance
- [x] Data encryption
- [ ] Audit trails
- [ ] Access controls
- [ ] Data retention policies
- [ ] Breach notification procedures

### Accessibility
- [x] Section 508 compliance
- [x] WCAG 2.1 AA compliance
- [ ] Assistive technology support
- [ ] Alternative formats available

---

## 💰 Estimated Implementation Effort

### Development Time
- **Phase 1 (Critical):** 160-200 hours
- **Phase 2 (High Priority):** 160-200 hours
- **Phase 3 (Medium Priority):** 120-160 hours
- **Phase 4 (Enhancement):** 80-120 hours

**Total:** 520-680 hours (13-17 weeks with 1 developer)

### Testing Time
- Unit testing: 80-100 hours
- Integration testing: 60-80 hours
- User acceptance testing: 40-60 hours

**Total:** 180-240 hours

### Documentation Time
- Technical documentation: 40 hours
- User documentation: 40 hours
- Training materials: 40 hours

**Total:** 120 hours

### Grand Total
**820-1,040 hours (20-26 weeks with 1 developer)**

---

## 📚 Resources Needed

### Documentation
- WIOA Performance Accountability Guidance
- PIRL Data Element Definitions
- ETA-9130 Instructions
- ETA-9169 Instructions
- TEGL (Training and Employment Guidance Letters)

### External Systems
- State WIOA MIS system integration
- DOL reporting system access
- Credential verification services
- Employer database access

### Personnel
- WIOA compliance expert (consultant)
- Database administrator
- Frontend developer
- Backend developer
- QA tester
- Technical writer

---

## 🎯 Success Criteria

### Compliance
- ✅ Pass DOL audit
- ✅ 100% data completeness
- ✅ Timely report submission
- ✅ Zero compliance violations

### Performance
- ✅ Meet or exceed performance indicators
- ✅ 95%+ data accuracy
- ✅ Real-time reporting capability
- ✅ Automated data validation

### Usability
- ✅ Case manager efficiency improved
- ✅ Reduced manual data entry
- ✅ Streamlined reporting process
- ✅ User satisfaction > 4/5

---

**Status:** 🟡 Partially Compliant - Significant work required  
**Priority:** 🔴 Critical for government funding eligibility  
**Timeline:** 20-26 weeks for full implementation  
**Last Updated:** 2025-01-06
