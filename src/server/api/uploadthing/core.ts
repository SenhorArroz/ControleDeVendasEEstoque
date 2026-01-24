import { createUploadthing, type FileRouter } from "uploadthing/next";
// Removi o import do Zod pois não estamos usando .input()

const f = createUploadthing();

export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .onUploadComplete(async ({ file }) => {
      // O aviso de deprecated sugere usar ufsUrl
      console.log("Upload url:", file.ufsUrl); 
      
      // Retornamos a nova propriedade
      return { url: file.ufsUrl };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;