import { cookies } from 'next/headers';
import { DEFAULT_CHAT_MODEL } from '@/lib/ai/models';
import { generateUUID } from '@/lib/utils';
import EnhancedChat from '@/components/enhanced-chat';

export default async function Page() {
  const id = generateUUID();
  const cookieStore = await cookies();
  const modelIdFromCookie = cookieStore.get('chat-model');
  const selectedModel = modelIdFromCookie?.value || DEFAULT_CHAT_MODEL;

  return <EnhancedChat id={id} selectedModel={selectedModel} />;
}
