// components/ChatMessage.tsx

type Message = {
  id: string;
  sender: "user" | "support";
  content: string;
};

export function ChatMessage({ message }: { message: Message }) {
  return (
<div className="mb-2">
  <div className="text-[11px] text-gray-400 mb-[2px]">
    {message.sender === "user" ? "You" : "Support"}
  </div>
  <div className="text-sm text-gray-800">
    {message.content}
  </div>
</div>
  );
}