"use client";

import { useState, useMemo, useEffect } from "react";
import { api } from "~/trpc/react";
import {
  Search,
  ShoppingCart,
  Plus,
  Trash2,
  User,
  Banknote,
  Save,
  Loader2,
  PackageOpen,
  Barcode,
  Filter,
  X,
  CheckCircle2,
  ArrowLeft,
  Repeat,
  CreditCard,
  QrCode,
  Wallet,
  Percent,
  Clock,
  ChevronDown,
  Info,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

// --- TIPOS ---
type SaleSuccessData = {
  clientName: string;
  subtotal: number;
  discountValue: number;
  total: number;
  paid: number;
  change: number;
  itemCount: number;
  paymentMethod: string;
  status: string;
  date: Date;
};

type CartItem = {
  cartId: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  stock: number;
  imageUrl?: string | null;
  barcodeId?: string;
  barcodeCode?: string;
};

const PAYMENT_METHODS = [
  { id: "DINHEIRO", label: "Dinheiro", icon: Banknote },
  { id: "PIX", label: "Pix", icon: QrCode },
  { id: "DEBITO", label: "Débito", icon: CreditCard },
  { id: "CREDITO", label: "Crédito", icon: CreditCard },
];

export default function NewSalePage() {
  const utils = api.useUtils();
  const { data: session } = useSession();
  const userRole = session?.user?.role;

  // --- ESTADOS ---
  const [searchTerm, setSearchTerm] = useState("");
  const [clientSearch, setClientSearch] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [cart, setCart] = useState<CartItem[]>([]);

  const [isPending, setIsPending] = useState(false);
  const [discountPercent, setDiscountPercent] = useState<string>("0");
  const [paymentAmount, setPaymentAmount] = useState<string>("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("DINHEIRO");

  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);
  const [selectedProductForModal, setSelectedProductForModal] = useState<any | null>(null);
  const [saleSuccessData, setSaleSuccessData] = useState<SaleSuccessData | null>(null);

  // --- QUERIES ---
  const { data: clients } = api.cliente.getAll.useQuery();
  const { data: categories } = api.categoria.getAll.useQuery();
  const { data: products, isLoading: loadingProducts } = api.produto.getAll.useQuery({
    searchTerm: searchTerm,
    categoryId: selectedCategoryId ?? undefined,
  });

  // --- FILTRO DE CLIENTES (ORDEM ALFABÉTICA + BUSCA) ---
  const filteredClients = useMemo(() => {
    if (!clients) return [];
    return clients
      .filter((c) => c.name.toLowerCase().includes(clientSearch.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [clients, clientSearch]);

  const subtotal = useMemo(() => cart.reduce((acc, item) => acc + item.price * item.quantity, 0), [cart]);
  const totalPurchase = useMemo(() => {
    const disc = parseFloat(discountPercent) || 0;
    if (selectedPaymentMethod !== "DINHEIRO" && selectedPaymentMethod !== "PIX") return subtotal;
    return subtotal * (1 - disc / 100);
  }, [subtotal, discountPercent, selectedPaymentMethod]);
  const discountAmount = subtotal - totalPurchase;

  const formatMoney = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  // --- MUTATION ---
  const createSaleMutation = api.compra.create.useMutation({
    onSuccess: async (_, variables) => {
      const clientName = clients?.find((c) => c.id === variables.clientId)?.name || "Cliente";
      setSaleSuccessData({
        clientName,
        subtotal,
        discountValue: discountAmount,
        total: totalPurchase,
        paid: isPending ? 0 : (parseFloat(paymentAmount.replace(",", ".")) || totalPurchase),
        change: 0,
        itemCount: variables.items.reduce((acc, i) => acc + i.quantity, 0),
        paymentMethod: variables.paymentMethod,
        status: variables.status,
        date: new Date(),
      });
      await utils.produto.getAll.invalidate();
      setCart([]);
      toast.success("Venda processada!");
    },
  });

  const handleFinishSale = () => {
    if (!selectedClientId) return toast.error("Selecione um cliente.");
    if (cart.length === 0) return toast.error("Carrinho vazio.");
    createSaleMutation.mutate({
      clientId: selectedClientId,
      status: isPending ? "PENDING" : "COMPLETED",
      total: totalPurchase,
      desconto: parseFloat(discountPercent) || 0,
      paymentMethod: selectedPaymentMethod,
      items: cart.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.price,
        barcodeId: item.barcodeId,
      })),
    });
  };

  const handleProductClick = (product: any) => {
    if (product.codeBarras && product.codeBarras.length > 0) {
      setSelectedProductForModal(product);
      setIsBarcodeModalOpen(true);
    } else {
      if (product.stock > 0) {
        setCart((prev) => {
          const existing = prev.find((item) => item.productId === product.id && !item.barcodeId);
          if (existing) return prev.map((item) => item.cartId === existing.cartId ? { ...item, quantity: item.quantity + 1 } : item);
          return [...prev, { cartId: `gen-${product.id}`, productId: product.id, name: product.name, price: Number(product.precoVenda), quantity: 1, stock: product.stock, imageUrl: product.imageUrl }];
        });
      } else toast.error("Sem estoque.");
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-[#FDFDFD] text-slate-900 font-sans overflow-hidden">
      
      {/* SEÇÃO ESQUERDA: CATÁLOGO */}
      <div className="flex-1 flex flex-col h-full overflow-hidden border-r border-slate-100">
        <header className="p-8 space-y-6 bg-white/80 backdrop-blur-xl sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {userRole !== "FUNCIONARIO" && (
                <Link href="/dashboard" className="p-2.5 rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-all">
                  <ArrowLeft size={18} />
                </Link>
              )}
              <h1 className="text-2xl font-semibold tracking-tight text-slate-800">Ponto de Venda</h1>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-100">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Operando</span>
            </div>
          </div>
          
          <div className="relative group">
            <input
              type="text"
              placeholder="Pesquisar produtos (Nome, SKU ou Código)..."
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 h-14 focus:ring-4 focus:ring-primary/5 focus:bg-white focus:border-primary/20 transition-all outline-none font-medium shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={20} />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setSelectedCategoryId(null)}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${selectedCategoryId === null ? "bg-slate-900 text-white shadow-xl shadow-slate-200" : "bg-white text-slate-500 border border-slate-100 hover:bg-slate-50"}`}
            >
              Todos
            </button>
            {categories?.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryId(cat.id)}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap border hover:scale-105 active:scale-95`}
                style={{ 
                  backgroundColor: selectedCategoryId === cat.id ? cat.color : "white", 
                  color: selectedCategoryId === cat.id ? "white" : cat.color, 
                  borderColor: selectedCategoryId === cat.id ? "transparent" : cat.color + "40" 
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 pt-0 scroll-smooth">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {!loadingProducts ? products?.map((product) => (
              <div 
                key={product.id} 
                onClick={() => product.stock > 0 && handleProductClick(product)}
                className={`group bg-white rounded-3xl p-3 border border-slate-100 transition-all duration-300 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] hover:-translate-y-1.5 ${product.stock <= 0 ? "opacity-40 grayscale" : "cursor-pointer"}`}
              >
                <div className="aspect-[4/5] rounded-[1.5rem] bg-slate-50 overflow-hidden relative mb-4">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-200"><PackageOpen size={48} /></div>
                  )}
                  <div className="absolute top-3 right-3 px-2.5 py-1.5 bg-white/90 backdrop-blur rounded-xl text-[10px] font-black shadow-sm border border-slate-50">
                    {product.stock} DISPONÍVEL
                  </div>
                </div>
                <div className="px-1">
                  <h3 className="font-bold text-sm text-slate-700 line-clamp-1 group-hover:text-primary transition-colors">{product.name}</h3>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-base font-black text-slate-900">{formatMoney(Number(product.precoVenda))}</span>
                    <div className="p-1.5 rounded-full bg-slate-50 text-slate-300 group-hover:bg-primary group-hover:text-white transition-all">
                      <Plus size={14} />
                    </div>
                  </div>
                </div>
              </div>
            )) : (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-[4/5] bg-slate-50 rounded-3xl animate-pulse" />
              ))
            )}
          </div>
        </main>
      </div>

      {/* SEÇÃO DIREITA: CARRINHO & CHECKOUT */}
      <div className="w-full lg:w-[460px] bg-white flex flex-col h-full shadow-[-40px_0_80px_-40px_rgba(0,0,0,0.05)] relative z-20">
        
        {/* BUSCA DE CLIENTE DINÂMICA */}
        <div className="p-8 border-b border-slate-50 bg-white">
          <div className="flex items-center justify-between mb-4">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Seleção de Cliente</label>
          </div>
          
          <div className="space-y-2">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
              <input 
                type="text" 
                placeholder="Pesquisar por nome do cliente..." 
                className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-9 pr-4 h-10 text-xs focus:ring-2 focus:ring-primary/10 transition-all outline-none"
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
              />
            </div>
            
            <div className="relative">
              <select 
                className="w-full bg-white border border-slate-100 rounded-xl px-4 h-12 text-sm font-bold focus:ring-2 focus:ring-primary/10 transition-all outline-none appearance-none cursor-pointer pr-10"
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
              >
                <option value="">Selecione o Cliente Final</option>
                {filteredClients.map((client) => (
                  <option key={client.id} value={client.id}>{client.name.toUpperCase()}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            </div>
          </div>
        </div>

        {/* LISTA DO CARRINHO */}
        <div className="flex-1 overflow-y-auto px-8 py-4 space-y-6">
          {cart.length > 0 ? cart.map((item) => (
            <div key={item.cartId} className="flex items-center gap-4 group">
              <div className="relative w-14 h-14 bg-slate-50 rounded-2xl overflow-hidden flex-shrink-0 border border-slate-100">
                {item.imageUrl ? <img src={item.imageUrl} className="w-full h-full object-cover" /> : <PackageOpen className="w-full h-full p-3 text-slate-200" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate">{item.name}</p>
                <p className="text-xs font-medium text-slate-400">{item.quantity} unidades • {formatMoney(item.price)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-slate-900">{formatMoney(item.price * item.quantity)}</p>
                <button 
                   onClick={() => setCart(c => c.filter(i => i.cartId !== item.cartId))}
                   className="p-1 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          )) : (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-30">
               <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-400"><ShoppingCart size={32} /></div>
               <p className="text-sm font-bold tracking-tight">CARRINHO VAZIO</p>
            </div>
          )}
        </div>

        {/* FOOTER DE CHECKOUT */}
        <div className="p-8 bg-slate-50/50 border-t border-slate-100 rounded-t-[2.5rem] space-y-6 shadow-[0_-20px_40px_-20px_rgba(0,0,0,0.03)]">
          <div className="space-y-3 px-2">
            <div className="flex justify-between text-slate-400 text-xs font-bold uppercase tracking-widest">
              <span>Subtotal</span>
              <span>{formatMoney(subtotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-500 text-xs font-bold uppercase tracking-widest">
                <span>Desconto</span>
                <span>-{formatMoney(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between items-baseline pt-2">
              <span className="text-slate-900 font-black text-xs uppercase tracking-[0.2em]">Total</span>
              <span className={`text-4xl font-black tracking-tight ${isPending ? "text-amber-500" : "text-primary"}`}>
                {formatMoney(totalPurchase)}
              </span>
            </div>
          </div>

          {/* TOGGLE PAGO/PENDENTE MODERNO */}
          <div className="grid grid-cols-2 p-1.5 bg-slate-200/50 rounded-[1.25rem] gap-1">
            <button onClick={() => setIsPending(false)} className={`flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${!isPending ? "bg-white text-slate-900 shadow-sm shadow-slate-200" : "text-slate-400 hover:bg-slate-100"}`}>
              <CheckCircle2 size={14} /> Recebido
            </button>
            <button onClick={() => setIsPending(true)} className={`flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${isPending ? "bg-amber-500 text-white shadow-lg shadow-amber-200" : "text-slate-400 hover:bg-slate-100"}`}>
              <Clock size={14} /> Fiado / Pendente
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {PAYMENT_METHODS.map((m) => (
              <button 
                key={m.id} 
                onClick={() => setSelectedPaymentMethod(m.id)} 
                className={`flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border transition-all ${selectedPaymentMethod === m.id ? "border-primary bg-primary/5 text-primary shadow-[0_0_20px_-5px_rgba(var(--primary),0.2)]" : "border-slate-100 bg-white text-slate-300 hover:border-slate-200 hover:text-slate-600"}`}
              >
                <m.icon size={18} />
                <span className="text-[9px] font-black uppercase">{m.label}</span>
              </button>
            ))}
          </div>

          <div className="flex gap-4">
            <div className="flex-1 space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Desc %</label>
              <div className="relative">
                <Percent className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={12} />
                <input type="number" className="w-full bg-white border border-slate-100 rounded-xl h-11 pl-9 font-bold text-sm outline-none focus:ring-2 focus:ring-primary/10" value={discountPercent} onChange={(e) => setDiscountPercent(e.target.value)} />
              </div>
            </div>
            <div className="flex-1 space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Pago R$</label>
              <div className="relative">
                <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={12} />
                <input type="number" className="w-full bg-white border border-slate-100 rounded-xl h-11 pl-9 font-bold text-sm outline-none focus:ring-2 focus:ring-primary/10" value={isPending ? 0 : paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} disabled={isPending} />
              </div>
            </div>
          </div>

          <button 
            onClick={handleFinishSale} 
            disabled={cart.length === 0 || createSaleMutation.isPending}
            className={`w-full py-6 rounded-[1.5rem] font-black text-base shadow-2xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 ${isPending ? "bg-amber-500 shadow-amber-200 text-white" : "bg-primary shadow-primary/30 text-white"}`}
          >
            {createSaleMutation.isPending ? <Loader2 className="animate-spin" /> : <><Save size={20} /> {isPending ? "REGISTRAR DÉBITO" : "FINALIZAR VENDA"}</>}
          </button>
        </div>
      </div>

      {/* MODAL SUCESSO PREMIUM */}
      {saleSuccessData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-500">
          <div className="bg-white w-full max-w-sm rounded-[3rem] p-10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] animate-in zoom-in-95 duration-300 flex flex-col items-center text-center">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-8 ${saleSuccessData.status === "PENDING" ? "bg-amber-100 text-amber-500" : "bg-emerald-100 text-emerald-500"}`}>
              {saleSuccessData.status === "PENDING" ? <Clock size={48} /> : <CheckCircle2 size={48} />}
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tighter">
              {saleSuccessData.status === "PENDING" ? "Venda Registrada" : "Venda Concluída"}
            </h2>
            <p className="text-slate-400 text-sm font-medium mb-10 leading-relaxed">Cliente: <span className="text-slate-900 font-black">{saleSuccessData.clientName}</span><br/>O comprovante eletrônico está disponível.</p>
            
            <div className="w-full bg-slate-50 rounded-[2rem] p-6 mb-10 space-y-4">
               <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-slate-400">
                 <span>Valor Total</span>
                 <span className="text-xl font-black text-slate-900">{formatMoney(saleSuccessData.total)}</span>
               </div>
               <div className="h-px bg-slate-200/50 w-full" />
               <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-slate-400">
                 <span>Pagamento</span>
                 <span className="text-slate-900">{saleSuccessData.paymentMethod}</span>
               </div>
            </div>

            <button onClick={() => setSaleSuccessData(null)} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-xl shadow-slate-200">
              <Repeat size={16} className="inline mr-2" /> Nova Venda
            </button>
          </div>
        </div>
      )}

      {/* MODAL SELEÇÃO DE CÓDIGOS ESPECÍFICOS */}
      {isBarcodeModalOpen && selectedProductForModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center">
              <div>
                <h3 className="font-black text-slate-800 uppercase text-sm tracking-widest">Código Serial</h3>
                <p className="text-xs text-slate-400 mt-1">Selecione uma unidade específica</p>
              </div>
              <button onClick={() => setIsBarcodeModalOpen(false)} className="p-2.5 hover:bg-slate-100 rounded-full transition-colors text-slate-400"><X size={20} /></button>
            </div>
            <div className="p-8 space-y-3 max-h-[50vh] overflow-y-auto custom-scrollbar">
              {selectedProductForModal.codeBarras?.map((cb: any) => (
                <button 
                  key={cb.id} 
                  onClick={() => {
                    setCart(prev => [{ cartId: cb.id, productId: selectedProductForModal.id, name: selectedProductForModal.name, price: Number(selectedProductForModal.precoVenda), quantity: 1, stock: selectedProductForModal.stock, barcodeId: cb.id, barcodeCode: cb.code }, ...prev]);
                    setIsBarcodeModalOpen(false);
                  }}
                  className="w-full flex items-center justify-between p-5 bg-slate-50 rounded-2xl border-2 border-transparent hover:border-primary/20 hover:bg-primary/5 transition-all group"
                >
                  <span className="font-mono font-bold text-slate-500 group-hover:text-primary transition-colors tracking-widest">{cb.code}</span>
                  <div className="p-1.5 rounded-full bg-white border border-slate-100 text-slate-300 group-hover:text-primary group-hover:border-primary/30 transition-all">
                    <Plus size={16} />
                  </div>
                </button>
              ))}
            </div>
            <div className="p-8 bg-slate-50 text-[10px] text-slate-400 flex gap-2">
              <Info size={12} className="flex-shrink-0" />
              <span>Produtos com códigos seriais devem ser adicionados individualmente para controle de garantia.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}