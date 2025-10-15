import { KpiCard } from './components/Card';

export interface SolarSize {
  'kw de tamanho': string;
  'contagem': number;
}

export interface SolarOrientation {
  'orientação': string;
  'número de painéis': number;
  'kwh de luz solar por ano': number;
}

export interface CarbonOffset {
  'toneladas métricas de compensação de carbono': number;
  'quantidade qualificada': number;
  'total de kw': number;
}

export interface Transport {
    'modo': string;
    'sentido da viagem': string;
    'viagens': number;
    'distância total em km': number;
    'total de CO2e em toneladas': number;
    'ano': number;
}

export interface BuildingSector {
    'setor': string;
    'edifícios': number;
    'toneladas de CO2e': number;
    'consumo de energia': number;
}

export interface EnergySource {
  name: string;
  value: number; // in kWh
  color: string;
}
