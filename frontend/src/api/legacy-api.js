import axios from "axios";
import { LANGUAGE_VERSIONS } from "../utils/constants";

const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/api`,
});

export const executeCode = async (language, sourceCode) => {
  const response = await API.post("/execute", {
    language: language,
    sourceCode: sourceCode,
  });
  return response.data;
};
