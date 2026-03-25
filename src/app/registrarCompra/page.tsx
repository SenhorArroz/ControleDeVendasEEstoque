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
    AlertCircle,
    Barcode,
    Filter,
    X,
    CheckCircle2,
    ArrowLeft,
    Home,
    Repeat,
    CreditCard,
    QrCode,
    Wallet,
    Percent,
    Calendar,
    Hash,
    ReceiptText,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

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

// Opções de Pagamento
const PAYMENT_METHODS = [
    { id: "DINHEIRO", label: "Dinheiro", icon: Banknote },
    { id: "PIX", label: "Pix", icon: QrCode },
    { id: "DEBITO", label: "Débito", icon: CreditCard },
    { id: "CREDITO", label: "Crédito", icon: CreditCard },
];

export default function NewSalePage() {
    const router = useRouter();
    const utils = api.useUtils();

    // --- ESTADOS ---
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
    const [selectedClientId, setSelectedClientId] = useState<string>("");
    const [cart, setCart] = useState<CartItem[]>([]);

    // Pagamento e Desconto
    const [discountPercent, setDiscountPercent] = useState<string>("0");
    const [paymentAmount, setPaymentAmount] = useState<string>("");
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("DINHEIRO");
    const [isPending, setIsPending] = useState(false);

    // Modais
    const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);
    const [selectedProductForModal, setSelectedProductForModal] = useState<any | null>(null);
    const [saleSuccessData, setSaleSuccessData] = useState<SaleSuccessData | null>(null);

    // --- QUERIES ---
    const { data: clients, isLoading: loadingClients } = api.cliente.getAll.useQuery();
    const { data: categories } = api.categoria.getAll.useQuery();

    const { data: products, isLoading: loadingProducts } = api.produto.getAll.useQuery({
        searchTerm: searchTerm,
        categoryId: selectedCategoryId ?? undefined,
    });

    // --- CÁLCULOS ---
    const subtotal = useMemo(() => {
        return cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    }, [cart]);

    const totalPurchase = useMemo(() => {
        const disc = parseFloat(discountPercent) || 0;
        if (selectedPaymentMethod !== "DINHEIRO" && selectedPaymentMethod !== "PIX") return subtotal;
        return subtotal * (1 - disc / 100);
    }, [subtotal, discountPercent, selectedPaymentMethod]);

    const discountAmount = subtotal - totalPurchase;

    const change = useMemo(() => {
        if (selectedPaymentMethod !== "DINHEIRO") return 0;
        const paid = parseFloat(paymentAmount.replace(",", ".")) || 0;
        return Math.max(0, paid - totalPurchase);
    }, [paymentAmount, totalPurchase, selectedPaymentMethod]);

    const formatMoney = (val: number) =>
        new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(val);

    // --- MUTATION ---
    const createSaleMutation = api.compra.create.useMutation({
        onSuccess: async (_, variables) => {
            const clientName = clients?.find((c) => c.id === variables.clientId)?.name || "Cliente";
            const paidValue = parseFloat(paymentAmount.replace(",", ".")) || 0;

            setSaleSuccessData({
                clientName,
                subtotal: subtotal,
                discountValue: discountAmount,
                total: totalPurchase,
                paid: paidValue,
                change: paidValue - totalPurchase,
                itemCount: variables.items.reduce((acc, i) => acc + i.quantity, 0),
                paymentMethod: variables.paymentMethod,
                date: new Date(),
            });

            await utils.produto.getAll.invalidate();
        },
        onError: (error) => {
            toast.error(`Erro ao processar venda: ${error.message}`);
        },
    });

    // --- EFEITOS ---
    useEffect(() => {
        if (clients && clients.length > 0 && !selectedClientId) {
            setSelectedClientId(clients[0]?.id ?? "");
        }
    }, [clients, selectedClientId]);

    useEffect(() => {
        if (selectedPaymentMethod !== "DINHEIRO" && selectedPaymentMethod !== "PIX") {
            setDiscountPercent("0");
        }
    }, [selectedPaymentMethod]);

    // --- LÓGICA DE CARRINHO ---
    const addToCartWithSpecificBarcode = (product: any, barcodeObj: { id: string; code: string }) => {
        if (cart.some((item) => item.barcodeId === barcodeObj.id)) {
            toast.warning("Este item específico já está no carrinho.");
            return;
        }

        setCart((prev) => [
            {
                cartId: barcodeObj.id,
                productId: product.id,
                name: product.name,
                price: Number(product.precoVenda),
                quantity: 1,
                stock: product.stock,
                imageUrl: product.imageUrl,
                barcodeId: barcodeObj.id,
                barcodeCode: barcodeObj.code,
            },
            ...prev,
        ]);
        setIsBarcodeModalOpen(false);
    };

    const addGenericToCart = (product: any) => {
        setCart((prev) => {
            const existing = prev.find((item) => item.productId === product.id && !item.barcodeId);
            if (existing) {
                if (existing.quantity + 1 > product.stock) {
                    toast.error("Estoque insuficiente.");
                    return prev;
                }
                return prev.map((item) =>
                    item.cartId === existing.cartId ? { ...item, quantity: item.quantity + 1 } : item,
                );
            }
            return [...prev, {
                cartId: `gen-${product.id}-${Date.now()}`,
                productId: product.id,
                name: product.name,
                price: Number(product.precoVenda),
                quantity: 1,
                stock: product.stock,
                imageUrl: product.imageUrl,
            }];
        });
    };

    const handleProductClick = (product: any) => {
        if (product.codeBarras && product.codeBarras.length > 0) {
            setSelectedProductForModal(product);
            setIsBarcodeModalOpen(true);
        } else {
            if (product.stock > 0) addGenericToCart(product);
            else toast.error("Produto sem estoque.");
        }
    };

    const removeFromCart = (cartId: string) => setCart((current) => current.filter((item) => item.cartId !== cartId));

    const handleSearch = () => {
        if (!products || products.length === 0 || !searchTerm) return;
        const term = searchTerm.trim();
        for (const product of products) {
            const exactBarcodeMatch = product.codeBarras?.find((cb: any) => cb.code === term);
            if (exactBarcodeMatch) {
                if (!cart.some((item) => item.barcodeId === exactBarcodeMatch.id)) {
                    addToCartWithSpecificBarcode(product, exactBarcodeMatch);
                    setSearchTerm("");
                    toast.success("Item adicionado!");
                } else {
                    toast.warning("Item já está no carrinho!");
                    setSearchTerm("");
                }
                return;
            }
        }
        const exactSkuMatch = products.find((p) => p.sku === term);
        if (exactSkuMatch) {
            handleProductClick(exactSkuMatch);
            setSearchTerm("");
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSearch();
        }
    };

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

    const handleResetSale = () => {
        setCart([]);
        setPaymentAmount("");
        setDiscountPercent("0");
        setIsPending(false);
        setSelectedPaymentMethod("DINHEIRO");
        setSearchTerm("");
        setSaleSuccessData(null);
    };

    return (
        <div className="flex flex-col lg:flex-row h-screen bg-base-200 font-sans overflow-hidden">
            {/* LADO ESQUERDO: CATÁLOGO */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative border-r border-base-300">
                <div className="p-4 space-y-4 bg-base-100/50 backdrop-blur-sm z-10">
                    <div>
                        <Link href="/dashboard" className="btn btn-ghost gap-2 pl-0 hover:bg-transparent hover:underline text-base-content/70">
                            <ArrowLeft size={18} /> Voltar para Dashboard
                        </Link>
                    </div>
                    <div className="form-control w-full">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Escanear Código de Barras ou Buscar SKU..."
                                className="input input-bordered w-full pl-12 h-12 shadow-sm focus:input-primary transition-all font-medium"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={handleKeyDown}
                                autoFocus
                            />
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/40">
                                {searchTerm ? <Barcode className="w-5 h-5" /> : <Search className="w-5 h-5" />}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        <div
                            className={`badge badge-lg gap-2 cursor-pointer h-9 px-4 transition-all ${selectedCategoryId === null ? "badge-neutral" : "badge-ghost border-base-300"}`}
                            onClick={() => setSelectedCategoryId(null)}
                        >
                            <Filter className="w-3 h-3" /> Todos
                        </div>
                        {categories?.map((cat) => (
                            <div
                                key={cat.id}
                                style={{ 
                                    backgroundColor: selectedCategoryId === cat.id ? cat.color : `${cat.color}20`,
                                    color: selectedCategoryId === cat.id ? 'white' : cat.color,
                                    borderColor: cat.color 
                                }}
                                className="badge badge-lg cursor-pointer h-9 px-4 whitespace-nowrap transition-all border font-bold"
                                onClick={() => setSelectedCategoryId(selectedCategoryId === cat.id ? null : cat.id)}
                            >
                                {cat.name}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 pt-0">
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 pb-24">
                        {!loadingProducts && products?.map((product) => {
                            const hasStock = product.stock > 0;
                            return (
                                <div key={product.id} onClick={() => hasStock && handleProductClick(product)} className={`card bg-base-100 shadow-sm border border-base-200 group transition-all duration-200 ${hasStock ? "hover:shadow-md hover:border-primary/30 cursor-pointer active:scale-95" : "opacity-60 grayscale cursor-not-allowed"}`}>
                                    <figure className="h-40 w-full bg-base-200 relative overflow-hidden flex items-center justify-center">
                                        {product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" /> : <PackageOpen className="w-12 h-12 text-base-content/20" />}
                                        <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                                            {product.categories?.map((c: any) => (
                                                <span key={c.id} style={{ backgroundColor: c.color }} className="text-[10px] text-white px-1.5 py-0.5 rounded font-black uppercase shadow-sm">{c.name}</span>
                                            ))}
                                        </div>
                                        <div className="absolute top-2 right-2"><span className={`badge badge-xs font-bold ${hasStock ? "badge-success" : "badge-error"}`}>{product.stock} {product.unidadeMedida}</span></div>
                                    </figure>
                                    <div className="card-body p-3 gap-1">
                                        <h3 className="font-bold text-sm line-clamp-2 leading-tight min-h-[2.5em]">{product.name}</h3>
                                        <div className="flex justify-between items-end mt-1"><span className="text-lg font-black text-primary">{formatMoney(Number(product.precoVenda))}</span></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* LADO DIREITO */}
            <div className="w-full lg:w-[480px] bg-base-100 flex flex-col h-full shadow-2xl z-20">
                <div className="p-4 border-b border-base-200 bg-base-100">
                    <label className="form-control w-full">
                        <div className="label pt-0 pb-1">
                            <span className="label-text flex items-center gap-2 font-bold text-base-content/70"><User className="w-4 h-4" /> Cliente</span>
                        </div>
                        <select className="select select-bordered w-full" value={selectedClientId} onChange={(e) => setSelectedClientId(e.target.value)}>
                            {clients?.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}
                        </select>
                    </label>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {cart.map((item) => (
                        <div key={item.cartId} className="group hover:bg-base-200/40 border-b border-base-100 flex justify-between p-4 items-center">
                            <div><div className="font-bold text-sm truncate max-w-[200px]">{item.name}</div><div className="text-xs opacity-50">{item.quantity} x {formatMoney(item.price)}</div></div>
                            <div className="text-right font-bold flex items-center gap-2">{formatMoney(item.price * item.quantity)}<button onClick={() => removeFromCart(item.cartId)} className="btn btn-ghost btn-xs text-error"><Trash2 size={16}/></button></div>
                        </div>
                    ))}
                </div>

                <div className="p-5 bg-base-200/50 border-t border-base-300 space-y-4 backdrop-blur-md">
                    <div className="space-y-1">
                        <div className="flex justify-between text-xs font-bold opacity-50 uppercase"><span>Subtotal</span><span>{formatMoney(subtotal)}</span></div>
                        {discountAmount > 0 && <div className="flex justify-between text-xs font-bold text-success uppercase"><span>Desconto ({discountPercent}%)</span><span>- {formatMoney(discountAmount)}</span></div>}
                        <div className="flex justify-between items-end pt-2 border-t border-base-content/10"><span className="text-sm font-medium opacity-60 uppercase tracking-wider">Total</span><span className="text-4xl font-black text-primary tracking-tight">{formatMoney(totalPurchase)}</span></div>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                        {PAYMENT_METHODS.map((method) => {
                            const Icon = method.icon;
                            const isSelected = selectedPaymentMethod === method.id;
                            return (
                                <button key={method.id} onClick={() => setSelectedPaymentMethod(method.id)} className={`flex flex-col items-center justify-center gap-1 p-2 rounded-xl border transition-all ${isSelected ? "bg-primary text-primary-content border-primary" : "bg-base-100 border-base-300"}`}>
                                    <Icon className="w-5 h-5" /><span className="text-[10px] font-bold">{method.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="form-control">
                            <label className="label py-1 text-xs font-bold opacity-70">Desconto %</label>
                            <label className={`input input-bordered flex items-center gap-2 ${(selectedPaymentMethod !== "DINHEIRO" && selectedPaymentMethod !== "PIX") ? "bg-base-200 opacity-50" : ""}`}>
                                <Percent className="w-4 h-4 opacity-50" /><input type="number" className="grow font-bold" value={discountPercent} onChange={(e) => setDiscountPercent(e.target.value)} disabled={selectedPaymentMethod !== "DINHEIRO" && selectedPaymentMethod !== "PIX"}/>
                            </label>
                        </div>
                        <div className="form-control">
                            <label className="label py-1 text-xs font-bold opacity-70">Recebido</label>
                            <label className={`input input-bordered flex items-center gap-2 ${selectedPaymentMethod !== "DINHEIRO" ? "bg-base-200" : ""}`}>
                                <Wallet className="w-4 h-4 opacity-50" /><input type="number" className="grow font-bold" value={selectedPaymentMethod === "DINHEIRO" ? paymentAmount : totalPurchase.toFixed(2)} onChange={(e) => setPaymentAmount(e.target.value)} readOnly={selectedPaymentMethod !== "DINHEIRO"} />
                            </label>
                        </div>
                    </div>

                    <button onClick={handleFinishSale} disabled={cart.length === 0 || createSaleMutation.isPending} className={`btn btn-lg w-full shadow-xl text-white font-bold ${isPending ? "bg-warning" : "bg-primary"}`}>
                        {createSaleMutation.isPending ? <Loader2 className="animate-spin" /> : <><Save /> {isPending ? "Salvar Pendente" : "Finalizar"}</>}
                    </button>
                </div>
            </div>

            {/* MODAL SUCESSO */}
            {saleSuccessData && (
                <dialog className="modal modal-open backdrop-blur-md bg-black/60 z-50 overflow-hidden">
                    <div className="modal-box p-0 max-w-sm w-full rounded-3xl overflow-visible shadow-2xl bg-base-100 border border-base-300">
                        <div className="bg-success text-success-content p-8 flex flex-col items-center justify-center relative rounded-t-3xl">
                            <div className="absolute -top-6 bg-base-100 p-3 rounded-full border-4 border-success shadow-lg"><CheckCircle2 className="w-10 h-10 text-success" /></div>
                            <h2 className="text-2xl font-black mt-4 uppercase tracking-tighter">Venda Concluída</h2>
                            <p className="text-xs font-bold opacity-80 uppercase tracking-widest">Confirmação de Venda</p>
                        </div>

                        <div className="p-6 space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black opacity-40 uppercase flex items-center gap-1"><Calendar className="w-3 h-3" /> Data</label>
                                    <p className="text-xs font-bold">{saleSuccessData.date.toLocaleDateString('pt-BR')} <span className="opacity-50">{saleSuccessData.date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span></p>
                                </div>
                                <div className="space-y-1 text-right">
                                    <label className="text-[10px] font-black opacity-40 uppercase flex items-center justify-end gap-1"><Hash className="w-3 h-3" /> Itens</label>
                                    <p className="text-xs font-bold">{saleSuccessData.itemCount} un.</p>
                                </div>
                            </div>

                            <div className="divider my-0 opacity-10"></div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center"><span className="text-xs font-bold opacity-60 flex items-center gap-2"><User className="w-3 h-3" /> Cliente</span><span className="text-sm font-black">{saleSuccessData.clientName}</span></div>
                                <div className="flex justify-between items-center"><span className="text-xs font-bold opacity-60 flex items-center gap-2"><Wallet className="w-3 h-3" /> Método</span><span className="badge badge-neutral badge-sm font-bold uppercase">{saleSuccessData.paymentMethod}</span></div>
                            </div>

                            <div className="bg-base-200/50 rounded-2xl p-4 border border-base-300 border-dashed">
                                <div className="flex justify-between text-xs mb-2 opacity-70"><span>Subtotal Bruto</span><span className="font-bold">{formatMoney(saleSuccessData.subtotal)}</span></div>
                                {saleSuccessData.discountValue > 0 && <div className="flex justify-between text-xs mb-3 text-success font-bold"><span className="flex items-center gap-1"><Percent className="w-3 h-3" /> Desconto</span><span>- {formatMoney(saleSuccessData.discountValue)}</span></div>}
                                <div className="flex justify-between items-end border-t border-base-300 pt-3"><span className="text-xs font-black uppercase opacity-40">Valor Pago</span><span className="text-2xl font-black text-primary leading-none">{formatMoney(saleSuccessData.total)}</span></div>
                            </div>

                            {saleSuccessData.paymentMethod === "DINHEIRO" && (
                                <div className="flex justify-between items-center px-2"><span className="text-xs font-bold text-success flex items-center gap-2"><Banknote className="w-4 h-4" /> Troco</span><span className="text-lg font-black text-success">{formatMoney(saleSuccessData.change)}</span></div>
                            )}
                        </div>

                        <div className="p-6 bg-base-200/80 border-t border-base-300 rounded-b-3xl flex flex-col gap-3">
                            <button onClick={handleResetSale} className="btn btn-primary w-full btn-lg shadow-lg rounded-2xl"><Repeat className="w-5 h-5" /> Nova Venda</button>
                            <div className="grid grid-cols-2 gap-2">
                                <Link href="/dashboard" className="btn btn-ghost btn-sm text-[10px] font-black uppercase opacity-50"><Home className="w-4 h-4" /> Home</Link>
                            </div>
                        </div>
                    </div>
                </dialog>
            )}

            {/* MODAL BARRAS */}
            {isBarcodeModalOpen && selectedProductForModal && (
                <dialog className="modal modal-open backdrop-blur-sm bg-black/40 z-50">
                    <div className="modal-box w-11/12 max-w-lg p-0 rounded-2xl bg-base-100">
                        <div className="bg-base-200/80 px-6 py-4 flex justify-between border-b border-base-300">
                            <h3 className="font-bold">Selecione o Código</h3>
                            <button onClick={() => setIsBarcodeModalOpen(false)} className="btn btn-sm btn-circle btn-ghost"><X className="w-4 h-4" /></button>
                        </div>
                        <div className="p-4 space-y-2 max-h-[50vh] overflow-y-auto">
                            {selectedProductForModal.codeBarras?.map((cb: any) => (
                                <button key={cb.id} onClick={() => addToCartWithSpecificBarcode(selectedProductForModal, cb)} disabled={cart.some((i) => i.barcodeId === cb.id)} className="w-full btn btn-outline justify-between h-auto py-3">
                                    <span className="font-mono">{cb.code}</span>
                                    {cart.some((i) => i.barcodeId === cb.id) ? <CheckCircle2 className="text-success" /> : <Plus />}
                                </button>
                            ))}
                        </div>
                    </div>
                </dialog>
            )}
        </div>
    );
}