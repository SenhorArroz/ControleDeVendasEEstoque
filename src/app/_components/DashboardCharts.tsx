"use client";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function DashboardCharts({ data }: { data: any[] }) {
  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
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
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="name" 
            fontSize={10} 
            fontWeight={700} 
            tickLine={false} 
            axisLine={false} 
            tick={{fill: '#94a3b8'}} 
            dy={15} 
          />
          <YAxis 
            fontSize={10} 
            fontWeight={700} 
            tickLine={false} 
            axisLine={false} 
            tickFormatter={(val) => `R$ ${val}`} 
            tick={{fill: '#94a3b8'}} 
          />
          <Tooltip 
            cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
            contentStyle={{ 
              backgroundColor: "rgba(255, 255, 255, 0.9)", 
              border: "1px solid #f8fafc", 
              borderRadius: "16px", 
              color: "#334155", 
              padding: '16px', 
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)',
              backdropFilter: 'blur(12px)'
            }}
            itemStyle={{ fontSize: '13px', fontWeight: '800' }}
            labelStyle={{ color: "#94a3b8", marginBottom: '8px', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}
            formatter={(value: number | undefined) => [formatCurrency(value ?? 0)]}
          />
          <Area 
            name="Entradas" 
            type="monotone" 
            dataKey="entrada" 
            stroke="#10b981" 
            strokeWidth={3} 
            fillOpacity={1} 
            fill="url(#colorEntrada)" 
            activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981', style: { filter: 'drop-shadow(0px 4px 6px rgba(16,185,129,0.5))' } }}
          />
          <Area 
            name="Custos" 
            type="monotone" 
            dataKey="saida" 
            stroke="#f43f5e" 
            strokeWidth={3} 
            fillOpacity={1} 
            fill="url(#colorSaida)" 
            activeDot={{ r: 6, strokeWidth: 0, fill: '#f43f5e', style: { filter: 'drop-shadow(0px 4px 6px rgba(244,63,94,0.5))' } }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
