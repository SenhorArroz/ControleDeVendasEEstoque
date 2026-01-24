"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ChartData {
  name: string;
  entrada: number;
  saida: number;
}

export default function DashboardCharts({ data }: { data: ChartData[] }) {
  // Formatador de moeda para o Tooltip e Eixo Y
  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorEntrada" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorSaida" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="name" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
            minTickGap={30}
          />
          <YAxis 
            fontSize={11} 
            tickLine={false} 
            axisLine={false} 
            tickFormatter={(val) => `R$${val}`} 
          />
          <Tooltip 
            contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: "8px", color: "#fff" }}
            formatter={(value: number) => [formatCurrency(value)]}
            labelStyle={{ color: "#9ca3af", marginBottom: '0.5rem' }}
          />
          <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
          <Area
            name="Entradas (Vendas)"
            type="monotone"
            dataKey="entrada"
            stroke="#10b981"
            fillOpacity={1}
            fill="url(#colorEntrada)"
            strokeWidth={3}
          />
          <Area
            name="Custo dos Produtos"
            type="monotone"
            dataKey="saida"
            stroke="#ef4444"
            fillOpacity={1}
            fill="url(#colorSaida)"
            strokeWidth={3}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}