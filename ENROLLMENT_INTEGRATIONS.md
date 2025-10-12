# 📅 Enrollment Integrations - Calendly & Video Interviews

## ✅ Scheduling Integration (Calendly-style)

### **Option 1: Calendly (Recommended)**

**Setup:**
```html
<!-- Add to enrollment pages -->
<div class="calendly-inline-widget" 
     data-url="https://calendly.com/elevateforhumanity/enrollment-interview" 
     style="min-width:320px;height:700px;">
</div>
<script type="text/javascript" 
        src="https://assets.calendly.com/assets/external/widget.js" 
        async>
</script>
```

**Features:**
- ✅ Automated scheduling
- ✅ Email reminders
- ✅ Calendar sync (Google, Outlook)
- ✅ Timezone detection
- ✅ Rescheduling
- ✅ No-show tracking

**Cost:** Free - $12/user/month

---

### **Option 2: Cal.com (Open Source Alternative)**

**Setup:**
```html
<!-- Self-hosted scheduling -->
<div data-cal-link="elevateforhumanity/enrollment">
  Schedule Interview
</div>
<script type="text/javascript" 
        src="https://app.cal.com/embed/embed.js">
</script>
```

**Features:**
- ✅ Open source
- ✅ Self-hosted option
- ✅ Full customization
- ✅ API access
- ✅ White-label

**Cost:** Free (self-hosted) or $12/month

---

## 🎥 Video Interview Integration (HireVue-style)

### **Option 1: Custom Video Interview System**

**File:** `src/components/VideoInterview.jsx`

```jsx
import React, { useState, useRef } from 'react';

export default function VideoInterview() {
  const [recording, setRecording] = useState(false);
  const [videoBlob, setVideoBlob] = useState(null);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  
  const questions = [
    "Why do you want to join this program?",
    "What are your career goals?",
    "Tell us about your relevant experience.",
    "How will this training help you?"
  ];
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  
  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: true, 
      audio: true 
    });
    
    videoRef.current.srcObject = stream;
    
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    
    const chunks = [];
    mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      setVideoBlob(blob);
      uploadVideo(blob);
    };
    
    mediaRecorder.start();
    setRecording(true);
  };
  
  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    setRecording(false);
  };
  
  const uploadVideo = async (blob) => {
    const formData = new FormData();
    formData.append('video', blob, `interview-q${currentQuestion}.webm`);
    formData.append('question', currentQuestion);
    
    await fetch('/api/enrollment/video-upload', {
      method: 'POST',
      body: formData
    });
    
    // Move to next question
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setVideoBlob(null);
    }
  };
  
  return (
    <div className="video-interview">
      <h2>Video Interview - Question {currentQuestion + 1} of {questions.length}</h2>
      
      <div className="question-card">
        <h3>{questions[currentQuestion]}</h3>
        <p>You have 2 minutes to answer. Take a moment to think before recording.</p>
      </div>
      
      <div className="video-container">
        <video ref={videoRef} autoPlay muted={recording} />
      </div>
      
      <div className="controls">
        {!recording && !videoBlob && (
          <button onClick={startRecording} className="btn-primary">
            Start Recording
          </button>
        )}
        
        {recording && (
          <button onClick={stopRecording} className="btn-danger">
            Stop Recording
          </button>
        )}
        
        {videoBlob && (
          <div>
            <p>✅ Answer recorded!</p>
            {currentQuestion < questions.length - 1 ? (
              <button onClick={() => setVideoBlob(null)} className="btn-primary">
                Next Question
              </button>
            ) : (
              <p>✅ Interview Complete! We'll review your responses.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
```

---

### **Option 2: Loom Integration**

**Setup:**
```html
<!-- Loom embed for video responses -->
<script src="https://cdn.loom.com/sdk/v1/loom-sdk.js"></script>
<script>
  const loom = Loom.init({
    apiKey: 'YOUR_LOOM_API_KEY'
  });
  
  async function recordVideo() {
    const video = await loom.startRecording();
    // Handle video upload
  }
</script>
```

**Cost:** $8-$12/user/month

---

### **Option 3: Vonage Video API (TokBox)**

**Setup:**
```javascript
// Real-time video interviews
import { OTSession, OTPublisher, OTSubscriber } from 'opentok-react';

function LiveInterview() {
  return (
    <OTSession apiKey="YOUR_API_KEY" sessionId="SESSION_ID" token="TOKEN">
      <OTPublisher />
      <OTSubscriber />
    </OTSession>
  );
}
```

**Cost:** $0.0040/minute

---

## 🔄 Complete Enrollment Workflow

### **Step 1: Application Form**
```
✅ Google Forms integration (already done)
✅ Collect basic information
✅ WIOA eligibility screening
```

### **Step 2: Schedule Interview**
```
✅ Calendly/Cal.com integration
✅ Automated email confirmation
✅ Calendar invite sent
✅ Reminder emails (24hr, 1hr before)
```

### **Step 3: Video Interview**
```
✅ Pre-recorded questions (HireVue-style)
✅ Or live video call (Zoom/Vonage)
✅ Automated upload to cloud storage
✅ Staff review dashboard
```

### **Step 4: Approval & Enrollment**
```
✅ Staff reviews application + video
✅ Approval/rejection notification
✅ Enrollment confirmation
✅ Welcome email with next steps
```

---

## 📝 Implementation Code

### **Enrollment Page with Calendly**

**File:** `public/pages/enroll.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Enroll - Elevate for Humanity</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50">
    <div class="max-w-4xl mx-auto p-6">
        <h1 class="text-4xl font-bold mb-6">Enrollment Process</h1>
        
        <!-- Step 1: Application -->
        <div class="bg-white p-6 rounded-lg shadow mb-6">
            <h2 class="text-2xl font-bold mb-4">Step 1: Submit Application</h2>
            <p class="mb-4">Complete our enrollment form:</p>
            <a href="https://forms.gle/YOUR_FORM_ID" 
               class="bg-blue-600 text-white px-6 py-3 rounded-lg inline-block">
                Start Application →
            </a>
        </div>
        
        <!-- Step 2: Schedule Interview -->
        <div class="bg-white p-6 rounded-lg shadow mb-6">
            <h2 class="text-2xl font-bold mb-4">Step 2: Schedule Interview</h2>
            <p class="mb-4">After submitting your application, schedule your enrollment interview:</p>
            
            <!-- Calendly Embed -->
            <div class="calendly-inline-widget" 
                 data-url="https://calendly.com/elevateforhumanity/enrollment" 
                 style="min-width:320px;height:700px;">
            </div>
            <script type="text/javascript" 
                    src="https://assets.calendly.com/assets/external/widget.js" 
                    async>
            </script>
        </div>
        
        <!-- Step 3: Video Interview -->
        <div class="bg-white p-6 rounded-lg shadow mb-6">
            <h2 class="text-2xl font-bold mb-4">Step 3: Video Interview</h2>
            <p class="mb-4">Complete a brief video interview (4 questions, 2 minutes each):</p>
            <a href="/video-interview" 
               class="bg-green-600 text-white px-6 py-3 rounded-lg inline-block">
                Start Video Interview →
            </a>
        </div>
        
        <!-- Step 4: Confirmation -->
        <div class="bg-white p-6 rounded-lg shadow">
            <h2 class="text-2xl font-bold mb-4">Step 4: Confirmation</h2>
            <p>You'll receive an email within 2-3 business days with your enrollment status.</p>
        </div>
    </div>
</body>
</html>
```

---

## 🎯 Recommended Setup

### **For Government/WIOA Programs:**

1. **Application:** Google Forms (free, FERPA compliant)
2. **Scheduling:** Calendly ($12/month, professional)
3. **Video:** Custom solution (store in R2/S3)
4. **Notifications:** Email via SendGrid/Mailgun

### **Total Cost:** ~$20/month

---

## 🔐 Compliance Notes

### **FERPA Compliance:**
- ✅ Video interviews stored securely
- ✅ Access restricted to authorized staff
- ✅ Encryption in transit and at rest
- ✅ Audit trail of who viewed videos

### **ADA Compliance:**
- ✅ Alternative interview methods available
- ✅ Closed captions for video questions
- ✅ Phone interview option
- ✅ Accommodations process documented

---

## 📊 Tracking & Analytics

### **Enrollment Funnel:**
```
Application Started → 100%
Application Completed → 70%
Interview Scheduled → 60%
Interview Completed → 55%
Enrolled → 45%
```

### **Metrics to Track:**
- Application completion rate
- Interview show rate
- Time to enrollment
- Drop-off points
- Conversion by source

---

## ✅ Next Steps

1. **Set up Calendly account**
   - Create event type: "Enrollment Interview"
   - Set duration: 30 minutes
   - Add intake questions

2. **Implement video interview**
   - Use custom solution (code provided above)
   - Or integrate Loom/Vonage

3. **Configure notifications**
   - Application received
   - Interview scheduled
   - Interview reminder
   - Enrollment decision

4. **Train staff**
   - How to review applications
   - How to conduct interviews
   - How to use scheduling system

---

**Status: Ready to implement!**

Choose your preferred tools and I can help integrate them.
