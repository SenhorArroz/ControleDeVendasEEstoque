// @ts-nocheck -- Isolated fixture runner; optional Playwright comes from the test environment.
/* Layout-only checks: render the current views with isolated fixture data.
   No authentication, API calls, mutations or database connections are executed.
   Usage: NODE_PATH=<directory containing playwright> node scripts/check-responsive.cjs <output-directory>
*/
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const postcss = require('postcss');
const tailwind = require('@tailwindcss/postcss');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');
const output = path.resolve(process.argv[2] || path.join(require('node:os').tmpdir(), 'cashflow-responsive'));
fs.mkdirSync(output, { recursive: true });
const name = 'Produto com descrição longa para conferir quebra de texto e hierarquia';
const long = 'IdentificadorSemEspacos'.repeat(6);
const category = { id: 'category', name: 'Categoria de produtos com nome extenso', color: '#ea580c', _count: { products: 3 } };
const supplier = { id: 'supplier', name: 'Distribuidora com razão social extensa', email: `${long}@exemplo.com`, cnpj: '00.000.000/0001-00', phone: '(11) 99999-9999', description: long, logradouro: long, numero: '123', bairro: 'Centro', cidade: 'São Paulo', estado: 'SP', cep: '01000-000', createdAt: new Date() };
const product = { id: 'product', name, sku: long, description: long, imageUrl: null, precoCompra: 1000, precoVenda: 1250, stock: 42, lifetimeStock: 50, unidadeMedida: 'un', peso: 2, fornecedor: supplier, fornecedorId: supplier.id, categories: [category], codeBarras: [{ id: 'code', code: long, createdAt: new Date() }], _count: { purchaseItems: 42 }, createdAt: new Date() };
const client = { id: 'client', name: 'Cliente com nome completo bastante extenso', email: `${long}@exemplo.com`, phone: '(11) 99999-9999', address: long, status: 'ATIVO', createdAt: new Date() };
const purchase = { id: 'purchase', client, date: new Date(), total: 9876543.21, status: 'PENDING', metodoPagamento: 'DINHEIRO', desconto: 10, items: [{ id: 'item', quantity: 2, unitPrice: 1250, product, recordedBarcode: long }] };
const customer = { ...client, purchases: [purchase] };
const provider = { ...supplier, products: [product], _count: { products: 42 } };
const user = { ...client, role: 'ADMIN', image: null, bio: long };
const expense = { id: 'expense', name: 'Despesa operacional com nome extenso', description: long, value: 123456.78, date: new Date() };
const data = {
 'cliente.getAll': [customer], 'cliente.lastPurchase': new Date(), 'categoria.getAll': [category],
 'fornecedor.getAll': [provider], 'fornecedor.getEvery': [provider], 'fornecedor.getById': provider,
 'produto.getAll': [product, { ...product, id: 'second', stock: 0 }], 'produto.getById': product, 'produto.getByID': product,
 'produto.somaStock': 42, 'produto.somaLifetimeStock': 50, 'compra.itensVendidosCont': 42,
 'auth.getAllFuncionarios': [user],
};
const rows = { purchase: [purchase], despesas: [expense], client: [customer], fornecedor: [provider], product: [product], codigoDeBarras: [{ ...product.codeBarras[0], product }] };
const db = new Proxy({}, { get: (_, entity) => ({ findMany: async () => rows[entity] || [], count: async () => 1, findUnique: async () => ({ product, client: customer, fornecedor: provider }[entity]) }) });
const apiProxy = (parts = []) => new Proxy(() => {}, {
 get: (_, prop) => prop === 'then' ? undefined : apiProxy([...parts, prop]),
 apply: (_, self, args) => {
  const key = parts.join('.');
  if (parts.at(-1) === 'useQuery') return { data: data[parts.slice(0, -1).join('.')], isLoading: false, refetch() {} };
  if (parts.at(-1) === 'useMutation') return { isPending: false, mutate() {}, mutateAsync: async () => {} };
  if (parts.at(-1) === 'useUtils') return apiProxy();
  return data[key];
 }
});
function loadView(file, states = {}, cache = new Map()) {
 file = path.resolve(root, file);
 if (!path.extname(file)) file += '.tsx';
 if (cache.has(file)) return cache.get(file);
 let source = fs.readFileSync(file, 'utf8');
 const tree = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
 const edits = [];
 function visit(n) {
  if (ts.isVariableDeclaration(n) && ts.isArrayBindingPattern(n.name) && n.initializer && ts.isCallExpression(n.initializer) && n.initializer.expression.getText(tree) === 'useState') {
   const key = n.name.elements[0].name.getText(tree);
   if (Object.hasOwn(states, key)) {
    const a = n.initializer.arguments[0];
    edits.push([a.getStart(tree), a.end, `__fixture[${JSON.stringify(key)}]`]);
   }
  }
  ts.forEachChild(n, visit);
 }
 visit(tree);
 for (const [a,b,v] of edits.sort((a,b)=>b[0]-a[0])) source = source.slice(0,a)+v+source.slice(b);
 const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true, target: ts.ScriptTarget.ES2022 } }).outputText;
 const module = { exports: {} }; cache.set(file, module.exports);
 const mockReact = { ...React, useState: initial => [typeof initial === 'function' ? initial() : initial, () => {}], useEffect() {}, useMemo: fn => fn(), useRef: value => ({ current: value }) };
 function localRequire(id) {
  if (id === 'react') return mockReact;
  if (id === 'next/link') return { __esModule: true, default: ({children,...props}) => React.createElement('a',props,children) };
  if (id === 'next/navigation') return { useRouter: () => ({push(){},refresh(){},back(){}}), usePathname: () => '/dashboard', useParams: () => ({token:'fixture'}), redirect: p => {throw Error('Unexpected redirect '+p)}, notFound(){throw Error('Unexpected notFound')} };
  if (id === 'next-auth/react') return { useSession: () => ({ data: { user }, status: 'authenticated' }), signOut(){}, signIn(){} };
  if (id === '~/trpc/react' || id === '~/trpc/server') return { api: apiProxy(), HydrateClient: ({children})=>children };
  if (id === '~/server/auth') return { auth: async () => ({user}) };
  if (id === '~/server/db') return {db};
  if (id.startsWith('~/server/actions')) return { getUser: async()=>user, getClientsCount: async()=>12345, getProductsCount: async()=>12345, getSalesCount: async()=>12345 };
  if (id === '@uploadthing/react') return { generateReactHelpers: ()=>({useUploadThing: ()=>({startUpload(){}})}) };
  if (id === 'sonner') return {toast: {success(){},error(){},warning(){}}};
  if (id === '~/app/actions/upload') return { uploadRegistrationImage(){} };
  if (id.startsWith('.')) return loadView(path.resolve(path.dirname(file),id),states,cache);
  if (id.startsWith('~/')) return loadView(path.join(root,'src',id.slice(2)),states,cache);
  return require(id);
 }
 vm.runInNewContext(code,{require:localRequire,module,exports:module.exports,__fixture:states,console,URL,Date,Intl,Map,Set,FormData},{filename:file});
 return module.exports;
}
const routes = [
 ['home','src/app/page.tsx'],['login','src/app/login/page.tsx'],['register','src/app/register/page.tsx'],['recovery','src/app/forgot-password/page.tsx'],['reset','src/app/forgot-password/[token]/page.tsx'],['not-found','src/app/not-found.tsx'],
 ['dashboard','src/app/dashboard/page.tsx'],['products','src/app/produtos/page.tsx'],['product','src/app/produtos/[id]/page.tsx',{params:Promise.resolve({id:'product'})}],
 ['clients','src/app/clientes/page.tsx'],['client','src/app/clientes/[id]/page.tsx',{params:Promise.resolve({id:'client'})}],['suppliers','src/app/fornecedores/page.tsx'],['supplier','src/app/fornecedores/[id]/page.tsx',{params:{id:'supplier'}}],
 ['categories','src/app/categorias/page.tsx'],['employees','src/app/funcionarios/page.tsx'],['finance','src/app/financeiro/page.tsx',{searchParams:{}}],['history','src/app/historico/page.tsx'],['settings','src/app/configuracoes/page.tsx'],['sale','src/app/registrarCompra/page.tsx'],
 ['register-profile','src/app/register/page.tsx',{}, {step:2}],['recovery-success','src/app/forgot-password/page.tsx',{}, {isSubmitted:true}],
 ['products-modal','src/app/produtos/page.tsx',{}, {isModalOpen:true}],['product-modal','src/app/produtos/[id]/page.tsx',{params:Promise.resolve({id:'product'})}, {isModalOpen:true}],
 ['clients-modal','src/app/clientes/page.tsx',{}, {isModalOpen:true}],['client-profile','src/app/clientes/[id]/page.tsx',{params:Promise.resolve({id:'client'})}, {isClientModalOpen:true,expandedPurchases:new Set(['purchase'])}],
 ['client-status','src/app/clientes/[id]/page.tsx',{params:Promise.resolve({id:'client'})}, {isStatusModalOpen:true,purchaseToEdit:{id:'purchase',status:'PENDING',metodoPagamento:'DINHEIRO'}}],
 ['client-delete','src/app/clientes/[id]/page.tsx',{params:Promise.resolve({id:'client'})}, {purchaseToDelete:'purchase'}],
 ['suppliers-modal','src/app/fornecedores/page.tsx',{}, {isCreateModalOpen:true}],['supplier-modal','src/app/fornecedores/[id]/page.tsx',{params:{id:'supplier'}}, {isEditModalOpen:true}],
 ['employees-modal','src/app/funcionarios/page.tsx',{}, {isModalOpen:true}],['finance-modal','src/app/financeiro/page.tsx',{searchParams:{}}, {isOpen:true}],
 ['sale-cart','src/app/registrarCompra/page.tsx',{}, {cart:[{cartId:'item',productId:'product',name,price:123456.78,quantity:2,stock:42}]}],
 ['sale-success','src/app/registrarCompra/page.tsx',{}, {saleSuccessData:{clientName:long,total:9876543.21,paymentMethod:'DINHEIRO',change:12,status:'COMPLETED'}}],
 ['sale-barcode','src/app/registrarCompra/page.tsx',{}, {isBarcodeModalOpen:true,selectedProductForModal:product}],
 ['category-modal','src/app/categorias/page.tsx',{}, {openDialog:'dialog'}],
 ['client-row-edit','src/app/clientes/page.tsx',{}, {openDialog:'#edit_modal_client'}],
 ['client-row-delete','src/app/clientes/page.tsx',{}, {openDialog:'#delete_modal_client'}],
 ['settings-delete','src/app/configuracoes/page.tsx',{}, {openDialog:'#delete_modal'}],
 ['mobile-navigation','src/app/dashboard/page.tsx',{}, {openDrawer:true}]
];
const sizes = [[320,568],[360,640],[360,800],[375,667],[375,812],[390,844],[393,852],[412,915],[414,896],[430,932],[600,960],[720,1024],[768,1024],[800,1280],[820,1180],[834,1194],[1024,1366],[1024,768],[1280,720],[1280,800],[1366,768],[1440,900],[1536,864],[1920,1080],[2560,1440],[3840,2160],[2560,1080],[3440,1440],[3840,1600],[5120,1440],[640,360],[667,375],[844,390],[915,412]];
(async()=>{
 const css=(await postcss([tailwind({base:root})]).process(fs.readFileSync(path.join(root,'src/styles/globals.css'),'utf8'),{from:path.join(root,'src/styles/globals.css')})).css;
 const browser=await chromium.launch({headless:true, channel:process.env.RESPONSIVE_BROWSER_CHANNEL || 'chrome'}); const page=await browser.newPage(); let checks=0;const failures=[];const rendered=[];
 try {
 for(const [label,file,props={},states={}] of routes.filter(r=>!process.env.RESPONSIVE_ROUTE || r[0]===process.env.RESPONSIVE_ROUTE)){
  const module=loadView(file,states);const html=renderToStaticMarkup(await module.default(props));
  fs.writeFileSync(path.join(output,label+'.html'),`<!doctype html><html lang="pt-BR" data-theme="light"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style><body>${html}</body></html>`);
  await page.setContent(fs.readFileSync(path.join(output,label+'.html'),'utf8'));
  await page.evaluate(()=>{document.querySelectorAll('dialog.modal-open').forEach(d=>d.setAttribute('open',''));});
  if(states.openDialog) await page.locator(states.openDialog).evaluate(d=>d.showModal());
  if(states.openDrawer) await page.locator('#my-drawer-2').evaluate(el=>{el.checked=true;});
  for(const [width,height] of sizes){await page.setViewportSize({width,height});
   const problems=await page.evaluate(()=>{
    const problems=[];const width=document.documentElement.clientWidth;
    if(document.documentElement.scrollWidth>width+1)problems.push({type:'page-overflow',width:document.documentElement.scrollWidth,viewport:width});
    for(const el of document.querySelectorAll('input:not([type=checkbox]):not([type=file]):not([type=color]),select,textarea')){
     if(!el.getClientRects().length)continue;const r=el.getBoundingClientRect();
     if(r.width>width+1)problems.push({type:'field-overflow',class:el.className,width:r.width});
    }
    for(const el of document.querySelectorAll('.modal-box')){
     if(!el.getClientRects().length)continue;const r=el.getBoundingClientRect();
     if(r.left<0||r.right>width+1||r.top<0||r.bottom>innerHeight+1)problems.push({type:'modal-bounds',x:r.x,y:r.y,width:r.width,height:r.height});
    }
    return problems;
   });checks++;if(problems.length)failures.push({label,width,height,problems});
   if(width===320||width===1440)await page.screenshot({path:path.join(output,`${label}-${width}.png`),animations:'disabled',fullPage:!label.includes('modal')&&!states.openDialog});
  }
  rendered.push(label);console.log(label+' checked');
 }
 fs.writeFileSync(path.join(output,'results.json'),JSON.stringify({mode:'Static SSR with fixture data; Chromium; no API/session/business/gesture verification. Recharts SSR containers only.',checks,sizes,rendered,failures},null,2));
 console.log(JSON.stringify({checks,failures:failures.length,output}));process.exitCode=failures.length?1:0;
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1});
