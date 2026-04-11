#!/usr/bin/env node
/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  ft_transcendence — Seed Script  (complete flow)
 *
 *  FLOW:
 *    Step 1 : Create N users (register + login)
 *             ★ User ID extracted directly from JWT — 100% correct
 *    Step 2 : Send friend requests (ring: each user → next 2)
 *    Step 3 : Accept all pending friend requests (small delay simulated)
 *    Step 4 : Every user creates 1 post  (with link or image where relevant)
 *    Step 5 : ⏸  PAUSE — you manually approve posts in the admin panel
 *             then type  yes + Enter to continue
 *    Step 6 : Comments on every approved post
 *    Step 7 : Reactions on every approved post
 *    Step 8 : Private chat conversations between the friends we just made
 *
 *  Usage:
 *    node seed.js [--users 10] [--base-url https://localhost]
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

const https    = require('https');
const http     = require('http');
const readline = require('readline');
const { Buffer } = require('buffer');

// ─── CLI ─────────────────────────────────────────────────────────────────────
const args   = process.argv.slice(2);
const getArg = (flag, def) => { const i = args.indexOf(flag); return i !== -1 && args[i+1] ? args[i+1] : def; };

const BASE_URL  = getArg('--base-url', 'https://localhost');
const NUM_USERS = parseInt(getArg('--users', '10'), 10);

// ─── HTTP helper ──────────────────────────────────────────────────────────────
const tlsAgent = new https.Agent({ rejectUnauthorized: false });

function request(method, path, body = null, cookies = '') {
  return new Promise((resolve, reject) => {
    const url     = new URL(path, BASE_URL);
    const isHttps = url.protocol === 'https:';
    const data    = body ? JSON.stringify(body) : null;

    const req = (isHttps ? https : http).request({
      hostname : url.hostname,
      port     : url.port || (isHttps ? 443 : 80),
      path     : url.pathname + url.search,
      method,
      agent    : isHttps ? tlsAgent : undefined,
      headers  : {
        'Content-Type': 'application/json',
        ...(data    && { 'Content-Length': Buffer.byteLength(data) }),
        ...(cookies && { Cookie: cookies }),
      },
    }, res => {
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => {
        const cookieStr = (res.headers['set-cookie'] || []).map(c => c.split(';')[0]).join('; ');
        let parsed; try { parsed = JSON.parse(raw); } catch { parsed = raw; }
        resolve({ status: res.statusCode, data: parsed, cookie: cookieStr });
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

// ─── Multipart/form-data POST (for /api/posts/ which uses FileInterceptor) ────
function requestMultipart(path, fields, fileField, fileBuffer, filename, mimeType, cookies = '') {
  return new Promise((resolve, reject) => {
    const url      = new URL(path, BASE_URL);
    const isHttps  = url.protocol === 'https:';
    const boundary = `----FormBoundary${Date.now().toString(16)}`;

    const parts = [];

    // Text fields
    for (const [name, value] of Object.entries(fields)) {
      if (value === undefined || value === null) continue;
      parts.push(
        `--${boundary}\r\n` +
        `Content-Disposition: form-data; name="${name}"\r\n\r\n` +
        `${value}\r\n`
      );
    }

    // Optional file
    if (fileBuffer && fileField) {
      parts.push(
        `--${boundary}\r\n` +
        `Content-Disposition: form-data; name="${fileField}"; filename="${filename}"\r\n` +
        `Content-Type: ${mimeType}\r\n\r\n`
      );
    }

    const closing = `\r\n--${boundary}--\r\n`;

    // Build the final buffer
    const textPart   = Buffer.from(parts.join(''), 'utf8');
    const closingBuf = Buffer.from(closing, 'utf8');
    const body       = fileBuffer
      ? Buffer.concat([textPart, fileBuffer, closingBuf])
      : Buffer.concat([textPart, closingBuf]);

    const req = (isHttps ? https : http).request({
      hostname : url.hostname,
      port     : url.port || (isHttps ? 443 : 80),
      path     : url.pathname + url.search,
      method   : 'POST',
      agent    : isHttps ? tlsAgent : undefined,
      headers  : {
        'Content-Type'  : `multipart/form-data; boundary=${boundary}`,
        'Content-Length': body.length,
        ...(cookies && { Cookie: cookies }),
      },
    }, res => {
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => {
        let parsed; try { parsed = JSON.parse(raw); } catch { parsed = raw; }
        resolve({ status: res.statusCode, data: parsed });
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ─── Minimal valid 1×1 white JPEG (no external files / downloads needed) ──────
// This is a hand-crafted JPEG that passes the backend signature check (0xFF 0xD8 0xFF)
const TINY_JPEG = Buffer.from(
  'ffd8ffe000104a46494600010100000100010000ffdb004300080606070605080707070909080a0c140d0c0b0b0c1912130f141d1a1f1e1d1a1c1c20242e2720222c231c1c2837292c30313434341f27393d38323c2e333432ffdb0043010909090c0b0c180d0d1832211c213232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232ffc00011080001000103012200021101031101ffc4001f0000010501010101010100000000000000000102030405060708090a0bffc400b5100002010303020403050504040000017d01020300041105122131410613516107227114328191a1082342b1c11552d1f02433627282090a161718191a25262728292a3435363738393a434445464748494a535455565758595a636465666768696a737475767778797a838485868788898a929394959697989990a0b0c0d0e0f1a1b1c1d1e1f2a2b2c2d2e2f3a3b3c3d3e3f4a4b4c4d4e4f5a5b5c5d5e5f6a6b6c6d6e6f7a7b7c7d7e7f8a8b8c8d8e8f9a9b9c9d9e9fa2a3a4a5a6a7a8a9aab2b3b4b5b6b7b8b9bac2c3c4c5c6c7c8c9cad2d3d4d5d6d7d8d9dae1e2e3e4e5e6e7e8e9eaf1f2f3f4f5f6f7f8f9faffc4001f0100030101010101010101010000000000000102030405060708090a0bffc400b5110002010204040304070504040001027700010203110405213106124151076171132232810814422391a1b1c109233352f0156272d10a162434e125f11718191a262728292a35363738393a434445464748494a535455565758595a636465666768696a737475767778797a82838485868788898a92939495969798999aa2a3a4a5a6a7a8a9aab2b3b4b5b6b7b8b9bac2c3c4c5c6c7c8c9cad2d3d4d5d6d7d8d9dae2e3e4e5e6e7e8e9eaf2f3f4f5f6f7f8f9faffda000c03010002110311003f00f4a28a2803fffd9',
  'hex'
);

// ─── JWT decode (no library needed — payload is just base64) ─────────────────
function jwtDecode(cookieStr) {
  try {
    // cookieStr looks like "auth_token=eyJhbGc..."
    const token   = cookieStr.replace(/.*auth_token=/, '').split(';')[0].trim();
    const payload = Buffer.from(token.split('.')[1], 'base64').toString('utf-8');
    return JSON.parse(payload);   // { id, email, role, username, iat, exp }
  } catch { return {}; }
}

// ─── Utilities ────────────────────────────────────────────────────────────────
const sleep = ms => new Promise(r => setTimeout(r, ms));
const rand  = arr => arr[Math.floor(Math.random() * arr.length)];

const G  = t => `\x1b[32m${t}\x1b[0m`;
const Y  = t => `\x1b[33m${t}\x1b[0m`;
const R  = t => `\x1b[31m${t}\x1b[0m`;
const C  = t => `\x1b[36m${t}\x1b[0m`;
const B  = t => `\x1b[1m${t}\x1b[0m`;
const DM = t => `\x1b[2m${t}\x1b[0m`;

function hdr(title) { const l = '═'.repeat(52); console.log(`\n${B(l)}\n${B('  '+title)}\n${B(l)}`); }
const ok   = m => console.log(`  ${G('✅')} ${m}`);
const warn = m => console.log(`  ${Y('⚠️ ')} ${m}`);
const fail = m => console.log(`  ${R('❌')} ${m}`);
const info = m => console.log(`  ${C('ℹ️ ')} ${m}`);

function askUser(prompt) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(res => rl.question(prompt, a => { rl.close(); res(a.trim()); }));
}

async function spinner(ms, label) {
  const f = ['⠋','⠙','⠹','⠸','⠼','⠴','⠦','⠧','⠇','⠏'];
  const n = Math.ceil(ms / 80);
  for (let i = 0; i < n; i++) {
    process.stdout.write(`\r  ${C(f[i%f.length])}  ${DM(label)} `);
    await sleep(80);
  }
  process.stdout.write(`\r  ${G('✓')}  ${label}             \n`);
}

// ─── Fake data ────────────────────────────────────────────────────────────────
// Short names so  username = name+index  stays ≤ 10 chars
const NAMES = ['ali','bob','cara','dan','eve','fay','gil','hana','ida','jak',
               'kim','leo','mia','ned','ola','pam','quinn','ria','sam','tia'];

// Password: 6-10 chars, uppercase + lowercase + special char
const makePass = i => `Ax@Pass${i % 10}`;

const POST_TEMPLATES = [
  // HELP — no link / no image
  { type:'HELP',     title:'How do I handle JWT refresh tokens?',          content:'Struggling to implement a solid refresh strategy. Tips or resources?' },
  { type:'HELP',     title:'Best way to structure a NestJS monorepo?',     content:'Large app incoming. Nx or plain NestJS monorepo? Pros/cons welcome.' },
  { type:'HELP',     title:'Prisma relations are confusing me',            content:'Can someone explain @relation vs @@index? Getting schema errors daily.' },
  { type:'HELP',     title:'WebSocket vs SSE for real-time notifications',content:'Which is better for notifs in a NestJS app? Pros and cons please.' },
  { type:'HELP',     title:'Docker networking explained',                 content:'Bridge vs host vs overlay — when do you actually use each?' },
  { type:'HELP',     title:'Difference between async/await and Promises?',content:'I know they are related but when should I use one vs the other?' },
  { type:'HELP',     title:'How to pass env vars securely to Docker?',    content:'Using .env files feels unsafe. What are the best practices here?' },
  // RESOURCE — include a relevant contentUrl (link)
  { type:'RESOURCE', title:'10 VS Code extensions every dev should have', content:'My curated list of must-haves that massively improved my workflow.',      contentUrl:'https://code.visualstudio.com/docs/editor/extension-marketplace' },
  { type:'RESOURCE', title:'Free DevOps learning path 2025',              content:'Linux→Docker→K8s — full free path compiled for the community.',          contentUrl:'https://roadmap.sh/devops' },
  { type:'RESOURCE', title:'Docker Compose cheatsheet',                   content:'Handy reference for the most common Docker Compose patterns. Bookmark!', contentUrl:'https://docs.docker.com/compose/' },
  { type:'RESOURCE', title:'PostgreSQL performance tips',                 content:'Indexing, EXPLAIN ANALYZE, query planning — everything you need.',       contentUrl:'https://www.postgresql.org/docs/current/performance-tips.html' },
  { type:'RESOURCE', title:'Git aliases that will change your life',      content:'These 10 git aliases save me 20 minutes every single day.',             contentUrl:'https://git-scm.com/book/en/v2/Git-Basics-Git-Aliases' },
  { type:'RESOURCE', title:'Clean Code principles with TypeScript',       content:'SOLID, DRY, KISS — with real TypeScript snippets. Very practical.',     contentUrl:'https://github.com/labs42io/clean-code-typescript' },
  { type:'RESOURCE', title:'Ultimate Linux command cheatsheet',           content:'awk, sed, grep, xargs — mastering these changed everything for me.',    contentUrl:'https://ss64.com/bash/' },
  // MEME — uploaded image (tiny embedded JPEG, valid file signature)
  { type:'MEME',     title:'When the bug disappears after adding a log',  content:'Heisenbug strikes again 😂  We all know this pain.',           image:true },
  { type:'MEME',     title:`Me: I'll just fix this one thing`,            content:'3 hours later, 12 files changed… perfectly fine.',             image:true },
  { type:'MEME',     title:'Senior dev on a Friday afternoon PR review',  content:'"This PR is fine" — said no senior dev ever before a weekend.', image:true },
  { type:'MEME',     title:'CSS centering in 2025',                       content:'Still googling "how to center a div" after 5 years. No shame.', image:true },
  { type:'MEME',     title:'Works on my machine™',                        content:'Introducing the new deployment strategy: ship your laptop.',    image:true },
  { type:'MEME',     title:'Documentation? What documentation?',          content:'The code IS the documentation. — every developer, ever.',      image:true },
];

const COMMENTS = [
  'Great post! This really helped me.',
  'Thanks for sharing — bookmarked!',
  'Had the same issue last week. Check your middleware order!',
  'This is a common pitfall. Always worth documenting.',
  'Lol I literally did this yesterday 😂',
  'Pure gold. Sending to my whole team right now.',
  'Could you elaborate a bit more on the second point?',
  'Been looking for exactly this. Thank you!',
  'Interesting. I usually go the other way but might try this.',
  'The Heisenbug is so real, feel you.',
  "Don't forget to handle edge cases too!",
  'Nice write-up. Would love a follow-up on advanced patterns.',
  'This saved me hours of debugging. Seriously, thank you.',
  'Pro tip: also check your environment variables when debugging this.',
  'This is exactly what I needed today. Perfect timing.',
  'Shared this in our Slack — everyone loved it.',
  'Just tried it! Works perfectly 🙌',
  'Nice and concise explanation!',
  'Finally someone wrote this up properly.',
  'This should be pinned at the top.',
];

const MESSAGES = [
  "Hey! How's it going?",
  'Did you see that latest post? Pretty interesting.',
  "I'm stuck on a bug — any chance you can take a look?",
  "Sure! Send me the code and I'll check.",
  'Have you tried the async/await approach here?',
  'Yeah, it worked! Thanks a lot 🙏',
  'No problem! Let me know if you need anything else.',
  "What's your take on the Docker setup?",
  'Looks solid. Maybe add a healthcheck to the DB container?',
  "Good idea, I'll open a PR for that.",
  "Cool, I'll review it tomorrow morning.",
  'Sounds good! Talk soon 👋',
  'Can you review my PR when you get a chance?',
  'Already on it! Left some comments.',
  'Thanks, merging now.',
  'Are you joining the call later?',
  'Yeah, 5 minutes.',
  'Perfect, see you there.',
];

const REACTION_TYPES = ['LIKE','LOVE','HAHA','WOW','SAD','ANGRY'];

// ─── MAIN ────────────────────────────────────────────────────────────────────
async function main() {
  console.clear();
  console.log(B('\n  🌱  ft_transcendence — Seed Script\n'));
  console.log(`  ${C('Base URL :')} ${BASE_URL}`);
  console.log(`  ${C('Users    :')} ${NUM_USERS}`);

  // ════════════════════════════════════════════════════════════════════════════
  //  STEP 1 — Register & login users, get IDs from JWT
  // ════════════════════════════════════════════════════════════════════════════
  hdr('Step 1 — Creating users');

  const users = [];  // { username, email, password, cookie, id }

  for (let i = 0; i < NUM_USERS; i++) {
    const username = `${NAMES[i % NAMES.length]}${i}`;
    const email    = `seed_${username}@devmail.io`;
    const password = makePass(i);

    // Register (409 = already exists, that is fine)
    const reg = await request('POST', '/auth/register', { email, password, username });
    if (![200, 201, 409].includes(reg.status)) {
      fail(`Register ${username}: ${JSON.stringify(reg.data)}`);
      continue;
    }
    if (reg.status === 409) warn(`${Y(username)} already exists — logging in`);

    // Login → cookie → decode JWT → get real ID & real username
    const login = await request('POST', '/auth/login', { email, password });
    if (![200, 201].includes(login.status)) {
      fail(`Login ${username}: ${JSON.stringify(login.data)}`);
      continue;
    }

    const jwt = jwtDecode(login.cookie);
    if (!jwt.id) { fail(`Could not decode JWT for ${username}`); continue; }

    const realUsername = jwt.username || username;
    users.push({ username: realUsername, email, password, cookie: login.cookie, id: jwt.id });
    ok(`${G(realUsername)} (ID ${jwt.id}) ← ID from JWT ✓`);
    await sleep(40);
  }

  if (users.length === 0) { fail('No users — aborting.'); process.exit(1); }
  info(`${G(users.length)} users ready with correct IDs`);

  // ════════════════════════════════════════════════════════════════════════════
  //  STEP 2 — Send friend requests (ring: each user → next 2)
  // ════════════════════════════════════════════════════════════════════════════
  hdr('Step 2 — Sending friend requests');

  let reqSent = 0;
  const sentPairs = new Set();  // avoid duplicates

  for (let i = 0; i < users.length; i++) {
    for (let d = 1; d <= 2; d++) {
      const sender   = users[i];
      const receiver = users[(i + d) % users.length];
      const key      = [sender.id, receiver.id].sort().join('-');
      if (sentPairs.has(key)) continue;
      sentPairs.add(key);

      const res = await request('POST', `/api/friends/request/${receiver.id}`, null, sender.cookie);

      if ([200, 201].includes(res.status)) {
        ok(`${G(sender.username)} (${sender.id}) → ${G(receiver.username)} (${receiver.id})`);
        reqSent++;
      } else if (res.status === 409) {
        // Already friends or already pending — count & move on
        warn(`${sender.username} → ${receiver.username}: ${res.data?.message || 'already exists'}`);
        reqSent++;
      } else {
        fail(`${sender.username} → ${receiver.username}: [${res.status}] ${JSON.stringify(res.data)}`);
      }
      await sleep(40);
    }
  }
  info(`${G(reqSent)} friend request operations done`);

  // ════════════════════════════════════════════════════════════════════════════
  //  STEP 3 — Accept all pending requests (with a simulated delay)
  // ════════════════════════════════════════════════════════════════════════════
  hdr('Step 3 — Accepting friend requests');
  await spinner(2000, 'Simulating a short delay before accepting…');

  let accepted = 0;

  for (const receiver of users) {
    const pendRes = await request('GET', '/api/friends/pending', null, receiver.cookie);
    const pending = Array.isArray(pendRes.data) ? pendRes.data : [];

    for (const req of pending) {
      const senderId = req.senderId;
      if (!senderId) continue;

      const acceptRes = await request('POST', `/api/friends/accept/${senderId}`, null, receiver.cookie);
      if ([200, 201].includes(acceptRes.status)) {
        const su = users.find(u => u.id === senderId);
        ok(`${G(receiver.username)} accepted from ${G(su?.username ?? senderId)}`);
        accepted++;
      } else {
        warn(`Accept ${receiver.username} ← ${senderId}: ${JSON.stringify(acceptRes.data)}`);
      }
      await sleep(40);
    }
  }

  info(`${G(accepted)} friend requests accepted`);

  // Build the list of friend pairs we confirmed (for chat step later)
  // We use the ring pairs we tried + assume they are now accepted
  const friendPairs = [];
  const seenFP = new Set();
  for (let i = 0; i < users.length; i++) {
    for (let d = 1; d <= 2; d++) {
      const u1  = users[i];
      const u2  = users[(i + d) % users.length];
      const key = [u1.id, u2.id].sort().join('-');
      if (!seenFP.has(key)) { seenFP.add(key); friendPairs.push({ u1, u2 }); }
    }
  }

  // ════════════════════════════════════════════════════════════════════════════
  //  STEP 4 — Each user creates 1 post
  // ════════════════════════════════════════════════════════════════════════════
  hdr('Step 4 — Creating posts');

  const createdPosts = [];

  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    const tpl  = POST_TEMPLATES[i % POST_TEMPLATES.length];

    // The /api/posts/ endpoint uses multipart/form-data (FileInterceptor)
    const fields = { type: tpl.type, title: tpl.title, content: tpl.content };
    if (tpl.contentUrl) fields.contentUrl = tpl.contentUrl;

    let res;
    if (tpl.image) {
      // MEME: upload the embedded tiny JPEG as the 'image' field
      res = await requestMultipart(
        '/api/posts/', fields,
        'image', TINY_JPEG, 'meme.jpg', 'image/jpeg',
        user.cookie
      );
    } else {
      // HELP / RESOURCE (with optional contentUrl) — no file upload
      res = await requestMultipart('/api/posts/', fields, null, null, null, null, user.cookie);
    }

    if ([200, 201].includes(res.status)) {
      const extra = tpl.image ? ' 🖼️' : tpl.contentUrl ? ` 🔗 ${tpl.contentUrl.slice(0, 40)}` : '';
      createdPosts.push({ id: res.data?.id, userId: user.id });
      ok(`${G(user.username)} → "${tpl.title.slice(0, 50)}"${extra}`);
    } else {
      fail(`Post by ${user.username}: [${res.status}] ${JSON.stringify(res.data)}`);
    }
    await sleep(60);
  }
  info(`${G(createdPosts.length)} posts created (status: PENDING)`);

  // ════════════════════════════════════════════════════════════════════════════
  //  STEP 5 — PAUSE: you approve posts in the admin panel
  // ════════════════════════════════════════════════════════════════════════════
  console.log(`
${B('═'.repeat(52))}
${B('  ⏸  PAUSED — Waiting for admin approval')}
${B('═'.repeat(52))}

  ${Y('Please go to the admin panel and approve all PENDING posts.')}

  ${DM('Log in as ADMIN → admin posts panel → set each post to APPROVED')}

  ${C('When done, type')}  ${B('yes')}  ${C('+ Enter to continue')}
`);

  let answer = '';
  while (answer.toLowerCase() !== 'yes') {
    answer = await askUser(`  ${C('→ ')} `);
    if (answer.toLowerCase() !== 'yes') warn('Not yet! Approve the posts first, then type yes.');
  }
  console.log(`  ${G('✅ Continuing…')}\n`);
  await spinner(1000, 'Verifying approved posts…');

  // Verify which posts are now APPROVED
  const approvedPostIds = new Set();
  for (const post of createdPosts) {
    if (!post.id) continue;
    const r = await request('GET', `/api/posts/detail/${post.id}`, null, users[0].cookie);
    if (r.data?.status === 'APPROVED') approvedPostIds.add(post.id);
    await sleep(30);
  }
  const approvedPosts = createdPosts.filter(p => approvedPostIds.has(p.id));
  info(`${G(approvedPosts.length)} / ${createdPosts.length} posts are APPROVED`);

  if (approvedPosts.length === 0) {
    warn('No posts approved. Skipping comments & reactions.');
  }

  // ════════════════════════════════════════════════════════════════════════════
  //  STEP 6 — Comments on approved posts
  // ════════════════════════════════════════════════════════════════════════════
  if (approvedPosts.length > 0) {
    hdr('Step 6 — Adding comments');
    let total = 0;

    for (const post of approvedPosts) {
      const commenters = users
        .filter(u => u.id !== post.userId)
        .sort(() => Math.random() - 0.5)
        .slice(0, rand([2, 3, 4]));

      for (const c of commenters) {
        const res = await request('POST', '/api/comments/', {
          postId: post.id, content: rand(COMMENTS),
        }, c.cookie);
        if ([200, 201].includes(res.status)) total++;
        else warn(`Comment by ${c.username}: ${JSON.stringify(res.data)}`);
        await sleep(35);
      }
    }
    ok(`${G(total)} comments added`);
  }

  // ════════════════════════════════════════════════════════════════════════════
  //  STEP 7 — Reactions on approved posts
  // ════════════════════════════════════════════════════════════════════════════
  if (approvedPosts.length > 0) {
    hdr('Step 7 — Adding reactions');
    let total = 0;

    for (const post of approvedPosts) {
      for (const reactor of users.filter(u => u.id !== post.userId)) {
        if (Math.random() > 0.65) continue;  // ~65% chance
        const res = await request('POST', '/api/reactions/toggle', {
          postId: post.id, type: rand(REACTION_TYPES),
        }, reactor.cookie);
        if ([200, 201].includes(res.status)) total++;
        await sleep(25);
      }
    }
    ok(`${G(total)} reactions added`);
  }

  // ════════════════════════════════════════════════════════════════════════════
  //  STEP 8 — Private chats between friends
  // ════════════════════════════════════════════════════════════════════════════
  hdr('Step 8 — Private chats between friends');
  let totalConvs = 0, totalMsgs = 0;

  for (const { u1, u2 } of friendPairs) {
    const convRes = await request('POST', '/api/chat/conversation/find-or-create', {
      userId1: u1.id, userId2: u2.id,
    }, u1.cookie);

    if (![200, 201].includes(convRes.status)) {
      warn(`Conv ${u1.username} ↔ ${u2.username}: ${JSON.stringify(convRes.data)}`);
      continue;
    }

    const convId     = convRes.data?.id;
    const msgPool    = [...MESSAGES].sort(() => Math.random() - 0.5).slice(0, rand([3, 4, 5, 6]));
    const both       = [u1, u2];
    let   turn       = 0;
    let   convMsgs   = 0;

    for (const content of msgPool) {
      const r = await request('POST', '/api/chat/new-message', {
        conversationId: convId, content, type: 'TEXT',
      }, both[turn % 2].cookie);
      if ([200, 201].includes(r.status)) { totalMsgs++; convMsgs++; }
      turn++;
      await sleep(25);
    }

    ok(`${G(u1.username)} ↔ ${G(u2.username)}  ${DM(`(${convMsgs} messages)`)}`);
    totalConvs++;
  }
  info(`${G(totalConvs)} conversations, ${G(totalMsgs)} messages`);

  // ════════════════════════════════════════════════════════════════════════════
  //  DONE
  // ════════════════════════════════════════════════════════════════════════════
  console.log(`
${B('═'.repeat(52))}
${B('  🎉  Seed Complete!')}
${B('═'.repeat(52))}

  ${C('Users         :')} ${users.length}
  ${C('Friendships   :')} ${accepted}
  ${C('Posts created :')} ${createdPosts.length}  ${DM(`(${approvedPosts.length} approved)`)}
  ${C('Conversations :')} ${totalConvs}
  ${C('Messages      :')} ${totalMsgs}

${B('  Login credentials:')}
`);
  const w = Math.max(...users.map(u => u.username.length));
  users.forEach((u, i) => console.log(
    `    ${C(u.username.padEnd(w+2))}` +
    `${u.email.padEnd(35)}  pw: ${B(makePass(i))}`
  ));
  console.log('');
}

main().catch(err => { console.error(R('\nFatal:'), err.message || err); process.exit(1); });
