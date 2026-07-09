import { AssistantChat } from "@/components/assistant/assistant-chat";
import { requireUser } from "@/lib/auth";

export const metadata = {
  title: "Assistant · Genshin Material Tracker",
};

export default async function AssistantPage() {
  await requireUser();

  return <AssistantChat />;
}
