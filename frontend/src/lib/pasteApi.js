import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "/api",
});

function getErrorMessage(error, fallbackMessage) {
  if (axios.isAxiosError(error)) {
    const responseMessage = error.response?.data?.error ?? error.response?.data;

    if (typeof responseMessage === "string" && responseMessage.trim()) {
      return responseMessage;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
}

export async function createPasteRequest(content) {
  try {
    const response = await api.post("/paste", { content });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Unable to create paste."), {
      cause: error,
    });
  }
}

export async function getPasteRequest(slug) {
  try {
    const response = await api.get(`/paste/${slug}`, {
      responseType: "text",
      transformResponse: [(value) => value],
    });

    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Unable to load paste."), {
      cause: error,
    });
  }
}
