const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
) {
  let token: string | null = localStorage.getItem("token");

  const makeRequest = async (accessToken: string | null) => {
    return fetch(`${API_URL}${endpoint}`, {
      ...options,
      credentials: "include",
      headers: {
        ...options.headers,
        ...(accessToken
          ? {
              Authorization: `Bearer ${accessToken}`,
            }
          : {}),
      },
    });
  };

  let response = await makeRequest(token);

  if (response.status !== 401) {
    return response;
  }

  const refreshResponse = await fetch(
    `${API_URL}/auth/refresh`,
    {
      method: "POST",
      credentials: "include",
    }
  );

  if (!refreshResponse.ok) {
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  const currentPath = `${window.location.pathname}${window.location.search}`;
  const loginPath =
    window.location.pathname === "/accept-invitation"
      ? `/login?returnTo=${encodeURIComponent(currentPath)}`
      : "/login";
  window.location.href = loginPath;

  throw new Error("Your session has expired. Please log in again.");
}

  const refreshData = await refreshResponse.json();

 token = refreshData.accessToken as string;
 localStorage.setItem("token", token);

  response = await makeRequest(token);

  return response;
}
