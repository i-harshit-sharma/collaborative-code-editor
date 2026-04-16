import axios from "axios";
import { LANGUAGE_VERSIONS } from "../utils/constants";

const API = axios.create({
  baseURL: "http://localhost:4000/api",
});

export const executeCode = async (language, sourceCode) => {
  const response = await API.post("/execute", {
    language: language,
    sourceCode: sourceCode,
  });
  return response.data;
};
