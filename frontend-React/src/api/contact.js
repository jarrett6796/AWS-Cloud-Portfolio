const CONTACT_API_URL = import.meta.env.VITE_AWS_CONTACT_API_URL;

export async function submitContactMessage({ name, email, subject, message }) {
  if (!CONTACT_API_URL) {
    throw new Error("Contact API URL is not configured.");
  }

  const response = await fetch(CONTACT_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, email, subject, message }),
  });

  if (!response.ok) {
    throw new Error(`Contact request failed with status ${response.status}.`);
  }

  return response;
}
