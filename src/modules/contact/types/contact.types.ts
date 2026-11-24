/** The customer account a message was sent from. */
export interface IContactMessageUser {
  id: number;
  name: string;
  email: string;
  phone: string | null;
}

/** A contact message as GET /contact-messages returns it to an admin. */
export interface IContactMessage {
  id: number;
  sid: string;
  firstName: string;
  lastName: string | null;
  phone: string;
  message: string;
  email: string | null;
  replied: boolean;
  notes: string | null;
  userId: number | null;
  user?: IContactMessageUser;
  createdAt: string;
  updatedAt: string;
}

/** GET /contact-messages/stats */
export interface IContactMessageStats {
  total: number;
  pending: number;
  replied: number;
  today: number;
  last7Days: number;
  guests: number;
  customers: number;
}

export type ContactStatusFilter = "pending" | "replied";
export type ContactSenderFilter = "customer" | "guest";
export type ContactPeriodFilter = "today" | "week";
