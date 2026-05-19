import fs from "fs";
import path from "path";

const src = path.join(process.cwd(), "dist", "client");
const dest = path.join(process.cwd(), "dist");

try {
  if (fs.existsSync(src)) {
    fs.cpSync(src, dest, { recursive: true });
    console.log("Successfully copied dist/client contents to dist for Vercel deployment!");
  } else {
    console.error("Source directory dist/client does not exist!");
  }
} catch (error) {
  console.error("Error during post-build copy:", error);
}
