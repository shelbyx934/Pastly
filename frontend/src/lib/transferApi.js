import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "/api",
});

function getErrorMessage(error, fallbackMessage) {
  if (axios.isAxiosError(error)) {
    const msg = error.response?.data?.error ?? error.response?.data;
    if (typeof msg === "string" && msg.trim()) return msg;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallbackMessage;
}

/** Upload a file to the server, with upload progress callback */
export async function createTransferRequest(file, onUploadProgress) {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post("/transfer", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress,
    });
    return response.data; // { code, url, expiresAt }
  } catch (error) {
    throw new Error(getErrorMessage(error, "Unable to upload file."), {
      cause: error,
    });
  }
}

/** Redeem a transfer code — returns { url } which is a direct pCloud download link */
export async function receiveTransferRequest(code) {
  try {
    const response = await api.get(`/transfer/${code}`);
    return response.data; // { success, url }
  } catch (error) {
    throw new Error(getErrorMessage(error, "Unable to fetch file."), {
      cause: error,
    });
  }
}

/** Lightweight status poll — does NOT redeem the code */
export async function getTransferStatusRequest(code) {
  try {
    const response = await api.get(`/transfer/${code}/status`);
    return response.data; // { isReceived, fileName, expiresAt }
  } catch (error) {
    throw new Error(getErrorMessage(error, "Unable to fetch status."), {
      cause: error,
    });
  }
}
