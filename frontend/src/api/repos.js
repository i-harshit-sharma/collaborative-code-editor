import api from "./index";

/**
 * Checks if the current user has access to a specific repository.
 * @param {string} id - The repository ID or path.
 * @param {string} token - The Clerk authentication token.
 * @returns {Promise<boolean>}
 */
export const checkRepoPermission = async (id, token) => {
  try {
    const response = await api.get(`/protected/check-repo/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.message === "User has access";
  } catch (error) {
    console.error("Permission check failed:", error);
    return false;
  }
};

/**
 * Executes code on the server.
 * @param {string} language - The programming language.
 * @param {string} code - The source code to execute.
 * @returns {Promise<Object>} - The execution result.
 */
export const executeCode = async (language, code) => {
  try {
    const response = await api.post("/run-code", { language, code });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

// Add more repo-related functions here as needed
