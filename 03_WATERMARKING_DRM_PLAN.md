# 🎬 WATERMARKING & DRM IMPLEMENTATION PLAN
## Part 3 of 10: Military-Grade Security Upgrade

**Feature**: Watermarking & Digital Rights Management (DRM)  
**Priority**: 🟡 **HIGH** (Optional - only if content protection needed)  
**Cost**: $75,000-150,000  
**Time**: 4-6 months  
**Complexity**: Very High  
**ROI**: Medium - Only valuable if you have premium content to protect

---

## 📊 OVERVIEW

### What It Does
- **Watermarking**: Embeds user ID/email into videos, PDFs, images
- **DRM**: Prevents unauthorized copying, downloading, screen recording
- **Forensic Tracking**: Traces leaked content back to the source user
- **Access Control**: Time-limited, device-limited content access
- **Screen Capture Prevention**: Blocks screenshots and screen recording

### What It Protects
1. **Video Content**: Course videos, lectures, tutorials
2. **PDF Documents**: Textbooks, worksheets, certificates
3. **Images**: Diagrams, infographics, proprietary images
4. **Audio**: Podcasts, audio lessons, interviews
5. **Live Streams**: Real-time classes, webinars

### What It Doesn't Protect
- Text content (can be retyped)
- Public information
- User-generated content
- Free/open-source materials

---

## ⚠️ HONEST ASSESSMENT

### Should You Build This?

**❌ DON'T BUILD IF**:
- Your content is educational/public benefit
- You don't have high-value premium content
- Your users are trusted (schools, universities)
- Budget is limited (<$100K)
- You're okay with some content sharing

**✅ BUILD IF**:
- You have expensive premium courses ($500+)
- Content piracy is a major concern
- You sell to enterprises who require DRM
- You have proprietary/confidential training materials
- You need forensic tracking for leaks

### Reality Check
- **DRM is expensive** and complex
- **Users hate DRM** (poor UX, compatibility issues)
- **DRM can be bypassed** (screen recording phones, HDMI capture)
- **Watermarking is better** than full DRM for most use cases
- **Consider alternatives**: Lower prices, community building, value-add services

---

## 🎯 RECOMMENDED APPROACH

### Option 1: Visible Watermarking (Recommended)
**Cost**: $15,000-25,000  
**Time**: 6-8 weeks  
**Complexity**: Medium

**What it does**:
- Overlays user email/ID on videos
- Adds watermark to PDFs
- Visible deterrent to sharing

**Pros**:
- ✅ Simple to implement
- ✅ Works on all devices
- ✅ No compatibility issues
- ✅ Effective deterrent

**Cons**:
- ❌ Can be cropped out
- ❌ Visible to legitimate users
- ❌ Doesn't prevent screen recording

### Option 2: Invisible Watermarking (Advanced)
**Cost**: $50,000-75,000  
**Time**: 3-4 months  
**Complexity**: High

**What it does**:
- Embeds invisible data in video/audio
- Forensic tracking of leaks
- Doesn't affect user experience

**Pros**:
- ✅ Invisible to users
- ✅ Can't be removed easily
- ✅ Forensic tracking

**Cons**:
- ❌ Expensive
- ❌ Complex to implement
- ❌ Requires specialized tools

### Option 3: Full DRM (Not Recommended)
**Cost**: $150,000-300,000  
**Time**: 6-12 months  
**Complexity**: Extreme

**What it does**:
- Encrypted video streaming
- Device authorization
- Screen capture prevention
- Download prevention

**Pros**:
- ✅ Maximum protection
- ✅ Enterprise-grade

**Cons**:
- ❌ Very expensive
- ❌ Poor user experience
- ❌ Compatibility issues
- ❌ Can still be bypassed
- ❌ Requires specialized players

**Recommendation**: **Start with Option 1 (Visible Watermarking)**

---

## 🎬 VISIBLE WATERMARKING IMPLEMENTATION

### Video Watermarking

#### Using FFmpeg (Server-Side)
```typescript
// backend/src/services/watermark.service.ts

import ffmpeg from 'fluent-ffmpeg';
import path from 'path';

class WatermarkService {
  /**
   * Add visible watermark to video
   */
  async watermarkVideo(
    inputPath: string,
    outputPath: string,
    userEmail: string,
    userId: string
  ): Promise<void> {
    const watermarkText = `${userEmail} | ${userId} | ${new Date().toISOString()}`;
    
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .videoFilters([
          {
            filter: 'drawtext',
            options: {
              text: watermarkText,
              fontsize: 24,
              fontcolor: 'white@0.7',
              x: '10',
              y: 'h-th-10',
              shadowcolor: 'black@0.5',
              shadowx: 2,
              shadowy: 2
            }
          }
        ])
        .output(outputPath)
        .on('end', () => resolve())
        .on('error', (err) => reject(err))
        .run();
    });
  }
  
  /**
   * Add dynamic watermark (changes position over time)
   */
  async dynamicWatermark(
    inputPath: string,
    outputPath: string,
    userEmail: string
  ): Promise<void> {
    // Watermark moves around to prevent cropping
    const watermarkText = userEmail;
    
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .videoFilters([
          {
            filter: 'drawtext',
            options: {
              text: watermarkText,
              fontsize: 20,
              fontcolor: 'white@0.6',
              // Move watermark in a circle
              x: '(w-text_w)/2+(w-text_w)/2*sin(2*PI*t/10)',
              y: '(h-text_h)/2+(h-text_h)/2*cos(2*PI*t/10)',
              shadowcolor: 'black@0.5',
              shadowx: 2,
              shadowy: 2
            }
          }
        ])
        .output(outputPath)
        .on('end', () => resolve())
        .on('error', (err) => reject(err))
        .run();
    });
  }
}

export const watermarkService = new WatermarkService();
```

#### Client-Side Watermark (HTML5 Video)
```typescript
// frontend/src/components/WatermarkedVideo.tsx

import React, { useEffect, useRef } from 'react';

interface Props {
  videoUrl: string;
  userEmail: string;
  userId: string;
}

export const WatermarkedVideo: React.FC<Props> = ({ videoUrl, userEmail, userId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    if (!canvas || !video) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const drawFrame = () => {
      // Draw video frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Draw watermark
      ctx.font = '20px Arial';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 4;
      
      const watermark = `${userEmail} | ${userId}`;
      const x = 10;
      const y = canvas.height - 20;
      
      ctx.fillText(watermark, x, y);
      
      requestAnimationFrame(drawFrame);
    };
    
    video.addEventListener('play', drawFrame);
    
    return () => {
      video.removeEventListener('play', drawFrame);
    };
  }, [userEmail, userId]);
  
  return (
    <div className="relative">
      <video
        ref={videoRef}
        src={videoUrl}
        controls
        className="hidden"
      />
      <canvas
        ref={canvasRef}
        width={1280}
        height={720}
        className="w-full"
      />
    </div>
  );
};
```

### PDF Watermarking

```typescript
// backend/src/services/pdf-watermark.service.ts

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs/promises';

class PDFWatermarkService {
  /**
   * Add watermark to PDF
   */
  async watermarkPDF(
    inputPath: string,
    outputPath: string,
    userEmail: string,
    userId: string
  ): Promise<void> {
    // Load PDF
    const pdfBytes = await fs.readFile(inputPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    
    // Get font
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    
    // Add watermark to each page
    const pages = pdfDoc.getPages();
    const watermarkText = `Licensed to: ${userEmail} | ID: ${userId}`;
    
    for (const page of pages) {
      const { width, height } = page.getSize();
      
      // Diagonal watermark
      page.drawText(watermarkText, {
        x: width / 2 - 200,
        y: height / 2,
        size: 40,
        font,
        color: rgb(0.7, 0.7, 0.7),
        opacity: 0.3,
        rotate: { angle: 45, type: 'degrees' }
      });
      
      // Footer watermark
      page.drawText(watermarkText, {
        x: 50,
        y: 20,
        size: 10,
        font,
        color: rgb(0.5, 0.5, 0.5),
        opacity: 0.7
      });
    }
    
    // Save watermarked PDF
    const watermarkedPdfBytes = await pdfDoc.save();
    await fs.writeFile(outputPath, watermarkedPdfBytes);
  }
}

export const pdfWatermarkService = new PDFWatermarkService();
```

### Image Watermarking

```typescript
// backend/src/services/image-watermark.service.ts

import sharp from 'sharp';

class ImageWatermarkService {
  /**
   * Add watermark to image
   */
  async watermarkImage(
    inputPath: string,
    outputPath: string,
    userEmail: string
  ): Promise<void> {
    // Create watermark text as SVG
    const watermarkSvg = `
      <svg width="400" height="50">
        <text
          x="10"
          y="30"
          font-family="Arial"
          font-size="20"
          fill="white"
          fill-opacity="0.7"
          stroke="black"
          stroke-width="1"
          stroke-opacity="0.5"
        >
          ${userEmail}
        </text>
      </svg>
    `;
    
    const watermarkBuffer = Buffer.from(watermarkSvg);
    
    // Add watermark to image
    await sharp(inputPath)
      .composite([
        {
          input: watermarkBuffer,
          gravity: 'southeast'
        }
      ])
      .toFile(outputPath);
  }
}

export const imageWatermarkService = new ImageWatermarkService();
```

---

## 🔒 INVISIBLE WATERMARKING (Advanced)

### Video Steganography

```typescript
// Uses specialized libraries like video-stego or custom implementation

import { VideoSteganography } from 'video-stego'; // Hypothetical library

class InvisibleWatermarkService {
  /**
   * Embed invisible watermark in video
   */
  async embedWatermark(
    videoPath: string,
    outputPath: string,
    userId: string
  ): Promise<void> {
    const stego = new VideoSteganography();
    
    // Embed user ID in video frames using LSB (Least Significant Bit)
    await stego.embed({
      input: videoPath,
      output: outputPath,
      data: userId,
      method: 'lsb', // Least Significant Bit
      strength: 0.1  // Imperceptible to human eye
    });
  }
  
  /**
   * Extract watermark from leaked video
   */
  async extractWatermark(videoPath: string): Promise<string> {
    const stego = new VideoSteganography();
    
    const userId = await stego.extract({
      input: videoPath,
      method: 'lsb'
    });
    
    return userId;
  }
}
```

**Note**: This requires specialized libraries or custom implementation. Consider using:
- **AWS Elemental MediaConvert** with forensic watermarking
- **BuyDRM** or **Verimatrix** (commercial solutions)
- **Custom steganography** implementation

---

## 🛡️ DRM IMPLEMENTATION (Not Recommended)

### Option 1: AWS Elemental MediaConvert + CloudFront
**Cost**: $10,000-20,000 setup + $0.015/minute transcoding

```typescript
// backend/src/services/drm.service.ts

import { MediaConvertClient, CreateJobCommand } from '@aws-sdk/client-mediaconvert';

class DRMService {
  private mediaConvert: MediaConvertClient;
  
  /**
   * Encrypt video with DRM
   */
  async encryptVideo(inputS3Path: string, outputS3Path: string): Promise<void> {
    const command = new CreateJobCommand({
      Role: process.env.MEDIACONVERT_ROLE_ARN,
      Settings: {
        Inputs: [{
          FileInput: inputS3Path
        }],
        OutputGroups: [{
          OutputGroupSettings: {
            Type: 'HLS_GROUP_SETTINGS',
            HlsGroupSettings: {
              Destination: outputS3Path,
              Encryption: {
                Type: 'SPEKE',
                SpekeKeyProvider: {
                  Url: process.env.SPEKE_SERVER_URL,
                  ResourceId: 'video-id'
                }
              }
            }
          }
        }]
      }
    });
    
    await this.mediaConvert.send(command);
  }
}
```

### Option 2: Widevine/PlayReady/FairPlay
**Cost**: $50,000-100,000 + licensing fees

Requires:
- DRM license server
- Key management system
- Custom video player
- Device certification

**Not recommended** unless you're Netflix/Disney+

---

## 📦 NPM PACKAGES REQUIRED

```json
{
  "fluent-ffmpeg": "^2.1.2",
  "pdf-lib": "^1.17.1",
  "sharp": "^0.33.0",
  "@aws-sdk/client-mediaconvert": "^3.0"
}
```

---

## 💾 DATABASE CHANGES

```prisma
model WatermarkedContent {
  id            String   @id @default(uuid())
  originalId    String   @map("original_id") // Original content ID
  userId        String   @map("user_id")
  contentType   String   // 'video' | 'pdf' | 'image'
  watermarkType String   @map("watermark_type") // 'visible' | 'invisible'
  watermarkData String   @map("watermark_data") // Embedded data
  s3Path        String   @map("s3_path")
  createdAt     DateTime @default(now()) @map("created_at")
  expiresAt     DateTime? @map("expires_at")
  
  user User @relation(fields: [userId], references: [id])
  
  @@index([userId])
  @@index([originalId])
  @@map("watermarked_content")
}

model ContentAccess {
  id         String   @id @default(uuid())
  userId     String   @map("user_id")
  contentId  String   @map("content_id")
  ipAddress  String   @map("ip_address")
  userAgent  String   @map("user_agent")
  deviceId   String?  @map("device_id")
  accessedAt DateTime @default(now()) @map("accessed_at")
  
  @@index([userId])
  @@index([contentId])
  @@index([accessedAt])
  @@map("content_access")
}
```

---

## 🧪 TESTING REQUIREMENTS

- [ ] Watermark visible on all devices
- [ ] Watermark survives video compression
- [ ] PDF watermark can't be removed
- [ ] Performance impact acceptable
- [ ] Watermark extraction works
- [ ] No quality degradation
- [ ] Works with all video formats

---

## 💰 COST BREAKDOWN

### Option 1: Visible Watermarking
| Item | Cost |
|------|------|
| Development | $12,000-18,000 |
| FFmpeg setup | $1,000-2,000 |
| Testing | $2,000-3,000 |
| **TOTAL** | **$15,000-25,000** |

### Option 2: Invisible Watermarking
| Item | Cost |
|------|------|
| Development | $35,000-50,000 |
| Specialized tools | $10,000-15,000 |
| Testing | $5,000-10,000 |
| **TOTAL** | **$50,000-75,000** |

### Option 3: Full DRM
| Item | Cost |
|------|------|
| Development | $80,000-150,000 |
| DRM licenses | $20,000-50,000/year |
| Infrastructure | $10,000-30,000 |
| Testing | $10,000-20,000 |
| **TOTAL** | **$150,000-300,000** |

---

## 📅 IMPLEMENTATION TIMELINE

### Visible Watermarking (6-8 weeks)
- **Week 1-2**: FFmpeg setup, video watermarking
- **Week 3-4**: PDF and image watermarking
- **Week 5-6**: Frontend integration
- **Week 7-8**: Testing and deployment

### Invisible Watermarking (3-4 months)
- **Month 1**: Research and tool selection
- **Month 2**: Backend implementation
- **Month 3**: Testing and validation
- **Month 4**: Production deployment

### Full DRM (6-12 months)
- **Month 1-2**: Architecture and vendor selection
- **Month 3-6**: Implementation
- **Month 7-10**: Testing and certification
- **Month 11-12**: Rollout

---

## ⚠️ LEGAL CONSIDERATIONS

### Terms of Service Updates
```markdown
## Content Protection

All course materials are protected by digital watermarking technology.
Each user receives personalized copies containing their unique identifier.

**Prohibited Actions**:
- Sharing watermarked content with others
- Removing or obscuring watermarks
- Screen recording or capturing content
- Uploading content to file-sharing sites

**Consequences**:
- Account termination
- Legal action for copyright infringement
- Financial liability for damages
```

### DMCA Takedown Process
- Monitor for leaked content
- Issue DMCA takedowns
- Track leaks back to source user
- Take legal action if necessary

---

## ✅ SUCCESS CRITERIA

- [ ] All premium content watermarked
- [ ] Watermarks survive compression
- [ ] User experience not degraded
- [ ] Forensic tracking works
- [ ] Zero false positives
- [ ] Legal framework in place

---

## 📞 RECOMMENDATION

### For Most Use Cases: **DON'T BUILD THIS YET**

**Instead**:
1. ✅ Focus on MFA and encryption first
2. ✅ Build community and trust
3. ✅ Use pricing strategy to prevent piracy
4. ✅ Add value that can't be pirated (live sessions, community, certificates)
5. ⚠️ Only add watermarking if piracy becomes a real problem

### If You Must Build It: **Start with Visible Watermarking**
- Cost-effective ($15K-25K)
- Good deterrent
- Easy to implement
- Upgrade to invisible later if needed

---

**Document Status**: Part 3 of 10 Complete  
**Next**: IDS/IPS Monitoring Implementation Plan
