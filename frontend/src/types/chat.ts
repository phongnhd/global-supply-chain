export type Message = {
  id: string;
  sender: "user" | "support";
  content: string;
  createdAt?: number;
};