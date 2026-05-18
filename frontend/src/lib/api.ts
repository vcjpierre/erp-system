type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  params?: Record<string, string | number | undefined>;
  headers?: Record<string, string>;
};

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public errors?: string[],
  ) {
    super(message);
    this.name = "ApiError";
  }
}

let baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export function setBaseUrl(url: string) {
  baseUrl = url;
}

function getTokens() {
  if (typeof window === "undefined") return { accessToken: null };
  const accessToken = localStorage.getItem("accessToken");
  return { accessToken };
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { accessToken } = getTokens();
  const { method = "GET", body, params, headers = {} } = options;

  let url = `${baseUrl}/api${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) searchParams.append(key, String(value));
    });
    const qs = searchParams.toString();
    if (qs) url += `?${qs}`;
  }

  const fetchOptions: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...headers,
    },
  };

  if (body && method !== "GET") {
    fetchOptions.body = JSON.stringify(body);
  }

  const response = await fetch(url, fetchOptions);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      errorData.message?.[0] || errorData.message || "An error occurred",
      errorData.message,
    );
  }

  const data = await response.json();
  return data.data !== undefined ? data.data : data;
}

export const api = {
  get: <T>(endpoint: string, params?: Record<string, string | number | undefined>) =>
    request<T>(endpoint, { method: "GET", params }),

  post: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, { method: "POST", body }),

  put: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, { method: "PUT", body }),

  patch: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, { method: "PATCH", body }),

  delete: <T>(endpoint: string) =>
    request<T>(endpoint, { method: "DELETE" }),
};
