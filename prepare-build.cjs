const fs = require('fs');
const path = require('path');

// Função para copiar pasta recursivamente
function copyFolderSync(from, to) {
    if (!fs.existsSync(to)) fs.mkdirSync(to, { recursive: true });
    fs.readdirSync(from).forEach(element => {
        const stat = fs.lstatSync(path.join(from, element));
        if (stat.isFile()) {
            fs.copyFileSync(path.join(from, element), path.join(to, element));
        } else if (stat.isDirectory()) {
            copyFolderSync(path.join(from, element), path.join(to, element));
        }
    });
}

// 1. Define o destino como "standalone_app" na raiz (nome limpo)
const dest = path.join(__dirname, 'standalone_app');

// 2. Limpa build anterior
if (fs.existsSync(dest)) fs.rmSync(dest, { recursive: true, force: true });
console.log('Limpeza concluída.');

// 3. Verifica se o build do Next existe
const srcStandalone = path.join(__dirname, '.next/standalone');
if (!fs.existsSync(srcStandalone)) {
    console.error('ERRO: Pasta .next/standalone não encontrada! Rode "npm run build" primeiro.');
    process.exit(1);
}

// 4. Copia o servidor (standalone)
console.log('Copiando standalone...');
copyFolderSync(srcStandalone, dest);

// 5. Copia os estáticos (.next/static precisa ir para dentro de standalone_app/.next/static)
const srcStatic = path.join(__dirname, '.next/static');
const destStatic = path.join(dest, '.next/static');
console.log('Copiando static...');
copyFolderSync(srcStatic, destStatic);

// 6. Copia public (opcional, mas bom garantir)
const srcPublic = path.join(__dirname, 'public');
const destPublic = path.join(dest, 'public');
console.log('Copiando public...');
if (fs.existsSync(srcPublic)) copyFolderSync(srcPublic, destPublic);

console.log('✅ Tudo pronto na pasta "standalone_app". Pode rodar o electron:build!');