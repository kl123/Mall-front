import { API_BASE_URL } from "@/utils/constants.js";

const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
};

const buildUrl = (url, params) => {
  const fullUrl = new URL(`${API_BASE_URL}${url}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        fullUrl.searchParams.append(key, String(value));
      }
    });
  }
  return fullUrl.toString();
};

const request = async (url, options = {}) => {
  const { params, headers, body, ...rest } = options;
  const finalUrl = buildUrl(url, params);
  const response = await fetch(finalUrl, {
    headers: {
      ...DEFAULT_HEADERS,
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    ...rest,
  });

  if (!response.ok) {
    let message = `请求失败：${response.status}`;
    try {
      const errorData = await response.json();
      message = errorData?.message || message;
    } catch {}
    throw new Error(message);
  }

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }
  return response.text();
};

request.get = (url, options = {}) =>
  request(url, {
    method: "GET",
    ...options,
  });

request.post = (url, body, options = {}) =>
  request(url, {
    method: "POST",
    body,
    ...options,
  });

request.put = (url, body, options = {}) =>
  request(url, {
    method: "PUT",
    body,
    ...options,
  });

request.delete = (url, options = {}) =>
  request(url, {
    method: "DELETE",
    ...options,
  });

export default request;
