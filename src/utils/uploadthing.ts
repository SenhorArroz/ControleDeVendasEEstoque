import { generateUploadButton } from "@uploadthing/react";
import type { OurFileRouter } from "../server/api/uploadthing/core";
 
export const UploadButton = generateUploadButton<OurFileRouter>();