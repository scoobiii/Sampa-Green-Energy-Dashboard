import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { solarSizeData, solarOrientationData, carbonOffsetData, transportData, buildingSectorData } from './constants';
import type { SolarSize, SolarOrientation, CarbonOffset, Transport, BuildingSector, EnergySource } from './types';
import { Card, KpiCard } from './components/Card';

// --- Data Parsing Utilities ---
const parseNumber = (str: string): number => {
  if (!str) return 0;
  return parseFloat(str.replace(/\./g, '').replace(',', '.'));
};

const parseCsv = <T,>(csvText: string, parser: (row: string[]) => T): T[] => {
  const lines = csvText.trim().split('\n');
  return lines.slice(1).map(line => {
    const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
    const cleanedValues = values.map(v => v.replace(/"/g, ''));
    return parser(cleanedValues);
  });
};

// --- Chart Components ---

const SolarSizeDistributionChart: React.FC<{ data: SolarSize[] }> = ({ data }) => (
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
      <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
      <XAxis dataKey="kw de tamanho" stroke="#9ca3af" />
      <YAxis stroke="#9ca3af" />
      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
      <Legend />
      <Bar dataKey="contagem" fill="#22c55e" name="Contagem de Instalações" />
    </BarChart>
  </ResponsiveContainer>
);

const SolarOrientationCharts: React.FC<{ data: SolarOrientation[] }> = ({ data }) => {
    const COLORS = ['#38bdf8', '#a855f7', '#f472b6', '#f59e0b', '#22c55e'];
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
            <div className="w-full h-[300px]">
                <ResponsiveContainer>
                    <PieChart>
                        <Pie data={data} dataKey="número de painéis" nameKey="orientação" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                            {data.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div className="w-full h-[300px]">
                <ResponsiveContainer>
                    <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                        <XAxis type="number" stroke="#9ca3af" />
                        <YAxis type="category" dataKey="orientação" stroke="#9ca3af" />
                        <Tooltip formatter={(value: number) => `${(value / 1e9).toFixed(2)} GWh`} contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
                        <Legend />
                        <Bar dataKey="kwh de luz solar por ano" fill="#38bdf8" name="kWh/ano" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

const TransportationEmissionsChart: React.FC<{ data: Transport[] }> = ({ data }) => {
    const chartData = useMemo(() => {
        const filteredData = data.filter(d => d['sentido da viagem'] === 'TOTAL' && d.modo !== 'TOTAL');
        const grouped = filteredData.reduce((acc, curr) => {
            const year = curr.ano;
            if (!acc[year]) {
                acc[year] = { ano: year };
            }
            acc[year][curr.modo] = curr['total de CO2e em toneladas'];
            return acc;
        }, {} as Record<string, { ano: number; [key: string]: number }>);
        return Object.values(grouped).sort((a, b) => a.ano - b.ano);
    }, [data]);

    const modes = [...new Set(data.map(d => d.modo))].filter(m => m !== 'TOTAL');
    const COLORS = ['#22c55e', '#38bdf8', '#f472b6', '#f59e0b', '#a855f7', '#ef4444'];

    return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                <XAxis dataKey="ano" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
                <Legend />
                {modes.map((mode, index) => (
                    <Line key={mode} type="monotone" dataKey={mode} stroke={COLORS[index % COLORS.length]} name={mode} />
                ))}
            </LineChart>
        </ResponsiveContainer>
    );
};

const BuildingSectorChart: React.FC<{ data: BuildingSector[] }> = ({ data }) => (
    <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 20, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
            <XAxis dataKey="setor" stroke="#9ca3af" />
            <YAxis yAxisId="left" orientation="left" stroke="#f472b6" />
            <YAxis yAxisId="right" orientation="right" stroke="#38bdf8" />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
            <Legend />
            <Bar yAxisId="left" dataKey="toneladas de CO2e" fill="#f472b6" name="CO2e (toneladas)" />
            <Bar yAxisId="right" dataKey="consumo de energia" fill="#38bdf8" name="Consumo Energia" />
        </BarChart>
    </ResponsiveContainer>
);

const EnergyMixChart: React.FC<{ data: EnergySource[] }> = ({ data }) => {
    const totalEnergy = data.reduce((sum, entry) => sum + entry.value, 0);

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const entry = payload[0].payload;
            const percentage = ((entry.value / totalEnergy) * 100).toFixed(2);
            return (
                <div className="bg-base-300 p-2 border border-gray-600 rounded-md shadow-lg">
                    <p className="font-bold text-white">{`${entry.name}`}</p>
                    <p className="text-sm text-primary">{`${(entry.value / 1e9).toFixed(2)} TWh/ano (${percentage}%)`}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={110}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`}
                >
                    {data.map((entry) => <Cell key={`cell-${entry.name}`} fill={entry.color} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
            </PieChart>
        </ResponsiveContainer>
    );
};


// --- Main App Component ---

export default function App() {
    const parsedSolarSize = useMemo(() => parseCsv(solarSizeData, (row) => ({ 'kw de tamanho': row[0], 'contagem': parseInt(row[1]) })), []);
    const parsedSolarOrientation = useMemo(() => parseCsv(solarOrientationData, (row) => ({ 'orientação': row[0], 'número de painéis': parseInt(row[1]), 'kwh de luz solar por ano': parseInt(row[2]) })), []);
    const parsedCarbonOffset = useMemo(() => parseCsv(carbonOffsetData, (row) => ({ 'toneladas métricas de compensação de carbono': parseNumber(row[0]), 'quantidade qualificada': parseNumber(row[1]), 'total de kw': parseNumber(row[3]) }))[0], []);
    const parsedTransport = useMemo(() => parseCsv(transportData, (row) => ({ 'modo': row[0], 'sentido da viagem': row[1], 'viagens': parseInt(row[2]), 'distância total em km': parseInt(row[3]), 'total de CO2e em toneladas': parseNumber(row[5]), 'ano': parseInt(row[7]) })), []);
    const parsedBuildingSector = useMemo(() => parseCsv(buildingSectorData, (row) => ({ 'setor': row[0], 'edifícios': parseInt(row[1]), 'toneladas de CO2e': parseInt(row[2]), 'consumo de energia': parseNumber(row[3]) })), []);
    
    const solarPotentialKwh = useMemo(() => 
        parsedSolarOrientation.reduce((sum, item) => sum + item['kwh de luz solar por ano'], 0), 
    [parsedSolarOrientation]);

    const pedreiraThermalPark = useMemo(() => ({
        name: 'Térmica (Etanol)',
        generationKwh: 1.5e9, // 1.5 TWh/year mock value
        color: '#f43f5e',
    }), []);

    const combinedEnergyMix = useMemo<EnergySource[]>(() => {
        const existingMix: EnergySource[] = [
            { name: 'Hidrelétrica', value: 35e9, color: '#0ea5e9' },
            { name: 'Gás Natural', value: 25e9, color: '#f97316' },
            { name: 'Biocombustíveis', value: 10e9, color: '#84cc16' },
        ];
        
        return [
            ...existingMix,
            { name: 'Solar (Potencial)', value: solarPotentialKwh, color: '#f59e0b' },
            { name: 'Térmica (Etanol)', value: pedreiraThermalPark.generationKwh, color: pedreiraThermalPark.color },
        ].sort((a,b) => b.value - a.value);
    }, [solarPotentialKwh, pedreiraThermalPark]);

    const kpiData = useMemo(() => {
        const totalKw = parsedCarbonOffset['total de kw'];
        const solarPotentialTwh = solarPotentialKwh / 1e9;

        const COST_PER_WP = 3.33;
        const capex = totalKw * 1000 * COST_PER_WP;
        const OPEX_PERCENTAGE_OF_CAPEX = 0.015;
        const opex = capex * OPEX_PERCENTAGE_OF_CAPEX;
        const ENERGY_PRICE_PER_KWH = 0.70;
        const annualRevenue = solarPotentialKwh * ENERGY_PRICE_PER_KWH;
        const annualProfit = annualRevenue - opex;
        const roi = capex > 0 ? (annualProfit / capex) * 100 : 0;

        const formatBillion = (val: number) => `R$ ${(val / 1e9).toFixed(2)}B`;
        const formatMillion = (val: number) => `R$ ${(val / 1e6).toFixed(2)}M`;

        return {
            totalKw,
            solarPotentialTwh,
            capex,
            opex,
            roi,
            annualRevenue,
            pedreiraThermalGenerationTwh: pedreiraThermalPark.generationKwh / 1e9,
            formatBillion,
            formatMillion,
        };
    }, [parsedCarbonOffset, solarPotentialKwh, pedreiraThermalPark]);

    return (
        <div className="min-h-screen bg-base-100 p-4 sm:p-6 lg:p-8">
            <header className="mb-8 text-center">
                <h1 className="text-4xl font-bold text-white tracking-tight">Sampa Green Energy Dashboard</h1>
                <div className="mt-4 max-w-3xl mx-auto p-4 bg-base-200/50 border border-primary/50 rounded-lg flex items-center justify-center space-x-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <div>
                        <h2 className="text-xl font-semibold text-primary">Tokenize a Energia: Sampa Cripto Ativo (SCA)</h2>
                        <p className="text-gray-300 text-sm">
                            Cada 1 kWh de energia solar gerado equivale a 1 SCA. Este ativo digital pode ser usado para financiar novas instalações e vender o excedente de energia, criando uma economia verde descentralizada.
                        </p>
                    </div>
                </div>
            </header>

            <section className="mb-8 max-w-7xl mx-auto">
                <div className="bg-base-200 rounded-lg p-6 shadow-lg border border-secondary/30">
                    <h2 className="text-2xl font-bold text-center text-secondary mb-4">DAO Sampa: A Bolsa de Energia Verde da Cidade</h2>
                    <p className="text-center text-gray-400 mb-6 max-w-3xl mx-auto">
                        Uma plataforma descentralizada para financiar, comercializar e governar a energia renovável de São Paulo, aberta a pessoas físicas e jurídicas.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                        <div className="bg-base-300 p-4 rounded-lg flex flex-col items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-accent mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <h3 className="font-semibold text-lg text-white mt-2">Financiamento Coletivo</h3>
                            <p className="text-sm text-gray-400 mt-1">Invista em projetos solares e receba Sampa Cripto Ativos (SCA) como participação nos lucros e na governança.</p>
                        </div>
                        <div className="bg-base-300 p-4 rounded-lg flex flex-col items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-accent mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                            </svg>
                            <h3 className="font-semibold text-lg text-white mt-2">Mercado Livre P2P</h3>
                            <p className="text-sm text-gray-400 mt-1">Venda seu excedente de energia diretamente para vizinhos e empresas. Compre energia limpa a preços competitivos.</p>
                        </div>
                        <div className="bg-base-300 p-4 rounded-lg flex flex-col items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-accent mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <h3 className="font-semibold text-lg text-white mt-2">Governança Transparente</h3>
                            <p className="text-sm text-gray-400 mt-1">Detentores de SCA votam nas regras da plataforma, taxas e aprovação de novos projetos de forma democrática.</p>
                        </div>
                    </div>
                </div>
            </section>

            <main>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    <KpiCard title="Potência Solar Total" value={`${(kpiData.totalKw / 1e6).toFixed(2)}M`} unit="kW" description="Potência instalada total dos painéis qualificados." />
                    <KpiCard title="Potencial Solar Anual" value={kpiData.solarPotentialTwh.toFixed(2)} unit="TWh/ano" description="Potencial de geração anual com base nos painéis existentes." />
                    <KpiCard title="Receita Solar Anual" value={kpiData.formatBillion(kpiData.annualRevenue)} unit="/ano" description="Receita estimada com base no preço de R$0,70/kWh." />
                    <KpiCard title="Compensação de Carbono" value={`${(parsedCarbonOffset['toneladas métricas de compensação de carbono'] / 1e6).toFixed(2)}M`} unit="toneladas" description="Total de CO2e compensado por instalações solares." />
                    <KpiCard title="Instalações Qualificadas" value={parsedCarbonOffset['quantidade qualificada'].toLocaleString('pt-BR')} unit="instalações" description="Número de projetos de energia solar contribuindo." />
                    <KpiCard title="Energia Térmica (Etanol)" value={kpiData.pedreiraThermalGenerationTwh.toFixed(2)} unit="TWh/ano" description="Geração do Parque Térmico Pedreira (estimado)." />
                    <KpiCard title="CAPEX Estimado" value={kpiData.formatBillion(kpiData.capex)} unit="" description="Estimativa do CAPEX com base no custo médio de R$3,33/Wp." />
                    <KpiCard title="OPEX Anual Estimado" value={kpiData.formatMillion(kpiData.opex)} unit="/ano" description="Estimativa de custo operacional anual (~1.5% do CAPEX)." />
                    <KpiCard title="ROI Anual Estimado" value={`${kpiData.roi.toFixed(1)}`} unit="% a.a." description="Retorno sobre o Investimento baseado no preço de R$0,70/kWh." />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card title="Mix Energético Municipal (Estimado com Potencial Solar)">
                        <EnergyMixChart data={combinedEnergyMix} />
                    </Card>
                    <Card title="Distribuição de Instalações Solares por Tamanho">
                        <SolarSizeDistributionChart data={parsedSolarSize} />
                    </Card>
                    <Card title="Orientação e Geração de Painéis Solares">
                        <SolarOrientationCharts data={parsedSolarOrientation} />
                    </Card>
                    <Card title="Emissões de CO2 por Modo de Transporte (Anual)">
                        <TransportationEmissionsChart data={parsedTransport} />
                    </Card>
                    <Card title="Emissões e Consumo de Energia por Setor de Edificação">
                        <BuildingSectorChart data={parsedBuildingSector} />
                    </Card>
                </div>
            </main>
            <footer className="text-center py-8 px-4">
                <p className="text-sm text-gray-400">Um projeto conceitual por entusiastas da tecnologia em solidariedade.</p>
                <p className="text-xs text-gray-500 mt-2">© 2025 mex energia. mex.eco.br. todos os direitos reservados.</p>
            </footer>
        </div>
    );
}