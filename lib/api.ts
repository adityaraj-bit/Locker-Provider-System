export async function apiFetch(
  url: string,
  options: RequestInit = {}
) {
  const res = await fetch(url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "API Error");
  }

  return data;
}