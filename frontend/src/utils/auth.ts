type User = {
  username: string;
  email: string;
  password: string;
};

const USERS_KEY = 'iriscan_users';
const SESSION_KEY = 'iriscan_session';

function readUsers(): User[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeUsers(users: User[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

// Simulated server API: functions return Promises and mimic latency
export async function createUser(u: User): Promise<{ ok: boolean; error?: string }> {
  await sleep(600 + Math.floor(Math.random() * 300));
  const users = readUsers();
  if (users.find((x) => x.email === u.email)) return { ok: false, error: 'Email already exists' };
  users.push(u);
  writeUsers(users);
  localStorage.setItem(SESSION_KEY, JSON.stringify({ email: u.email, username: u.username }));
  try {
    window.dispatchEvent(new Event('authChanged'));
  } catch {}
  return { ok: true };
}

export async function deleteUser(email: string): Promise<{ ok: boolean; error?: string }> {
  await sleep(400 + Math.floor(Math.random() * 300));
  let users = readUsers();
  users = users.filter((u) => u.email !== email);
  writeUsers(users);
  const session = getCurrentUser();
  if (session?.email === email) localStorage.removeItem(SESSION_KEY);
  return { ok: true };
}

export async function login(email: string, password: string): Promise<{ ok: boolean; error?: string }> {
  await sleep(450 + Math.floor(Math.random() * 350));
  const users = readUsers();
  const u = users.find((x) => x.email === email && x.password === password);
  if (!u) return { ok: false, error: 'Invalid credentials' };
  localStorage.setItem(SESSION_KEY, JSON.stringify({ email: u.email, username: u.username }));
  try {
    window.dispatchEvent(new Event('authChanged'));
  } catch {}
  return { ok: true };
}

export async function logout(): Promise<void> {
  await sleep(120);
  localStorage.removeItem(SESSION_KEY);
  try {
    window.dispatchEvent(new Event('authChanged'));
  } catch {}
}

export function getCurrentUser(): { email: string; username: string } | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}
