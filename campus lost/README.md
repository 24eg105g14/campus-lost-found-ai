# LostLink — Anurag University Lost & Found Platform

> **Tagline:** Find What Matters. Return What Belongs.  
> **Secondary Tagline:** Lost it? Link back to it.

LostLink is an intelligent, secure, university-only Lost & Found web application engineered specifically for **Anurag University**.

---

## 1. Problem Statement
Students at Anurag University currently depend on unstructured WhatsApp groups, security desks, or word-of-mouth when items are lost or found on campus.
- **Buried Messages:** Posts become buried under hundreds of chat messages in minutes.
- **Uncertainty:** Owners never know if someone already found their item.
- **Privacy Leakage:** Exposing finder phone numbers publicly creates privacy, spam, and safety issues.
- **Fraudulent Claimers:** Finders cannot verify if someone reaching out is the genuine owner.

---

## 2. Solution & Core Workflow
LostLink introduces a structured 5-step lifecycle:

```text
SEARCH → MATCH → VERIFY → CONNECT → RETURN
```

1. **SEARCH:** Students search found posts using brand, category, color, and location filters.
2. **MATCH:** The 6-field Smart Match Engine calculates item similarity (e.g. **92% HIGH MATCH**).
3. **VERIFY:** Claimants answer private ownership questions provided by the finder (e.g., "What wallpaper is on the watch?").
4. **CONNECT:** 1-on-1 private chat unlocks **ONLY** after ownership is verified.
5. **RETURN:** Finder and owner meet safely on campus; finder marks item as **DELIVERED** (**🎉 ITEM REUNITED!**).

---

## 3. Technology Stack

### Frontend
- **Framework:** React 19 + Vite
- **Styling:** Tailwind CSS (Light Mode Only, clean SaaS aesthetic, indigo/blue primary `#3b82f6`)
- **Icons:** Lucide React
- **Routing:** React Router DOM (v7)
- **HTTP Client:** Axios

### Backend
- **Runtime:** Node.js + Express.js
- **Database:** MongoDB Atlas / Local MongoDB + Mongoose
- **Authentication:** JWT (JSON Web Token) + bcryptjs password hashing
- **Image Storage:** Multer + Cloudinary SDK (with local memory fallback)
- **AI Abstraction:** `AIService` rule-engine fallback (100% functional without an AI key)

---

## 4. Institutional Authentication
Only Anurag University students can register. Registration validates the institutional email format using regex:
```javascript
/^\d{2}eg\d{3}[a-z]\d{2}@anurag\.edu\.in$/i
```
Example: `24eg112c54@anurag.edu.in`
- `24` → Batch / Admission Year
- `eg` → Engineering
- `112` → Department Code
- `c` → Section
- `54` → Roll Number

Email parameters are automatically parsed and saved to the user profile.

---

## 5. Database Schema & Models

- **User:** `name`, `email`, `batchYear`, `departmentCode`, `section`, `rollNumber`, `passwordHash`, `role` (`STUDENT`).
- **FoundItem:** `postedBy`, `imageUrl`, `imagePublicId`, `itemName`, `category`, `brand`, `color`, `description`, `locationFound`, `dateFound`, `status` (`PENDING`, `DELIVERED`), `verificationQuestions` (`[{ question, answer }]`), `deliveredAt`.
- **MissingRequest:** `userId`, `itemName`, `category`, `brand`, `color`, `description`, `lastKnownLocation`, `approximateLostDate`, `additionalPrivateDetails`, `status` (`ACTIVE`, `MATCHED`, `CLOSED`).
- **Match:** `foundItemId`, `missingRequestId`, `score`, `confidence` (`HIGH`, `POSSIBLE`, `LOW`), `reasons`.
- **ClaimRequest:** `foundItemId`, `claimantId`, `verificationScore`, `confidence`, `attempts`, `status` (`PENDING_VERIFICATION`, `MANUAL_REVIEW`, `VERIFIED`, `REJECTED`), `submittedAnswers`.
- **Conversation:** `foundItemId`, `claimRequestId`, `finderId`, `claimantId`.
- **Message:** `conversationId`, `senderId`, `text`, `read`.
- **Notification:** `userId`, `type`, `message`, `relatedItemId`, `read`.

---

## 6. Smart Matching Engine (`MatchingService`)
Scores item similarity from 0 to 100 based on weighted fields:
- **Category:** 20 points
- **Brand:** 15 points
- **Color:** 10 points
- **Location:** 15 points
- **Date Proximity:** 10 points
- **Name/Description:** 30 points

**Thresholds:**
- `80 – 100` → **HIGH MATCH**
- `60 – 79` → **POSSIBLE MATCH**
- `< 60` → **LOW MATCH**

---

## 7. Ownership Verification Architecture
Ownership verification uses two tiers:
1. **Automated Verification:** Claimant answers private verification questions. Score >= 80% automatically verifies ownership and unlocks chat.
2. **Manual Finder Review:** Score 60–79% forwards the claim to the finder for manual approval or rejection.

> **Security Rule:** Expected secret answers are NEVER exposed in public API responses.

---

## 8. Environment Variables (`.env`)

Create `backend/.env`:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/lostlink
JWT_SECRET=lostlink_anurag_secret_key_2026
CLIENT_URL=http://localhost:5173

# Cloudinary Setup (Optional - placeholder fallback included)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# AI Setup (Optional - rule engine fallback included)
AI_PROVIDER=
AI_API_KEY=

COLLEGE_EMAIL_DOMAIN=anurag.edu.in
DELIVERED_RETENTION_DAYS=7
```

---

## 9. Quick Start Commands

### Step 1: Install Dependencies
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### Step 2: Seed Demo Data
```bash
cd backend
npm run seed
```

### Step 3: Run Backend Server
```bash
cd backend
npm run dev
# Running at http://localhost:5000
```

### Step 4: Run Frontend Client
```bash
cd frontend
npm run dev
# Running at http://localhost:5173
```

---

## 10. Demo Credentials & Hackathon Demo Procedure

### Demo Accounts:
- **User A (Finder):** `24eg112c54@anurag.edu.in` / Password: `password123`
- **User B (Owner):** `24eg112c55@anurag.edu.in` / Password: `password123`

### Exact Demo Flow:
1. **User A (Finder):** Log in -> Report Found Item ("Black Noise Smartwatch", Category: Smartwatch, Brand: Noise, Color: Black, Location: Central Library, Secret Question: "What wallpaper appears on the watch?" / Answer: "Batman"). Item status set to `PENDING`.
2. **User B (Owner):** Log in -> Click "I Lost Something" -> Search "Black Noise Smartwatch" / Smartwatch / Noise / Black / Library.
3. **Smart Match Output:** LostLink displays **92% HIGH MATCH** with matching reasons ("Same category", "Same brand", "Same color", "Similar location").
4. **Verification & Claim:** User B clicks "Request to Claim" -> Answers "Batman". System confirms 100% verification score and unlocks private chat.
5. **Private Chat:** User B sends meeting message -> User A receives message and replies.
6. **Delivery:** User A clicks "Mark Item as Delivered" -> Success modal **🎉 ITEM REUNITED!** displays -> Item status updates to `DELIVERED` and counter increments on Dashboard.
