"use client";

// * THIS FILE RUNS ONLY IN THE BROWSER — NOT ON THE SERVER
// * IT IS A CUSTOM REACT HOOK THAT FETCHES GA DASHBOARD DATA AND EXPOSES IT TO ANY COMPONENT

import { IGAOverview } from "@/modules/analytics/types/analytics.types";
import { useQuery } from "@tanstack/react-query"; // * USE QUERY HANDLES FETCHING, CACHING, LOADING, AND ERROR STATES AUTOMATICALLY
import axios from "axios";

// ! THIS FUNCTION CALLS OUR OWN NEXT.JS API ROUTE (/api/analytics)
// ! THAT ROUTE INTERNALLY CALLS fetchGAOverview() FROM lib/analytics/ga-data.server.ts — SO THIS NEVER CALLS GOOGLE DIRECTLY
async function fetchAnalytics(): Promise<IGAOverview> {
  const { data } = await axios.get<{ success: boolean; data: IGAOverview }>( // * AXIOS SENDS A GET REQUEST
    "/api/analytics",
  );
  // * IF THE SERVER SIGNALS FAILURE
  if (!data.success) throw new Error("Failed to fetch analytics");
  return data.data;
}

// * CUSTOM HOOK — CALL THIS IN ANY COMPONENT TO GET LIVE GA DATA WITH NO EXTRA SETUP
export function useGAAnalytics() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["ga-analytics"],
    queryFn: fetchAnalytics, // * THE ACTUAL FUNCTION
    staleTime: 60 * 60 * 1000,
    retry: 1, // ! ON NETWORK ERROR, RETRY ONCE BEFORE MARKING AS FAILED — AVOIDS FALSE NEGATIVES ON FLAKY CONNECTIONS
  });

  return {
    summary: data?.summary, 
    dailyData: data?.dailyData ?? [],
    trafficSources: data?.trafficSources ?? [], // * WHERE VISITORS CAME FROM (GOOGLE, DIRECT, ETC.)
    cities: data?.cities ?? [], 
    isLoading, // * TRUE WHILE THE REQUEST IS IN FLIGHT
    isError, // * TRUE IF THE REQUEST FAILED AFTER ALL RETRIES
    error, // * ACTUAL ERROR OBJECT 
  };
}

// "use client";

// * THIS FILE RUNS ONLY IN THE BROWSER — NOT ON THE SERVER
// * IT IS A CUSTOM REACT HOOK THAT FETCHES GA DASHBOARD DATA AND EXPOSES IT TO ANY COMPONENT

// import { IGAOverview } from "@/modules/analytics/types/analytics.types";
// * USE QUERY IS REACT QUERY'S CORE TOOL — IT HANDLES FETCHING, CACHING, LOADING, AND ERROR STATES AUTOMATICALLY
// import { useQuery } from "@tanstack/react-query";
// * AXIOS IS AN HTTP CLIENT — SIMPLER THAN FETCH, AUTOMATICALLY PARSES JSON RESPONSES
// import axios from "axios";

// * THIS FUNCTION CALLS OUR OWN NEXT.JS API ROUTE (/api/analytics)
// * THAT ROUTE INTERNALLY CALLS fetchGAOverview() FROM lib/analytics/ga-data.server.ts — SO THIS NEVER CALLS GOOGLE DIRECTLY
// async function fetchAnalytics(): Promise<IGAOverview> {
// * AXIOS SENDS A GET REQUEST AND UNPACKS THE RESPONSE BODY INTO `data`
// * THE RESPONSE SHAPE IS { success: boolean, data: IGAOverview }
//   const { data } = await axios.get<{ success: boolean; data: IGAOverview }>(
//     "/api/analytics"
//   );
// * IF THE SERVER SIGNALS FAILURE, THROW AN ERROR SO REACT QUERY MARKS THE STATE AS isError
//   if (!data.success) throw new Error("Failed to fetch analytics");
// * RETURN ONLY THE INNER data FIELD — THIS IS THE ACTUAL GA ANALYTICS OBJECT
//   return data.data;
// }

// * CUSTOM HOOK — CALL THIS IN ANY COMPONENT TO GET LIVE GA DATA WITH NO EXTRA SETUP
// export function useGAAnalytics() {
//   const { data, isLoading, isError, error } = useQuery({
// * QUERY KEY UNIQUELY IDENTIFIES THIS DATA IN REACT QUERY'S CACHE
// * IF TWO COMPONENTS CALL useGAAnalytics(), THEY SHARE THE SAME CACHED RESULT — NO DOUBLE REQUEST
//     queryKey: ["ga-analytics"],

// * THE ACTUAL FUNCTION REACT QUERY WILL CALL TO FETCH DATA
//     queryFn: fetchAnalytics,

// * STALE TIME TELLS REACT QUERY HOW LONG TO TRUST CACHED DATA BEFORE REFETCHING
// * SET TO 1 HOUR BECAUSE GA DATA DOES NOT CHANGE SECOND-TO-SECOND
//     staleTime: 60 * 60 * 1000,

// * ON NETWORK ERROR, RETRY ONCE BEFORE MARKING AS FAILED — AVOIDS FALSE NEGATIVES ON FLAKY CONNECTIONS
//     retry: 1,
//   });

// * EXPOSE EACH SLICE OF GA DATA SEPARATELY SO COMPONENTS CAN DESTRUCTURE ONLY WHAT THEY NEED
// * ?? [] ENSURES ARRAYS ARE NEVER UNDEFINED — SAFE TO MAP OVER WITHOUT NULL CHECKS IN COMPONENTS
//   return {
//     summary: data?.summary,              // * AGGREGATE NUMBERS: USERS, SESSIONS, BOUNCE RATE, ETC.
//     dailyData: data?.dailyData ?? [],    // * PER-DAY ARRAY — USED TO DRAW THE TREND LINE CHART
//     trafficSources: data?.trafficSources ?? [], // * WHERE VISITORS CAME FROM (GOOGLE, DIRECT, ETC.)
//     cities: data?.cities ?? [],          // * TOP CITIES BY ACTIVE USERS
//     isLoading,  // * TRUE WHILE THE REQUEST IS IN FLIGHT — USE TO SHOW A SPINNER
//     isError,    // * TRUE IF THE REQUEST FAILED AFTER ALL RETRIES
//     error,      // * THE ACTUAL ERROR OBJECT — USEFUL FOR DISPLAYING AN ERROR MESSAGE
//   };
// }
