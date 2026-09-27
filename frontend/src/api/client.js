const API_BASE = "http://127.0.0.1:8000";

// ---------- Token / User storage ----------
export function getToken() {
  return localStorage.getItem("token");
}

export function setToken(token) {
  if (token) localStorage.setItem("token", token);
  else localStorage.removeItem("token");
}

export function setUser(user) {
  if (user) localStorage.setItem("user", JSON.stringify(user));
  else localStorage.removeItem("user");
}

export function getUser() {
  const raw = localStorage.getItem("user");
  return raw ? JSON.parse(raw) : null;
}

// ---------- Generic fetch wrapper ----------
export async function apiFetch(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    let detail = "Request failed";
    try {
      const data = await res.json();
      detail = data.detail || detail;
    } catch {}
    throw new Error(detail);
  }
  return res.json();
}

// ---------- Auth endpoints ----------
export async function signup(name, email, password) {
  return apiFetch("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
}

export async function login(email, password) {
  return apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function fetchMe() {
  return apiFetch("/api/auth/me");
}

// ---------- Resume endpoints ----------
export async function uploadResume(file) {
  const token = getToken();
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/api/resume/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!res.ok) {
    let detail = "Upload failed";
    try {
      const data = await res.json();
      detail = data.detail || detail;
    } catch {}
    throw new Error(detail);
  }
  return res.json();
}

export async function listResumes() {
  return apiFetch("/api/resume/list");
}

export async function getResume(id) {
  return apiFetch(`/api/resume/${id}`);
}

// ---------- Interview endpoints ----------
export async function startInterview(role, resumeId, numQuestions = 5) {
  return apiFetch("/api/interview/start", {
    method: "POST",
    body: JSON.stringify({
      role,
      resume_id: resumeId,
      num_questions: numQuestions,
    }),
  });
}

export async function submitAnswer(interviewId, question, answer) {
  return apiFetch(`/api/interview/${interviewId}/answer`, {
    method: "POST",
    body: JSON.stringify({ question, answer }),
  });
}

export async function finishInterview(interviewId) {
  return apiFetch(`/api/interview/${interviewId}/finish`, {
    method: "POST",
  });
}

export async function listInterviews() {
  return apiFetch("/api/interview/list");
}

export async function getInterview(interviewId) {
  return apiFetch(`/api/interview/${interviewId}`);
}