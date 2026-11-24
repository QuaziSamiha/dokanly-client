import { getServerSession } from "next-auth";
import { authOptions } from "../config/auth.config";

export const getUserSession = async () => await getServerSession(authOptions);
