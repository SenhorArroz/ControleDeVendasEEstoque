"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { api } from "~/trpc/react";
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
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
  Tag,
  Receipt,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  { id: "DINHEIRO", label: "Dinheiro", icon: Banknote, color: "emerald" },
  { id: "PIX", label: "Pix", icon: QrCode, color: "violet" },
  { id: "DEBITO", label: "Débito", icon: CreditCard, color: "blue" },
  { id: "CREDITO", label: "Crédito", icon: CreditCard, color: "rose" },
];

export default function NewSalePage() {
  const utils = api.useUtils();
  const router = useRouter();
  const { data: session } = useSession();
  const userRole = session?.user?.role;

  // --- ESTADOS ---
  const [searchTerm, setSearchTerm] = useState("");
  const [clientSearch, setClientSearch] = useState("");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
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
  const { data: clients } = api.cliente.getAll.useQuery({});
  const { data: categories } = api.categoria.getAll.useQuery();
  const { data: products, isLoading: loadingProducts } = api.produto.getAll.useQuery({
    searchTerm: searchTerm,
    categoryIds: selectedCategoryIds.length > 0 ? selectedCategoryIds : undefined,
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

  const totalCartItems = useMemo(() => cart.reduce((acc, item) => acc + item.quantity, 0), [cart]);

  const formatMoney = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  // --- Tratamento seguro para valor pago (aceita vírgula e ponto) ---
  const parseMoney = (val: string): number => {
    const cleaned = val.replace(/[^\d,.\-]/g, "").replace(",", ".");
    return parseFloat(cleaned) || 0;
  };

  // --- MUTATION ---
  const createSaleMutation = api.compra.create.useMutation({
    onSuccess: async (_, variables) => {
      const clientName = clients?.find((c) => c.id === variables.clientId)?.name || "Cliente";
      const paid = isPending ? 0 : (paymentAmount ? parseMoney(paymentAmount) : totalPurchase);
      setSaleSuccessData({
        clientName,
        subtotal,
        discountValue: discountAmount,
        total: totalPurchase,
        paid,
        change: Math.max(0, paid - totalPurchase),
        itemCount: variables.items.reduce((acc, i) => acc + i.quantity, 0),
        paymentMethod: variables.paymentMethod,
        status: variables.status,
        date: new Date(),
      });
      await Promise.all([
        utils.produto.getAll.invalidate(),
        utils.compra.itensVendidosCont.invalidate(),
      ]);
      router.refresh();
      setCart([]);
      setDiscountPercent("0");
      setPaymentAmount("");
      toast.success("Venda processada com sucesso!");
    },
    onError: (error) => {
      toast.error(`Erro ao processar venda: ${error.message}`);
    }
  });

  const handleFinishSale = () => {
    if (!selectedClientId) return toast.error("Selecione um cliente.");
    if (cart.length === 0) return toast.error("O carrinho está vazio.");
    
    // TRAVA: Impedir total zerado ou negativo
    if (totalPurchase <= 0) {
      return toast.error("O valor total da compra deve ser maior que zero.");
    }
    
    // TRAVA: Impedir desconto absurdo
    const disc = parseFloat(discountPercent) || 0;
    if (disc < 0 || disc > 100) {
      return toast.error("Desconto inválido. Use um valor entre 0 e 100.");
    }

    // Validar valor pago (apenas se não for fiado)
    if (!isPending) {
      const paid = paymentAmount ? parseMoney(paymentAmount) : totalPurchase;
      if (isNaN(paid) || paid < 0) return toast.error("Valor pago inválido.");
      
      // Tolerância de 1 centavo para arredondamento
      if (paid < totalPurchase - 0.01) {
        return toast.error(`Valor pago (${formatMoney(paid)}) é insuficiente para o total (${formatMoney(totalPurchase)}).`);
      }
    }

    createSaleMutation.mutate({
      clientId: selectedClientId,
      status: isPending ? "PENDING" : "COMPLETED",
      total: totalPurchase,
      desconto: disc,
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
      setCart((prev) => {
        const existing = prev.find((item) => item.productId === product.id && !item.barcodeId);
        
        if (existing) {
          // Aviso suave se ultrapassar estoque, mas não bloqueia
          if (existing.quantity + 1 > product.stock) {
            toast.warning(`Atenção: estoque atual de "${product.name}" é ${product.stock} un. Você está adicionando além do disponível.`);
          }
          return prev.map((item) => item.cartId === existing.cartId ? { ...item, quantity: item.quantity + 1 } : item);
        }
        
        return [...prev, { cartId: `gen-${product.id}`, productId: product.id, name: product.name, price: Number(product.precoVenda), quantity: 1, stock: product.stock, imageUrl: product.imageUrl }];
      });
    }
  };

  const handleUpdateQuantity = (cartId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.cartId !== cartId) return item;
      const newQty = item.quantity + delta;
      if (newQty <= 0) return item;
      if (newQty > item.stock) {
        toast.warning(`Atenção: estoque atual é ${item.stock} un.`);
      }
      return { ...item, quantity: newQty };
    }).filter(item => item.quantity > 0));
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gradient-to-br from-orange-50/40 via-white to-amber-50/30 text-slate-900 font-sans overflow-hidden">
      
      {/* SEÇÃO ESQUERDA: CATÁLOGO */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="p-6 lg:p-8 space-y-5 bg-white/70 backdrop-blur-2xl sticky top-0 z-10 border-b border-orange-100/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {userRole !== "FUNCIONARIO" && (
                <Link href="/dashboard" className="p-2.5 rounded-xl bg-orange-50 text-orange-400 hover:bg-orange-100 hover:text-orange-600 transition-all duration-200 hover:scale-105 active:scale-95">
                  <ArrowLeft size={18} />
                </Link>
              )}
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-200">
                    <Receipt size={16} className="text-white" />
                  </div>
                  Ponto de Venda
                </h1>
              </div>
            </div>
            {cart.length > 0 && (
              <div className="lg:hidden flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-xl text-xs font-black shadow-lg shadow-orange-200">
                <ShoppingCart size={14} />
                {totalCartItems}
              </div>
            )}
          </div>
          
          <div className="relative group">
            <input
              type="text"
              placeholder="Pesquisar produtos (Nome, SKU ou Código)..."
              className="w-full bg-white border-2 border-orange-100 rounded-2xl pl-12 pr-4 h-14 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-400 transition-all outline-none font-semibold text-slate-700 placeholder:text-slate-300 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-300 group-focus-within:text-orange-500 transition-colors" size={20} />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setSelectedCategoryIds([])}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap active:scale-95 ${selectedCategoryIds.length === 0 ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-200" : "bg-white text-slate-400 border border-orange-100 hover:bg-orange-50 hover:text-orange-600"}`}
            >
              Todos
            </button>
            {categories?.map((cat) => {
              const isSelected = selectedCategoryIds.includes(cat.id);
              const categoryColor = cat.color ?? "#f97316";
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategoryIds(prev => 
                    isSelected ? prev.filter(id => id !== cat.id) : [...prev, cat.id]
                  )}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap border hover:scale-105 active:scale-95`}
                  style={{ 
                    backgroundColor: isSelected ? categoryColor : "white",
                    color: isSelected ? "white" : categoryColor,
                    borderColor: isSelected ? "transparent" : `${categoryColor}40`,
                  }}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-8 pt-4 scroll-smooth">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 lg:gap-5">
            {!loadingProducts ? products?.map((product) => (
              <div 
                key={product.id} 
                onClick={() => handleProductClick(product)}
                className={`group bg-white rounded-2xl p-3 border-2 transition-all duration-300 hover:shadow-[0_16px_48px_-12px_rgba(234,88,12,0.15)] hover:-translate-y-1 ${product.stock <= 0 ? "opacity-40 grayscale cursor-not-allowed border-slate-100" : "cursor-pointer border-orange-100/60 hover:border-orange-300"}`}
              >
                <div className="aspect-square rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 overflow-hidden relative mb-3">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-orange-200"><PackageOpen size={40} /></div>
                  )}
                  <div className={`absolute top-2 right-2 px-2 py-1 backdrop-blur-md rounded-lg text-[9px] font-black shadow-sm ${product.stock <= 0 ? 'bg-red-500/90 text-white' : 'bg-white/90 text-slate-700 border border-slate-100'}`}>
                    {product.stock > 0 ? `${product.stock} un` : 'ESGOTADO'}
                  </div>
                  {product.codeBarras && product.codeBarras.length > 0 && (
                    <div className="absolute top-2 left-2 p-1.5 bg-white/90 backdrop-blur-md rounded-lg border border-slate-100">
                      <Barcode size={12} className="text-slate-500" />
                    </div>
                  )}
                </div>
                <div className="px-1 pb-1">
                  <h3 className="font-bold text-sm text-slate-700 line-clamp-1 group-hover:text-orange-600 transition-colors">{product.name}</h3>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-base font-black text-slate-900">{formatMoney(Number(product.precoVenda))}</span>
                    <div className={`p-2 rounded-xl transition-all duration-200 ${product.stock > 0 ? 'bg-orange-50 text-orange-400 group-hover:bg-orange-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-orange-200 group-hover:scale-110' : 'bg-slate-100 text-slate-300'}`}>
                      <Plus size={14} />
                    </div>
                  </div>
                </div>
              </div>
            )) : (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-square bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl animate-pulse" />
              ))
            )}
          </div>

          {!loadingProducts && products?.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 bg-orange-50 rounded-2xl flex items-center justify-center mb-4">
                <PackageOpen size={36} className="text-orange-300" />
              </div>
              <p className="text-slate-400 font-bold text-sm">Nenhum produto encontrado</p>
              <p className="text-slate-300 text-xs mt-1">Tente ajustar a busca ou categoria</p>
            </div>
          )}
        </main>
      </div>

      {/* SEÇÃO DIREITA: CARRINHO & CHECKOUT */}
      <div className="w-full lg:w-[480px] bg-white flex flex-col h-full shadow-[-20px_0_60px_-15px_rgba(234,88,12,0.08)] relative z-20 border-l border-orange-100/50">
        
        {/* BUSCA DE CLIENTE */}
        <div className="p-6 border-b border-orange-50 bg-gradient-to-b from-orange-50/50 to-white">
          <div className="flex items-center justify-between mb-3">
             <label className="text-[10px] font-black text-orange-500/70 uppercase tracking-[0.2em] flex items-center gap-2">
               <User size={12} /> Cliente
             </label>
          </div>
          
          <div className="space-y-2">
            <div className="relative group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-orange-300" size={14} />
              <input 
                type="text" 
                placeholder="Pesquisar por nome..." 
                className="w-full bg-white border-2 border-orange-100 rounded-xl pl-10 pr-4 h-10 text-xs font-semibold focus:ring-2 focus:ring-orange-500/10 focus:border-orange-400 transition-all outline-none placeholder:text-slate-300"
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
              />
            </div>
            
            <div className="relative">
              <select 
                className="w-full bg-white border-2 border-orange-100 rounded-xl px-4 h-12 text-sm font-bold focus:ring-2 focus:ring-orange-500/10 focus:border-orange-400 transition-all outline-none appearance-none cursor-pointer pr-10 text-slate-700"
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
              >
                <option value="">Selecione o cliente</option>
                {filteredClients.map((client) => (
                  <option key={client.id} value={client.id}>{client.name.toUpperCase()}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-orange-400 pointer-events-none" size={16} />
            </div>
          </div>
        </div>

        {/* LISTA DO CARRINHO */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {cart.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black text-orange-500/70 uppercase tracking-[0.2em]">{totalCartItems} {totalCartItems === 1 ? 'item' : 'itens'}</span>
                <button onClick={() => setCart([])} className="text-[10px] font-bold text-slate-400 hover:text-red-500 transition-colors uppercase tracking-widest">Limpar</button>
              </div>
              {cart.map((item) => (
                <div key={item.cartId} className="flex items-center gap-3 group bg-gradient-to-r from-orange-50/50 to-transparent p-3 rounded-2xl border border-orange-100/50 hover:border-orange-200 transition-all">
                  <div className="relative w-12 h-12 bg-white rounded-xl overflow-hidden flex-shrink-0 border border-orange-100">
                    {item.imageUrl ? <img src={item.imageUrl} className="w-full h-full object-cover" /> : <PackageOpen className="w-full h-full p-2.5 text-orange-200" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{item.name}</p>
                    <p className="text-[10px] font-semibold text-slate-400">{formatMoney(item.price)} /un</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => handleUpdateQuantity(item.cartId, -1)}
                      className="w-7 h-7 rounded-lg bg-white border border-orange-100 text-orange-400 hover:bg-orange-50 flex items-center justify-center transition-all"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-8 text-center text-sm font-black text-slate-800">{item.quantity}</span>
                    <button 
                      onClick={() => handleUpdateQuantity(item.cartId, 1)}
                      className="w-7 h-7 rounded-lg bg-white border border-orange-100 text-orange-400 hover:bg-orange-50 flex items-center justify-center transition-all"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                  <div className="text-right flex items-center gap-2">
                    <p className="text-sm font-black text-slate-900 whitespace-nowrap">{formatMoney(item.price * item.quantity)}</p>
                    <button 
                       onClick={() => setCart(c => c.filter(i => i.cartId !== item.cartId))}
                       className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
               <div className="w-24 h-24 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-300">
                 <ShoppingCart size={40} />
               </div>
               <div>
                 <p className="text-sm font-black tracking-tight text-slate-500">CARRINHO VAZIO</p>
                 <p className="text-xs text-slate-400 mt-1">Clique nos produtos para adicionar</p>
               </div>
            </div>
          )}
        </div>

        {/* FOOTER DE CHECKOUT */}
        <div className="p-6 bg-gradient-to-t from-orange-50/80 to-white border-t border-orange-100/50 rounded-t-3xl space-y-5 shadow-[0_-10px_30px_-10px_rgba(234,88,12,0.05)]">
          
          {/* TOTAIS */}
          <div className="space-y-2 px-1">
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
            <div className="flex justify-between items-baseline pt-1">
              <span className="text-slate-900 font-black text-xs uppercase tracking-[0.2em]">Total</span>
              <span className={`text-3xl font-black tracking-tight ${isPending ? "text-amber-500" : "text-orange-600"}`}>
                {formatMoney(totalPurchase)}
              </span>
            </div>
          </div>

          {/* TOGGLE PAGO/PENDENTE */}
          <div className="grid grid-cols-2 p-1 bg-orange-100/40 rounded-2xl gap-1">
            <button onClick={() => setIsPending(false)} className={`flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase transition-all duration-200 ${!isPending ? "bg-white text-orange-600 shadow-sm shadow-orange-100" : "text-slate-400 hover:bg-white/50"}`}>
              <CheckCircle2 size={14} /> Recebido
            </button>
            <button onClick={() => setIsPending(true)} className={`flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase transition-all duration-200 ${isPending ? "bg-amber-500 text-white shadow-lg shadow-amber-200" : "text-slate-400 hover:bg-white/50"}`}>
              <Clock size={14} /> Fiado / Pendente
            </button>
          </div>

          {/* MÉTODOS DE PAGAMENTO */}
          <div className="grid grid-cols-4 gap-2">
            {PAYMENT_METHODS.map((m) => (
              <button 
                key={m.id} 
                onClick={() => setSelectedPaymentMethod(m.id)} 
                className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-200 ${selectedPaymentMethod === m.id ? "border-orange-500 bg-orange-50 text-orange-600 shadow-sm" : "border-orange-100/60 bg-white text-slate-300 hover:border-orange-200 hover:text-slate-500"}`}
              >
                <m.icon size={18} />
                <span className="text-[9px] font-black uppercase">{m.label}</span>
              </button>
            ))}
          </div>

          {/* DESCONTO E VALOR PAGO */}
          <div className="flex gap-3">
            <div className="flex-1 space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Desc %</label>
              <div className="relative">
                <Percent className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-300" size={12} />
                <input 
                  type="text" 
                  inputMode="decimal"
                  className="w-full bg-white border-2 border-orange-100 rounded-xl h-11 pl-9 font-bold text-sm outline-none focus:ring-2 focus:ring-orange-500/10 focus:border-orange-400 transition-all" 
                  value={discountPercent} 
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^\d.,]/g, "");
                    setDiscountPercent(val);
                  }}
                />
              </div>
            </div>
            <div className="flex-1 space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Pago R$</label>
              <div className="relative">
                <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-300" size={12} />
                <input 
                  type="text" 
                  inputMode="decimal"
                  placeholder="Total" 
                  className="w-full bg-white border-2 border-orange-100 rounded-xl h-11 pl-9 font-bold text-sm outline-none focus:ring-2 focus:ring-orange-500/10 focus:border-orange-400 transition-all disabled:opacity-40 disabled:bg-slate-50" 
                  value={isPending ? "0" : paymentAmount} 
                  onChange={(e) => setPaymentAmount(e.target.value)} 
                  disabled={isPending} 
                />
              </div>
            </div>
          </div>

          {/* BOTÃO FINALIZAR */}
          <button 
            onClick={handleFinishSale} 
            disabled={cart.length === 0 || createSaleMutation.isPending}
            className={`w-full py-5 rounded-2xl font-black text-sm shadow-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3 ${isPending ? "bg-gradient-to-r from-amber-500 to-amber-600 shadow-amber-200 text-white" : "bg-gradient-to-r from-orange-500 to-orange-600 shadow-orange-200 text-white hover:shadow-2xl hover:shadow-orange-300"}`}
          >
            {createSaleMutation.isPending ? <Loader2 className="animate-spin" /> : <><Save size={18} /> {isPending ? "REGISTRAR DÉBITO" : "FINALIZAR VENDA"}</>}
          </button>
        </div>
      </div>

      {/* MODAL SUCESSO */}
      {saleSuccessData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-500">
          <div className="bg-white w-full max-w-sm rounded-3xl p-10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] animate-in zoom-in-95 duration-300 flex flex-col items-center text-center">
            <div className={`w-24 h-24 rounded-3xl flex items-center justify-center mb-8 ${saleSuccessData.status === "PENDING" ? "bg-amber-50 text-amber-500" : "bg-orange-50 text-orange-500"}`}>
              {saleSuccessData.status === "PENDING" ? <Clock size={48} /> : <CheckCircle2 size={48} />}
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">
              {saleSuccessData.status === "PENDING" ? "Venda Registrada" : "Venda Concluída!"}
            </h2>
            <p className="text-slate-400 text-sm font-medium mb-8 leading-relaxed">Cliente: <span className="text-slate-900 font-black">{saleSuccessData.clientName}</span></p>
            
            <div className="w-full bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 mb-8 space-y-4 border border-orange-100">
               <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-slate-400">
                 <span>Valor Total</span>
                 <span className="text-xl font-black text-slate-900">{formatMoney(saleSuccessData.total)}</span>
               </div>
               <div className="h-px bg-orange-200/50 w-full" />
               <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-slate-400">
                 <span>Pagamento</span>
                 <span className="text-slate-900 font-bold">{saleSuccessData.paymentMethod}</span>
               </div>
               {saleSuccessData.change > 0 && (
                 <>
                   <div className="h-px bg-orange-200/50 w-full" />
                   <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-slate-400">
                     <span>Troco</span>
                     <span className="text-emerald-600 font-black">{formatMoney(saleSuccessData.change)}</span>
                   </div>
                 </>
               )}
            </div>

            <button onClick={() => setSaleSuccessData(null)} className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.15em] hover:shadow-xl hover:shadow-orange-200 transition-all">
              <Repeat size={16} className="inline mr-2" /> Nova Venda
            </button>
          </div>
        </div>
      )}

      {/* MODAL SELEÇÃO DE CÓDIGOS */}
      {isBarcodeModalOpen && selectedProductForModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-orange-100">
            <div className="p-8 border-b border-orange-50 flex justify-between items-center bg-gradient-to-r from-orange-50/80 to-transparent">
              <div>
                <h3 className="font-black text-slate-800 text-sm tracking-wide flex items-center gap-2">
                  <Barcode size={16} className="text-orange-500" /> Código Serial
                </h3>
                <p className="text-xs text-slate-400 mt-1">Selecione uma unidade específica de <span className="font-bold text-slate-600">{selectedProductForModal.name}</span></p>
              </div>
              <button onClick={() => setIsBarcodeModalOpen(false)} className="p-2.5 hover:bg-orange-100 rounded-xl transition-colors text-slate-400 hover:text-orange-600"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-2 max-h-[50vh] overflow-y-auto">
              {selectedProductForModal.codeBarras?.map((cb: any) => (
                <button 
                  key={cb.id} 
                  onClick={() => {
                    setCart(prev => [{ cartId: cb.id, productId: selectedProductForModal.id, name: selectedProductForModal.name, price: Number(selectedProductForModal.precoVenda), quantity: 1, stock: selectedProductForModal.stock, barcodeId: cb.id, barcodeCode: cb.code }, ...prev]);
                    setIsBarcodeModalOpen(false);
                  }}
                  className="w-full flex items-center justify-between p-4 bg-orange-50/50 rounded-xl border-2 border-transparent hover:border-orange-300 hover:bg-orange-50 transition-all group"
                >
                  <span className="font-mono font-bold text-slate-500 group-hover:text-orange-600 transition-colors tracking-widest">{cb.code}</span>
                  <div className="p-1.5 rounded-lg bg-white border border-orange-100 text-orange-300 group-hover:text-white group-hover:bg-orange-500 group-hover:border-orange-500 transition-all">
                    <Plus size={14} />
                  </div>
                </button>
              ))}
            </div>
            <div className="p-6 bg-orange-50/50 text-[10px] text-slate-400 flex gap-2 border-t border-orange-100/50">
              <Info size={12} className="flex-shrink-0 text-orange-400" />
              <span>Produtos com códigos seriais devem ser adicionados individualmente para controle de garantia.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
