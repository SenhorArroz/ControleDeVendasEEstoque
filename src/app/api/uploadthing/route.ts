// Arquivo: src/app/api/uploadthing/route.ts
import { createRouteHandler } from "uploadthing/next";

// Importa a lógica lá da pasta src/server (onde você deixou o core.ts)
import { ourFileRouter } from "~/server/api/uploadthing/core";

export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
});