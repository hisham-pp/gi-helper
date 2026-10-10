"use server";

import fs from "fs/promises";
import path from "path";

const SAMPLES_DIR = path.join(process.cwd(), "public", "samples");

export async function getTestSets() {
  try {
    const entries = await fs.readdir(SAMPLES_DIR, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isDirectory() && entry.name.startsWith("test-set"))
      .map((entry) => entry.name);
  } catch (error) {
    console.error("Error reading test sets:", error);
    return [];
  }
}

export async function getTestImages(setName: string) {
  try {
    const setPath = path.join(SAMPLES_DIR, setName);
    const entries = await fs.readdir(setPath, { withFileTypes: true });
    return entries
      .filter(
        (entry) =>
          entry.isFile() &&
          (entry.name.endsWith(".jpg") || entry.name.endsWith(".png"))
      )
      .map((entry) => entry.name);
  } catch (error) {
    console.error("Error reading test images:", error);
    return [];
  }
}

export async function getTestResult(setName: string) {
  try {
    const jsonPath = path.join(SAMPLES_DIR, setName, "expected.json");
    const content = await fs.readFile(jsonPath, "utf-8");
    return content;
  } catch (error) {
    // If file doesn't exist, return empty
    return "";
  }
}

export async function saveTestResult(
  setName: string,
  jsonContent: string
) {
  try {
    const jsonPath = path.join(SAMPLES_DIR, setName, "expected.json");
    
    // Validate JSON before saving
    JSON.parse(jsonContent);
    
    await fs.writeFile(jsonPath, jsonContent, "utf-8");
    return { success: true };
  } catch (error) {
    console.error("Error saving test result:", error);
    return { success: false, error: (error as Error).message };
  }
}
