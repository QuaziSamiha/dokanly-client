export interface IGASummary {
  activeUsers: number;
  newUsers: number;
  sessions: number;
  pageViews: number;
  bounceRate: number;
  avgSessionDuration: number;
}

export interface IGADailyPoint {
  label: string;
  newUsers: number;
  sessions: number;
}

export interface IGATrafficSource {
  source: string;
  sessions: number;
}

export interface IGACityRow {
  city: string;
  users: number;
}

export interface IGAOverview {
  summary: IGASummary;
  dailyData: IGADailyPoint[];
  trafficSources: IGATrafficSource[];
  cities: IGACityRow[];
}
