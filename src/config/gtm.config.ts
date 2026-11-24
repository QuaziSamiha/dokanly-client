import { GTM_ID } from "@/config/env.config";

export const getGtmId = (): string | undefined => GTM_ID;

export const isAnalyticsEnabled = (): boolean => Boolean(GTM_ID);
