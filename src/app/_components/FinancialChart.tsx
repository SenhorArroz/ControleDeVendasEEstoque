"use client";

import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area
} from "recharts";

interface FinancialData {
  name: string;
  faturamento: number;
  custo: number;
  lucro: number;
}

export default function FinancialChart({ data }: { data: FinancialData[] }) {
  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);

  return (
    <div className="h-[400px] w-full bg-base-100 p-4 rounded-xl">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        >
          <CartesianGrid stroke="#f5f5f5" strokeDasharray="3 3" vertical={false} />
          <XAxis 
            dataKey="name" 
            scale="point" 
            padding={{ left: 10, right: 10 }} 
            tick={{ fontSize: 12 }} 
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            tickFormatter={(val) => `R$${val}`} 
            tick={{ fontSize: 12 }} 
            axisLine={false}
            tickLine={false}
          />
          <Tooltip 
            formatter={(value: number) => [formatCurrency(value)]}
            contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: "8px", color: "#fff" }}
            itemStyle={{ paddingBottom: 4 }}
          />
          <Legend />
          
          {/* Barras de Faturamento e Custo */}
          <Bar dataKey="faturamento" name="Faturamento" barSize={20} fill="#3b82f6" radius={[4, 4, 0, 0]} />
          <Bar dataKey="custo" name="Custos" barSize={20} fill="#ef4444" radius={[4, 4, 0, 0]} />
          
          {/* Linha de Lucro */}
          <Line 
            type="monotone" 
            dataKey="lucro" 
            name="Lucro Líquido" 
            stroke="#10b981" 
            strokeWidth={3}
            dot={{ r: 4, fill: "#10b981", strokeWidth: 2, stroke: "#fff" }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}