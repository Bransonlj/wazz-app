export interface Message {
  _id: string;
  message: string;
  from: string;
  recipient: string;
  status: "sent" | "delivered" | "read";
  createdAt: string; // in iso date format
}