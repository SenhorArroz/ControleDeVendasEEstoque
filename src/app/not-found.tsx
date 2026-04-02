import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 text-center">
      {/* Elemento Visual de Fundo (Blur suave para combinar com o dashboard) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/10 blur-[100px] rounded-full -z-10" />

      {/* Código do Erro com Degradê */}
      <h1 className="text-9xl font-black bg-gradient-to-r from-[#4F46E5] via-[#9333EA] to-[#06B6D4] bg-clip-text text-transparent">
        404
      </h1>

      {/* Mensagem Principal */}
      <h2 className="mt-4 text-3xl font-bold text-gray-900 md:text-4xl">
        Página não encontrada
      </h2>
      
      <p className="mt-4 text-gray-500 max-w-lg text-lg">
        Parece que o fluxo financeiro te levou para um caminho inexistente. 
        Não se preocupe, seu controle de caixa continua seguro.
      </p>

      {/* Botões seguindo o estilo da Landing Page */}
      <div className="mt-10 flex flex-col sm:flex-row gap-4">
        <Link
          href="/"
          className="px-8 py-3 bg-[#4F46E5] text-white font-semibold rounded-lg hover:bg-[#4338CA] transition-all shadow-lg shadow-indigo-200 active:scale-95"
        >
          Voltar ao Início
        </Link>
      </div>

      {/* Rodapé minimalista */}
      <p className="mt-20 text-sm text-gray-400">
        © 2026 CashFlow
      </p>
    </div>
  );
}