"use client";

import { useState } from "react";
import { Plus, Download, Loader2, Save, X, FileText, TableProperties } from "lucide-react";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// --- BOTÃO DE EXPORTAR MELHORADO ---
interface ExportProps {
  purchases: any[];
  expenses: any[];
  stats: any;
}

export function ExportButton({ purchases, expenses, stats }: ExportProps) {
  
  const handleExport = () => {
    // Helper para formatar moeda no padrão PT-BR para Excel (1.000,00)
    const fmt = (num: number) => num.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    
    // Helper para limpar textos (remove quebras de linha e ponto e vírgula para não quebrar o CSV)
    const clean = (txt: string | null) => (txt || "").replace(/(\r\n|\n|\r|;)/gm, " ");

    const rows = [];

    // --- CABEÇALHO GERAL ---
    rows.push(["RELATÓRIO FINANCEIRO GERAL", "", "", "", ""]);
    rows.push([`Gerado em: ${new Date().toLocaleString('pt-BR')}`, "", "", "", ""]);
    rows.push([""]); // Linha vazia

    // --- BLOCO 1: RESUMO FINANCEIRO ---
    rows.push(["RESUMO EXECUTIVO", "", "", "", ""]);
    rows.push(["Indicador", "Valor", "", "", ""]);
    rows.push(["Faturamento Total", fmt(stats.faturamento)]);
    rows.push(["Custos Totais (Produtos + Despesas)", fmt(stats.custo)]);
    rows.push(["Lucro Líquido", fmt(stats.lucro)]);
    rows.push(["Margem de Lucro", `${stats.margem.toFixed(2)}%`]);
    rows.push(["Vendas Realizadas", stats.totalVendas]);
    rows.push([""]); 
    rows.push([""]); 

    // --- BLOCO 2: HISTÓRICO DE VENDAS ---
    rows.push(["DETALHAMENTO DE VENDAS", "", "", "", ""]);
    rows.push(["Data", "Cliente", "Status", "Itens", "Valor Total (R$)"]);
    
    purchases.forEach((p) => {
      rows.push([
        new Date(p.date).toLocaleDateString('pt-BR'), // Data
        clean(p.client.name),                         // Cliente
        p.status === 'COMPLETED' ? 'Concluído' : p.status, // Status traduzido
        p.items.length,                               // Qtd Itens
        fmt(Number(p.total))                          // Valor
      ]);
    });

    rows.push([""]); 
    rows.push([""]); 

    // --- BLOCO 3: DESPESAS ---
    rows.push(["DESPESAS OPERACIONAIS", "", "", "", ""]);
    rows.push(["Data", "Título", "Descrição", "", "Valor (R$)"]);

    expenses.forEach((e) => {
      rows.push([
        new Date(e.date).toLocaleDateString('pt-BR'),
        clean(e.name),
        clean(e.description),
        "", // Coluna vazia para alinhar visualmente valor à direita no Excel se arrastar
        fmt(Number(e.value))
      ]);
    });

    // --- GERAÇÃO DO ARQUIVO ---
    // Une as colunas com ";" (Padrão Excel Brasil) e as linhas com "\n"
    const csvContent = rows.map(e => e.join(";")).join("\n");

    // Adiciona o BOM (\uFEFF) para o Excel reconhecer os acentos (UTF-8)
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Relatorio_Financeiro_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button onClick={handleExport} className="btn btn-sm btn-primary gap-2 text-white shadow-lg hover:scale-105 transition-transform">
      <TableProperties className="w-4 h-4" /> Exportar Excel (.csv)
    </button>
  );
}

// --- MODAL DE ADICIONAR DESPESA ---
export function AddExpenseButton() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", value: "" });

  const createExpenseMutation = api.despesa.create.useMutation({
    onSuccess: () => {
      setIsOpen(false);
      setForm({ name: "", description: "", value: "" });
      router.refresh();
      toast.success("Despesa registrada!");
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Converte "1.000,50" ou "1000.50" para number corretamente
    const val = parseFloat(form.value.replace(/\./g, '').replace(',', '.'));
    
    createExpenseMutation.mutate({
      name: form.name,
      description: form.description,
      value: isNaN(val) ? 0 : val,
    });
    setIsSubmitting(false);
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="btn btn-sm btn-outline gap-2 bg-base-100">
        <Plus className="w-4 h-4" /> Nova Despesa
      </button>

      {isOpen && (
        <dialog className="modal modal-open backdrop-blur-sm bg-black/40 z-50">
          <div className="modal-box rounded-2xl shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-error" /> Registrar Despesa
              </h3>
              <button onClick={() => setIsOpen(false)} className="btn btn-sm btn-circle btn-ghost">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-control">
                <label className="label text-xs font-bold uppercase opacity-60">Título</label>
                <input 
                  required 
                  className="input input-bordered w-full" 
                  placeholder="Ex: Aluguel, Internet..." 
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                />
              </div>
              
              <div className="form-control">
                <label className="label text-xs font-bold uppercase opacity-60">Valor (R$)</label>
                <input 
                  type="text" 
                  required 
                  className="input input-bordered w-full font-mono text-error font-bold" 
                  placeholder="0,00" 
                  value={form.value}
                  onChange={e => setForm({...form, value: e.target.value})}
                />
              </div>

              <div className="form-control">
                <label className="label text-xs font-bold uppercase opacity-60">Descrição</label>
                <textarea 
                  className="textarea textarea-bordered h-20" 
                  placeholder="Detalhes..."
                  value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})}
                />
              </div>

              <div className="modal-action border-t border-base-200 pt-4">
                <button type="button" onClick={() => setIsOpen(false)} className="btn btn-ghost">Cancelar</button>
                <button type="submit" className="btn btn-error text-white" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> Salvar</>}
                </button>
              </div>
            </form>
          </div>
        </dialog>
      )}
    </>
  );
}