import Tesseract from "tesseract.js";

export async function scanImages(
  files: FileList | File[],
  onProgress: (progress: number, currentFileIndex: number, totalFiles: number) => void
): Promise<string> {
  const fileArray = Array.from(files);
  if (fileArray.length === 0) return "";

  let fullText = "";

  for (let i = 0; i < fileArray.length; i++) {
    const file = fileArray[i];
    
    const result = await Tesseract.recognize(file, "eng", {
      logger: (m) => {
        if (m.status === "recognizing text") {
          onProgress(Math.round(m.progress * 100), i + 1, fileArray.length);
        }
      },
    });
    fullText += result.data.text + "\n";
  }

  return fullText;
}
