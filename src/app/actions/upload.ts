"use server";

import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function uploadRegistrationImage(formData: FormData) {
  // 1. Pega o arquivo do formulário
  const file = formData.get("image") as File;
  
  if (!file || file.size === 0) {
    // Se não tiver arquivo, retorna null ou erro, dependendo da sua lógica
    return null; 
  }

  // 2. Prepara o Buffer
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // 3. Cria nome único
  const filename = `${Date.now()}-${file.name.replaceAll(" ", "_")}`;
  
  // 4. Define caminhos
  const uploadDir = join(process.cwd(), "public", "uploads");
  const filePath = join(uploadDir, filename);

  // 5. Salva no disco
  try {
    await mkdir(uploadDir, { recursive: true });
    await writeFile(filePath, buffer);
  } catch (error) {
    console.error("Erro ao salvar arquivo:", error);
    throw new Error("Falha ao salvar no disco");
  }

  // 6. Retorna APENAS a URL pública para o frontend usar
  const publicUrl = `/uploads/${filename}`;
  
  return { success: true, url: publicUrl };
}