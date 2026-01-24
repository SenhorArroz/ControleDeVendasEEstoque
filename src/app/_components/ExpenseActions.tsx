"use client";

import { Trash2, Loader2 } from "lucide-react";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function DeleteExpenseButton({ id }: { id: string }) {
  const router = useRouter();
  
  const deleteMutation = api.despesa.delete.useMutation({ // Certifique-se de criar essa rota no backend
    onSuccess: () => {
      router.refresh();
      toast.success("Despesa removida!");
    },
    onError: (err) => toast.error(err.message),
  });

  const handleDelete = () => {
    if (confirm("Tem certeza que deseja apagar esta despesa?")) {
      deleteMutation.mutate({ id });
    }
  };

  return (
    <button 
      onClick={handleDelete} 
      disabled={deleteMutation.isPending}
      className="btn btn-ghost btn-xs text-error hover:bg-error/10"
      title="Excluir"
    >
      {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
    </button>
  );
}