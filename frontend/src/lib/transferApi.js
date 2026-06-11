import axios from "axios";

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_BASE_URL ?? "") + "/api",
});

function getErrorMessage(error, fallbackMessage) {
  if (axios.isAxiosError(error)) {
    const msg = error.response?.data?.error ?? error.response?.data;
    if (typeof msg === "string" && msg.trim()) return msg;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallbackMessage;
}

/**
 * Upload file to the Node server with streaming to pCloud.
 *
 * @param {File}     file
 * @param {string}   progressHash
 * @param {Function} onUploadProgress  axios ProgressEvent callback
 * @param {AbortSignal} [signal]       optional AbortController signal for cancellation
 * @returns {Promise<{ success, code, url, expiresAt }>}
 */
export async function createTransferRequest(file, progressHash, onUploadProgress, signal) {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post("/transfer", formData, {
      headers: { 
        "Content-Type": "multipart/form-data",
        "X-Progress-Hash": progressHash
      },
      onUploadProgress,
      signal,
    });
    return response.data; // { success, code, url, expiresAt }
  } catch (error) {
    throw new Error(getErrorMessage(error, "Unable to upload file."), {
      cause: error,
    });
  }
}

/**
 * Poll the pCloud upload progress by hash.
 *
 * @param {string} progressHash
 */
export async function getTransferProgressStatus(progressHash) {
  try {
    const response = await api.get(`/transfer/progress/${progressHash}`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Unable to fetch progress status."), {
      cause: error,
    });
  }
}

/** Redeem a transfer code — resolves the public pCloud link and returns the final direct download link with the code prefix stripped */
export async function receiveTransferRequest(code) {
  try {
    const response = await api.get(`/transfer/${code}`);
    const publicUrl = response.data.url;

    // Fetch the public page HTML directly in frontend using Axios
    const htmlResponse = await axios.get(publicUrl);
    const htmlText = typeof htmlResponse.data === "string" ? htmlResponse.data : JSON.stringify(htmlResponse.data);

    const match = htmlText.match(/"downloadlink"\s*:\s*"([^"]+)"/);
    if (!match || !match[1]) {
      throw new Error("Could not find the download link in pCloud response.");
    }

    // Clean slashes and strip the code_ prefix
    let cleanUrl = match[1].replace(/\\\//g, "/");
    const codePrefixRegex = new RegExp(`/${code}_`, "i");
    cleanUrl = cleanUrl.replace(codePrefixRegex, "/");

    return {
      ...response.data,
      url: cleanUrl,
    };
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
