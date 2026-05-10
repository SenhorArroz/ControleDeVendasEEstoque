"use client";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function DashboardCharts({ data }: { data: any[] }) {
  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);

  return (
    <div className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
          <defs>
            <linearGradient id="colorEntrada" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorSaida" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
          <XAxis dataKey="name" fontSize={10} fontWeight={800} tickLine={false} axisLine={false} tick={{fill: '#94A3B8'}} dy={15} />
          <YAxis fontSize={10} fontWeight={800} tickLine={false} axisLine={false} tickFormatter={(val) => `R$ ${val}`} tick={{fill: '#94A3B8'}} />
          <Tooltip 
            contentStyle={{ backgroundColor: "#0F172A", border: "none", borderRadius: "16px", color: "#F8FAFC", padding: '16px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)' }}
            itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
            labelStyle={{ color: "#64748B", marginBottom: '8px', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}
            formatter={(value: number) => [formatCurrency(value)]}
          />
          <Area name="Vendas" type="monotone" dataKey="entrada" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorEntrada)" />
          <Area name="Custos" type="monotone" dataKey="saida" stroke="#f43f5e" strokeWidth={4} fillOpacity={1} fill="url(#colorSaida)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}