import { BetaAnalyticsDataClient } from "@google-analytics/data"; // * Google's pre-packaged software development kit (SDK)
import {
  GA_PROPERTY_ID,
  GOOGLE_CLIENT_EMAIL,
  GOOGLE_PRIVATE_KEY,
} from "@/config/env.config";

// * Reads your credentials and creates an authenticated connection to GA
// * READS GA CREDENTIALS FROM CENTRAL ENV CONFIG AND RETURNS AN AUTHENTICATED CLIENT + PROPERTY ID
function getClient() {
  const clientEmail = GOOGLE_CLIENT_EMAIL;
  // * PRIVATE KEY IS STORED AS A SINGLE LINE IN ENV; NEWLINES MUST BE RESTORED
  const privateKey = GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const propertyId = GA_PROPERTY_ID;

  // * FAIL FAST IF ANY REQUIRED CREDENTIAL IS MISSING
  if (!clientEmail || !privateKey || !propertyId) {
    throw new Error(
      "Missing GA credentials: GA_PROPERTY_ID, GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY",
    );
  }

  // * It instantiates an authenticated agent capable of communicating across Google's secure APIs using configuration identity.
  const client = new BetaAnalyticsDataClient({
    credentials: { client_email: clientEmail, private_key: privateKey },
  });

  return { client, propertyId };
}

// *  The Main Function
// * FETCHES ALL DASHBOARD DATA IN PARALLEL — SUMMARY, DAILY TREND, SOURCES, AND CITIES
export async function fetchGAOverview() {
  // * the function wraps 4 API calls
  const { client, propertyId } = getClient();

  // * ALL FOUR REPORTS COVER THE LAST 28 DAYS AND RUN CONCURRENTLY TO MINIMIZE LATENCY
  const [overviewRes, dailyRes, sourcesRes, citiesRes] = await Promise.all([
    // * The Core Dashboard Summary Card
    // * AGGREGATE METRICS: USERS, SESSIONS, PAGE VIEWS, BOUNCE RATE, AVG DURATION
    client.runReport({
      property: `properties/${propertyId}`, // * This is the syntax Google requires. It ensures you are reading data from your specific web instance.
      dateRanges: [{ startDate: "28daysAgo", endDate: "today" }],
      metrics: [
        { name: "activeUsers" },
        { name: "newUsers" },
        { name: "sessions" },
        { name: "screenPageViews" },
        { name: "bounceRate" },
        { name: "averageSessionDuration" },
      ],
    }),

    // * The Historical Line Chart
    // * DAILY BREAKDOWN ORDERED BY DATE — POWERS THE TREND CHART
    client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: "28daysAgo", endDate: "today" }],
      dimensions: [{ name: "date" }],
      metrics: [{ name: "newUsers" }, { name: "sessions" }],
      orderBys: [{ dimension: { dimensionName: "date" } }],
    }),

    // * TOP 8 TRAFFIC SOURCES RANKED BY SESSION COUNT - Finds out where traffic originated (e.g., google, facebook, direct).
    client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: "28daysAgo", endDate: "today" }],
      dimensions: [{ name: "sessionSource" }],
      metrics: [{ name: "sessions" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }], //* Ranks them from highest traffic to lowest traffic
      limit: 8, //* Truncates results to only return the top performers, keeping payloads lean.
    }),

    // * TOP 10 CITIES RANKED BY ACTIVE USERS
    client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: "28daysAgo", endDate: "today" }],
      dimensions: [{ name: "city" }],
      metrics: [{ name: "activeUsers" }],
      orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
      limit: 10,
    }),
  ]);

  // * SUMMARY IS ALWAYS A SINGLE ROW — METRIC ORDER MATCHES THE QUERY ABOVE
  const summary = overviewRes[0]?.rows?.[0];

  // * Re-formatting Dates
  // * GA RETURNS DATES AS YYYYMMDD — REFORMAT TO DD/MM FOR DISPLAY
  const dailyData = (dailyRes[0]?.rows ?? []).map((row) => {
    const raw = row.dimensionValues?.[0]?.value ?? ""; // "20260606"
    const label =
      raw.length === 8 ? `${raw.slice(6, 8)}/${raw.slice(4, 6)}` : raw;
    return {
      label, // Turns into "06/06"
      newUsers: Number(row.metricValues?.[0]?.value ?? 0),
      sessions: Number(row.metricValues?.[1]?.value ?? 0),
    };
  });

  const trafficSources = (sourcesRes[0]?.rows ?? []).map((row) => ({
    source: row.dimensionValues?.[0]?.value ?? "(direct)",
    sessions: Number(row.metricValues?.[0]?.value ?? 0),
  }));

  const cities = (citiesRes[0]?.rows ?? []).map((row) => ({
    city: row.dimensionValues?.[0]?.value ?? "Unknown",
    users: Number(row.metricValues?.[0]?.value ?? 0),
  }));

  // * BOUNCE RATE FROM GA IS A DECIMAL (0–1); MULTIPLY BY 100 FOR PERCENTAGE
  return {
    summary: {
      activeUsers: Number(summary?.metricValues?.[0]?.value ?? 0),
      newUsers: Number(summary?.metricValues?.[1]?.value ?? 0),
      sessions: Number(summary?.metricValues?.[2]?.value ?? 0),
      pageViews: Number(summary?.metricValues?.[3]?.value ?? 0),
      bounceRate: parseFloat(
        (Number(summary?.metricValues?.[4]?.value ?? 0) * 100).toFixed(1), // * Google tracks rates internally as standard fractions between 0 and 1 (e.g., 0.435). The code multiplies this value by 100 and locks it to 1 decimal place to render standard percentage metrics (e.g., 43.5%)
      ),
      avgSessionDuration: Math.round(
        Number(summary?.metricValues?.[5]?.value ?? 0), // * Google reports time metrics natively down to raw, decimal-heavy second counts. Math.round() cleans this up into clean, readable integers.
      ),
    },
    dailyData,
    trafficSources,
    cities,
  };
}


