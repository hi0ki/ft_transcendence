#!/usr/bin/env node
/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  ft_transcendence — Seed Script  (complete flow)
 *
 *  FLOW:
 *    Step 1 : Create N users  (register + login)
 *    Step 2 : Send friend requests  (ring: each user → next 2)
 *    Step 3 : Accept all pending friend requests  (a few secs "delay")
 *    Step 4 : Every user creates 1 post
 *    Step 5 : ⏸  PAUSE — you manually approve posts in the admin panel
 *             then type  yes  + Enter to continue
 *    Step 6 : Comments on every approved post
 *    Step 7 : Reactions on every approved post
 *    Step 8 : Private chat conversations between friends
 *
 *  Validation rules (register.dto.ts):
 *    username : 3-10 chars, alphanumeric / underscore
 *    password : 6-10 chars, uppercase + lowercase + special char
 *
 *  Usage:
 *    node seed.js [--users 10] [--base-url https://localhost]
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

const https    = require('https');
const http     = require('http');
const readline = require('readline');

// ─── CLI args ──────────────────────────────────────────────────────────────
const args   = process.argv.slice(2);
const getArg = (flag, def) => {
  const idx = args.indexOf(flag);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : def;
};

const BASE_URL  = getArg('--base-url', 'https://localhost');
const NUM_USERS = parseInt(getArg('--users', '10'), 10);

// ─── HTTP helper (no redirect-following, self-signed cert OK) ──────────────
const agent = new https.Agent({ rejectUnauthorized: false });

function request(method, path, body = null, cookies = '') {
  return new Promise((resolve, reject) => {
    const url     = new URL(path, BASE_URL);
    const isHttps = url.protocol === 'https:';
    const lib     = isHttps ? https : http;
    const data    = body ? JSON.stringify(body) : null;

    const options = {
      hostname : url.hostname,
      port     : url.port || (isHttps ? 443 : 80),
      path     : url.pathname + url.search,
      method,
      agent    : isHttps ? agent : undefined,
      headers  : {
        'Content-Type': 'application/json',
        ...(data    && { 'Content-Length': Buffer.byteLength(data) }),
        ...(cookies && { Cookie: cookies }),
      },
    };

    const req = lib.request(options, (res) => {
      let raw = '';
      res.on('data', chunk => (raw += chunk));
      res.on('end', () => {
        // Capture Set-Cookie for login responses
        const setCookie = res.headers['set-cookie'] || [];
        const cookieStr = setCookie.map(c => c.split(';')[0]).join('; ');

        let parsed;
        try { parsed = JSON.parse(raw); } catch { parsed = raw; }
        resolve({ status: res.statusCode, data: parsed, cookie: cookieStr });
      });
    });

    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

// ─── Utilities ─────────────────────────────────────────────────────────────
const sleep = ms => new Promise(r => setTimeout(r, ms));
const rand  = arr => arr[Math.floor(Math.random() * arr.length)];

const G = t => `\x1b[32m${t}\x1b[0m`;   // green
const Y = t => `\x1b[33m${t}\x1b[0m`;   // yellow
const R = t => `\x1b[31m${t}\x1b[0m`;   // red
const C = t => `\x1b[36m${t}\x1b[0m`;   // cyan
const B = t => `\x1b[1m${t}\x1b[0m`;    // bold
const DIM = t => `\x1b[2m${t}\x1b[0m`;  // dim

function header(title) {
  const line = '═'.repeat(50);
  console.log(`\n${B(line)}`);
  console.log(B(`  ${title}`));
  console.log(`${B(line)}`);
}

function ok(msg)   { console.log(`  ${G('✅')} ${msg}`); }
function warn(msg) { console.log(`  ${Y('⚠️ ')} ${msg}`); }
function fail(msg) { console.log(`  ${R('❌')} ${msg}`); }
function info(msg) { console.log(`  ${C('ℹ️ ')} ${msg}`); }

/** Block until the user types a non-empty line */
function waitForInput(prompt) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => {
    rl.question(prompt, answer => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

/** Spinner while waiting */
async function fakeWait(ms, label) {
  const frames = ['⠋','⠙','⠹','⠸','⠼','⠴','⠦','⠧','⠇','⠏'];
  const step   = 80;
  const total  = Math.ceil(ms / step);
  process.stdout.write('  ');
  for (let i = 0; i < total; i++) {
    process.stdout.write(`\r  ${C(frames[i % frames.length])}  ${DIM(label)} `);
    await sleep(step);
  }
  process.stdout.write(`\r  ${G('✓')}  ${label}           \n`);
}

// ─── Fake data ─────────────────────────────────────────────────────────────

// Short so username = name + index stays ≤ 10 chars
const NAMES = [
  'ali','bob','cara','dan','eve','fay','gil','hana','ida','jak',
  'kim','leo','mia','ned','ola','pam','quinn','ria','sam','tia',
];

// Always valid: 6-10 chars, has Uppercase + lowercase + special
const makePass = i => `Ax@Pass${i % 10}`;  // e.g. "Ax@Pass3"

const POST_TEMPLATES = [
  { type: 'HELP',     title: 'How do I handle JWT refresh tokens?',
    content: 'Struggling to implement a solid refresh strategy. Any tips or resources?' },
  { type: 'HELP',     title: 'Best way to structure a NestJS monorepo?',
    content: 'Large app incoming. Nx workspace or plain NestJS monorepo? Pros/cons?' },
  { type: 'HELP',     title: 'Prisma relations are confusing me',
    content: 'Can someone explain @relation vs @@index? Getting schema errors all day.' },
  { type: 'RESOURCE', title: '10 VS Code extensions every dev should have',
    content: 'My curated list of must-haves that massively improved my workflow.' },
  { type: 'RESOURCE', title: 'Free DevOps learning path 2025',
    content: 'Linux → Docker → K8s — full free path. Sharing with the community.' },
  { type: 'RESOURCE', title: 'Docker Compose cheatsheet',
    content: 'Handy reference for the most common Docker Compose patterns. Bookmark!' },
  { type: 'MEME',     title: 'When the bug disappears after adding a log',
    content: 'Heisenbug strikes again 😂  We all know this pain.' },
  { type: 'MEME',     title: "Me: I'll just fix this one thing",
    content: '3 hours later, 12 files changed… it\'s fine. Totally fine.' },
  { type: 'MEME',     title: 'Senior dev on a Friday afternoon code review',
    content: '"This PR is fine" — said no senior dev ever before a weekend.' },
  { type: 'HELP',     title: 'WebSocket vs SSE for real-time notifications',
    content: 'Which is better for notifs in a NestJS app? Need pros and cons.' },
  { type: 'RESOURCE', title: 'PostgreSQL performance tips',
    content: 'Indexing, EXPLAIN ANALYZE, query planning — everything you need.' },
  { type: 'MEME',     title: 'CSS centering in 2025',
    content: 'Still googling "how to center a div" after 5 years. No shame.' },
  { type: 'HELP',     title: 'Docker networking explained',
    content: 'Bridge vs host vs overlay — when do you use each? Confused.' },
  { type: 'RESOURCE', title: 'Git aliases that will change your life',
    content: 'These 10 git aliases save me 20 minutes every single day.' },
  { type: 'MEME',     title: 'Works on my machine™',
    content: 'Introducing the new deployment strategy: ship your laptop.' },
  { type: 'HELP',     title: 'Difference between async/await and Promises?',
    content: 'I know they are related but when should I use one vs the other?' },
  { type: 'RESOURCE', title: 'Clean Code principles with TypeScript examples',
    content: 'SOLID, DRY, KISS — with real TypeScript snippets. Very practical.' },
  { type: 'MEME',     title: 'Documentation? What documentation?',
    content: 'The code IS the documentation. — every developer ever.' },
  { type: 'HELP',     title: 'How to pass env vars securely to Docker?',
    content: 'Using .env files feels unsafe. What are the best practices?' },
  { type: 'RESOURCE', title: 'Ultimate Linux command cheatsheet',
    content: 'awk, sed, grep, xargs — mastering these changed everything for me.' },
];

const COMMENTS = [
  'Great post! This really helped me.',
  'Thanks for sharing — bookmarked!',
  'Had the same issue last week. Check your middleware order!',
  'This is a common pitfall. Always worth documenting.',
  'Lol I literally did this yesterday 😂',
  'Pure gold. Sending to my whole team.',
  'Could you elaborate a bit on the second point?',
  'Been looking for exactly this. Thank you!',
  'Interesting. I usually go the other way but might try this.',
  'The Heisenbug is so real.',
  "Don't forget to handle edge cases too!",
  'Nice write-up. Would love a follow-up on advanced patterns.',
  'The cheatsheet link seems broken — maybe update it?',
  'This saved me hours. Seriously, thank you.',
  'Pro tip: also check your environment variables when debugging this.',
  'This is exactly what I needed today.',
  'Shared this in our Slack channel — everyone loved it.',
  'Just tried it! Works perfectly. 🙌',
  'Nice explanation! Very clear and concise.',
  'Finally someone wrote this up properly.',
];

const MESSAGES = [
  "Hey! How's it going?",
  'Did you see the latest post? Pretty interesting.',
  "I'm stuck on this bug — any chance you can take a look?",
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

const REACTION_TYPES = ['LIKE', 'LOVE', 'HAHA', 'WOW', 'SAD', 'ANGRY'];

// ─── MAIN ──────────────────────────────────────────────────────────────────
async function main() {
  console.clear();
  console.log(B('\n  🌱  ft_transcendence — Seed Script\n'));
  console.log(`  ${C('Base URL :')} ${BASE_URL}`);
  console.log(`  ${C('Users    :')} ${NUM_USERS}`);

  // ══════════════════════════════════════════════════════════════════════════
  //  STEP 1 — Register & login all users
  // ══════════════════════════════════════════════════════════════════════════
  header('Step 1 — Creating users');

  const users = [];   // { username, email, password, cookie, id }

  for (let i = 0; i < NUM_USERS; i++) {
    const name     = NAMES[i % NAMES.length];
    const username = `${name}${i}`;
    const email    = `seed_${username}@devmail.io`;
    const password = makePass(i);

    // Register
    const reg = await request('POST', '/auth/register', { email, password, username });
    if (reg.status === 201 || reg.status === 200) {
      // nothing extra needed
    } else if (reg.status === 409) {
      warn(`${Y(username)} already exists — will login`);
    } else {
      fail(`Register ${username}: ${JSON.stringify(reg.data)}`);
      continue;
    }

    // Login → get cookie
    const login = await request('POST', '/auth/login', { email, password });
    if (login.status !== 200 && login.status !== 201) {
      fail(`Login ${username}: ${JSON.stringify(login.data)}`);
      continue;
    }

    users.push({ username, email, password, cookie: login.cookie, id: null });
    ok(`${G(username)} registered & logged in`);
    await sleep(40);
  }

  info(`${G(users.length)} users ready`);

  // ── Fetch real IDs ────────────────────────────────────────────────────────
  if (users.length === 0) {
    fail('No users available. Aborting.'); process.exit(1);
  }

  const usersRes = await request('GET', '/api/chat/users', null, users[0].cookie);
  const allUsers = Array.isArray(usersRes.data) ? usersRes.data : [];

  for (const u of users) {
    const found = allUsers.find(au =>
      au.profile?.username === u.username || au.email === u.email
    );
    if (found) u.id = found.id;
  }

  const valid = users.filter(u => u.id);
  if (valid.length === 0) {
    fail('Could not fetch user IDs. Is the platform running?'); process.exit(1);
  }
  info(`Resolved IDs for ${G(valid.length)} users`);

  // ══════════════════════════════════════════════════════════════════════════
  //  STEP 2 — Send friend requests  (ring: each user → next 2)
  // ══════════════════════════════════════════════════════════════════════════
  header('Step 2 — Sending friend requests');

  let reqSent = 0;
  // Track which pairs we already requested to avoid duplicates
  const requestedPairs = new Set();

  for (let i = 0; i < valid.length; i++) {
    for (let delta = 1; delta <= 2; delta++) {
      const sender   = valid[i];
      const receiver = valid[(i + delta) % valid.length];
      const key      = [sender.id, receiver.id].sort().join('-');
      if (requestedPairs.has(key)) continue;
      requestedPairs.add(key);

      const res = await request(
        'POST',
        `/api/friends/request/${receiver.id}`,
        null,
        sender.cookie,
      );

      if (res.status === 201 || res.status === 200 || res.status === 409) {
        // 409 = already friends or pending — that's fine
        reqSent++;
        ok(`${G(sender.username)} → ${G(receiver.username)} ${DIM('(request sent)')}`);
      } else {
        warn(`${sender.username} → ${receiver.username}: ${JSON.stringify(res.data)}`);
      }
      await sleep(40);
    }
  }

  info(`${G(reqSent)} friend requests sent`);

  // ══════════════════════════════════════════════════════════════════════════
  //  STEP 3 — Wait, then accept all pending requests
  // ══════════════════════════════════════════════════════════════════════════
  header('Step 3 — Accepting friend requests');

  await fakeWait(2000, 'Simulating a short delay before accepting…');

  let accepted = 0;

  for (const receiver of valid) {
    // Fetch this user's pending incoming requests
    const pendingRes = await request('GET', '/api/friends/pending', null, receiver.cookie);
    const pending    = Array.isArray(pendingRes.data) ? pendingRes.data : [];

    for (const req of pending) {
      const senderId = req.senderId;
      if (!senderId) continue;

      const acceptRes = await request(
        'POST',
        `/api/friends/accept/${senderId}`,
        null,
        receiver.cookie,
      );

      if (acceptRes.status === 200 || acceptRes.status === 201) {
        const senderUser = valid.find(u => u.id === senderId);
        ok(`${G(receiver.username)} accepted request from ${G(senderUser?.username ?? senderId)}`);
        accepted++;
      } else {
        warn(`Accept failed for ${receiver.username} ← ${senderId}: ${JSON.stringify(acceptRes.data)}`);
      }
      await sleep(40);
    }
  }

  info(`${G(accepted)} friend requests accepted`);

  // ══════════════════════════════════════════════════════════════════════════
  //  STEP 4 — Each user creates 1 post
  // ══════════════════════════════════════════════════════════════════════════
  header('Step 4 — Creating posts');

  const createdPosts = [];  // { id, userId }

  for (let i = 0; i < valid.length; i++) {
    const user     = valid[i];
    const template = POST_TEMPLATES[i % POST_TEMPLATES.length];

    const res = await request('POST', '/api/posts/', {
      type   : template.type,
      title  : template.title,
      content: template.content,
    }, user.cookie);

    if (res.status === 201 || res.status === 200) {
      createdPosts.push({ id: res.data?.id, userId: user.id });
      ok(`${G(user.username)} → "${template.title.slice(0, 55)}…"`);
    } else {
      fail(`Post by ${user.username}: ${JSON.stringify(res.data)}`);
    }
    await sleep(60);
  }

  info(`${G(createdPosts.length)} posts created (status: PENDING)`);

  // ══════════════════════════════════════════════════════════════════════════
  //  STEP 5 — PAUSE  ⏸  Wait for you to approve posts in admin panel
  // ══════════════════════════════════════════════════════════════════════════
  console.log(`
${B('═'.repeat(50))}
${B('  ⏸  PAUSED — Manual Admin Approval Required')}
${B('═'.repeat(50))}

  ${Y('Please go to the admin panel and approve all PENDING posts.')}

  ${DIM('Hint:')} Log in as an ADMIN user, navigate to the admin
  ${DIM('      ')} posts panel, and set every post to ${Y('APPROVED')}.

  ${C('When you are done, come back here and type:')}   ${B('yes')}  + Enter
`);

  // Prompt loop — keep asking until they type "yes"
  let answer = '';
  while (answer.toLowerCase() !== 'yes') {
    answer = await waitForInput(`  ${C('Type yes to continue')} → `);
    if (answer.toLowerCase() !== 'yes') {
      console.log(`  ${Y('Not yet? Take your time — approve the posts first.')}`);
    }
  }
  console.log(`  ${G('✅ Continuing…')}\n`);

  // ── Verify which posts are now APPROVED ──────────────────────────────────
  await fakeWait(1000, 'Fetching approved posts…');

  const approvedIds = new Set();
  for (const post of createdPosts) {
    if (!post.id) continue;
    const r = await request('GET', `/api/posts/detail/${post.id}`, null, valid[0].cookie);
    if (r.data?.status === 'APPROVED') approvedIds.add(post.id);
    await sleep(30);
  }

  const approvedPosts = createdPosts.filter(p => approvedIds.has(p.id));
  info(`${G(approvedPosts.length)} / ${createdPosts.length} posts are APPROVED`);

  if (approvedPosts.length === 0) {
    warn('No posts are approved yet. Skipping comments & reactions.');
    warn('Re-run or approve posts and run from step 6 manually.');
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  STEP 6 — Comments on approved posts
  // ══════════════════════════════════════════════════════════════════════════
  if (approvedPosts.length > 0) {
    header('Step 6 — Adding comments');

    let totalComments = 0;

    for (const post of approvedPosts) {
      // 2–4 random users that are NOT the author comment on each post
      const commenters = valid
        .filter(u => u.id !== post.userId)
        .sort(() => Math.random() - 0.5)
        .slice(0, rand([2, 3, 4]));

      for (const commenter of commenters) {
        const content = rand(COMMENTS);
        const res = await request('POST', '/api/comments/', {
          postId : post.id,
          content,
        }, commenter.cookie);

        if (res.status === 200 || res.status === 201) {
          totalComments++;
        } else {
          warn(`Comment by ${commenter.username} on post ${post.id}: ${JSON.stringify(res.data)}`);
        }
        await sleep(35);
      }
    }

    ok(`${G(totalComments)} comments added`);
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  STEP 7 — Reactions on approved posts
  // ══════════════════════════════════════════════════════════════════════════
  if (approvedPosts.length > 0) {
    header('Step 7 — Adding reactions');

    let totalReactions = 0;

    for (const post of approvedPosts) {
      const reactors = valid.filter(u => u.id !== post.userId);
      for (const reactor of reactors) {
        // ~65% chance each user reacts
        if (Math.random() > 0.65) continue;

        const type = rand(REACTION_TYPES);
        const res  = await request('POST', '/api/reactions/toggle', {
          postId: post.id,
          type,
        }, reactor.cookie);

        if (res.status === 200 || res.status === 201) totalReactions++;
        await sleep(25);
      }
    }

    ok(`${G(totalReactions)} reactions added`);
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  STEP 8 — Private chat between friends
  // ══════════════════════════════════════════════════════════════════════════
  header('Step 8 — Creating private chats between friends');

  // Rebuild the accepted friendship pairs from the ring we built
  const chatPairs = [];
  const seenPairs  = new Set();

  for (let i = 0; i < valid.length; i++) {
    for (let delta = 1; delta <= 2; delta++) {
      const u1  = valid[i];
      const u2  = valid[(i + delta) % valid.length];
      const key = [u1.id, u2.id].sort().join('-');
      if (seenPairs.has(key)) continue;
      seenPairs.add(key);
      chatPairs.push({ u1, u2 });
    }
  }

  let totalConvs = 0;
  let totalMsgs  = 0;

  for (const { u1, u2 } of chatPairs) {
    // Create or find conversation
    const convRes = await request('POST', '/api/chat/conversation/find-or-create', {
      userId1: u1.id,
      userId2: u2.id,
    }, u1.cookie);

    if (convRes.status !== 200 && convRes.status !== 201) {
      warn(`Conv ${u1.username} ↔ ${u2.username}: ${JSON.stringify(convRes.data)}`);
      continue;
    }

    const convId = convRes.data?.id;
    totalConvs++;

    // Exchange 3-6 messages alternating between both users
    const msgPool   = [...MESSAGES].sort(() => Math.random() - 0.5).slice(0, rand([3,4,5,6]));
    const bothUsers = [u1, u2];
    let   turn      = 0;

    for (const content of msgPool) {
      const sender = bothUsers[turn % 2];
      const msgRes = await request('POST', '/api/chat/new-message', {
        conversationId: convId,
        content,
        type: 'TEXT',
      }, sender.cookie);

      if (msgRes.status === 200 || msgRes.status === 201) totalMsgs++;
      turn++;
      await sleep(25);
    }

    ok(`${G(u1.username)} ↔ ${G(u2.username)}  ${DIM(`(${msgPool.length} messages)`)}`);
  }

  info(`${G(totalConvs)} conversations, ${G(totalMsgs)} messages`);

  // ══════════════════════════════════════════════════════════════════════════
  //  DONE — Summary
  // ══════════════════════════════════════════════════════════════════════════
  console.log(`
${B('═'.repeat(50))}
${B('  🎉  Seed Complete!')}
${B('═'.repeat(50))}

  ${C('Users         :')} ${valid.length}
  ${C('Friendships   :')} ${accepted}
  ${C('Posts created :')} ${createdPosts.length}  ${DIM(`(${approvedPosts.length} approved)`)}
  ${C('Conversations :')} ${totalConvs}
  ${C('Messages sent :')} ${totalMsgs}

${B('  Seeded user credentials:')}
`);

  const maxName = Math.max(...valid.map(u => u.username.length));
  for (let i = 0; i < valid.length; i++) {
    const u = valid[i];
    console.log(
      `    ${C(u.username.padEnd(maxName + 2))}` +
      `email: ${u.email.padEnd(32)}  ` +
      `password: ${B(makePass(i))}`
    );
  }
  console.log('');
}

main().catch(err => {
  console.error(R('\nFatal error:'), err.message || err);
  process.exit(1);
});
