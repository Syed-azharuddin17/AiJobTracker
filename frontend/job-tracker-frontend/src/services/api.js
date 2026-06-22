const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

const getHeaders = () => {
  const token = localStorage.getItem("jwtToken");
  const headers = {
    "Content-Type": "application/json",
  };

  if (
    token &&
    token !== "undefined" &&
    token !== "null" &&
    token.trim() !== ""
  ) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

export const apiService = {
  register: async (firstName, lastName, email, password) => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName, lastName, email, password }),
    });
    if (!res.ok) throw new Error("Registration failed");
    return res.json();
  },

  login: async (email, password) => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error("Invalid login credentials");
    return res.json();
  },

  getDashboardStats: async () => {
    const res = await fetch(`${BASE_URL}/jobs/dashboard/stats`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch metrics");
    return res.json();
  },

  getPaginatedJobs: async (page = 0, size = 10) => {
    const res = await fetch(`${BASE_URL}/jobs?page=${page}&size=${size}`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch job grid feed");
    return res.json();
  },

  trackNewJob: async (jobData) => {
    const res = await fetch(`${BASE_URL}/jobs`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(jobData),
    });
    if (!res.ok) throw new Error("Failed to analyze and track job target");
    return res.json();
  },

  updateJobStatus: async (id, status) => {
    const res = await fetch(`${BASE_URL}/jobs/${id}/status?status=${status}`, {
      method: "PUT",
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error("Failed to transition application state");
    return res.json();
  },

  scrapeJobUrl: async (targetUrl) => {
    const res = await fetch(
      `${BASE_URL}/jobs/scrape?url=${encodeURIComponent(targetUrl)}`,
      {
        method: "GET",
        headers: getHeaders(),
      },
    );
    if (!res.ok)
      throw new Error("AI Link Scanner failed to parse this job posting");
    return res.json();
  },

  // 🪄 NEW: Tika PDF/DOCX Parser Hook (Ensure the URL matches your Java controller)
  uploadAndParseResume: async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    // 💡 THE FIX: Changed to exactly match your @RequestMapping and @PostMapping
    const res = await fetch(`${BASE_URL}/resume/upload`, {
      method: "POST",
      headers: {
        ...(getHeaders().Authorization
          ? { Authorization: getHeaders().Authorization }
          : {}),
      },
      body: formData,
    });

    if (!res.ok) throw new Error("Tika text extraction failed");
    return res.text();
  },

  // 🪄 NEW: AI Tailor Hook (Returns the raw Markdown string)
  tailorResume: async (jobId) => {
    // 💡 THE FIX: Changed "/jobs/tailor" to "/resume/tailor" to match your controller
    const res = await fetch(`${BASE_URL}/resume/tailor/${jobId}`, {
      method: "POST",
      headers: getHeaders(),
    });

    if (!res.ok) {
      // This will now tell you EXACTLY what went wrong in the browser console
      console.error(`Backend returned ${res.status}: ${res.statusText}`);
      throw new Error("AI failed to tailor the resume");
    }

    return res.text();
  },
};
