// import 'server-only';

import { genSaltSync, hashSync } from 'bcrypt-ts';
import {
  and,
  asc,
  desc,
  eq,
  gt,
  gte,
  inArray,
  lt,
  type SQL,
} from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import crypto from 'crypto';
import { sql } from '@vercel/postgres';

import {
  User,
  chat,
  type User as UserType,
  document,
  type Suggestion,
  suggestion,
  message,
  vote,
  type DBMessage,
} from './schema';
import type { ArtifactKind } from '@/components/artifact';

// Optionally, if not using email/pass login, you can
// use the Drizzle adapter for Auth.js / NextAuth
// https://authjs.dev/reference/adapter/drizzle

// biome-ignore lint: Forbidden non-null assertion.
const client = postgres(process.env.POSTGRES_URL!);
const db = drizzle(client);

// 创建一个标记以区分环境
const isServer = typeof window === 'undefined';

// 将函数分类为客户端安全和服务端专用
// 客户端安全函数 - 可以在任何地方使用
export function clientSafeFunction1() {
  // 实现...
}

export function clientSafeFunction2() {
  // 实现...
}

// 服务端专用函数 - 添加运行时检查
export function serverOnlyFunction1() {
  if (!isServer) {
    console.error('这个函数只能在服务器端使用');
    return null;
  }
  
  // 实现...
}

export function serverOnlyFunction2() {
  if (!isServer) {
    throw new Error('此函数只能在服务器上运行');
  }
  
  // 实现...
}

export const getUser = async (email: string) => {
  try {
    const result = await sql`SELECT * FROM "User" WHERE email=${email}`;
    return result.rows;
  } catch (error) {
    console.error('获取用户失败:', error);
    throw error;
  }
};

export async function createUser(email: string, password: string) {
  try {
    const hashedPassword = await hashSync(password, 10);
    
    // 生成一个 UUID 作为用户 ID
    const userId = crypto.randomUUID();
    
    // 确保日期是字符串
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt; // 初始时更新时间与创建时间相同
    
    // 修改插入语句，添加 id、points、level 和 updated_at 字段
    return await sql`
      INSERT INTO "User" (id, email, password, points, level, created_at, updated_at, name)
      VALUES (${userId}, ${email}, ${hashedPassword}, 0, 1, ${createdAt}, ${updatedAt}, null)
      RETURNING id, email, created_at
    `;
  } catch (error) {
    // 提供更详细的错误信息
    console.error('创建用户失败:', error);
    
    // 打印更多错误诊断信息
    if (error instanceof Error) {
      console.error('错误类型:', error.constructor.name);
      console.error('错误消息:', error.message);
      console.error('错误堆栈:', error.stack);
    }
    
    throw error;
  }
}

export async function saveChat({
  id,
  userId,
  title,
}: {
  id: string;
  userId: string;
  title: string;
}) {
  try {
    return await db.insert(chat).values({
      id,
      createdAt: new Date(),
      userId,
      title,
    });
  } catch (error) {
    console.error('Failed to save chat in database');
    throw error;
  }
}

export async function deleteChatById({ id }: { id: string }) {
  try {
    await db.delete(vote).where(eq(vote.chatId, id));
    await db.delete(message).where(eq(message.chatId, id));

    return await db.delete(chat).where(eq(chat.id, id));
  } catch (error) {
    console.error('Failed to delete chat by id from database');
    throw error;
  }
}

export async function getChatsByUserId({
  id,
  limit,
  startingAfter,
  endingBefore,
}: {
  id: string;
  limit: number;
  startingAfter: string | null;
  endingBefore: string | null;
}) {
  try {
    const extendedLimit = limit + 1;

    const query = (whereCondition?: SQL<any>) =>
      db
        .select()
        .from(chat)
        .where(
          whereCondition
            ? and(whereCondition, eq(chat.userId, id))
            : eq(chat.userId, id),
        )
        .orderBy(desc(chat.createdAt))
        .limit(extendedLimit);

    let filteredChats: Array<Chat> = [];

    if (startingAfter) {
      const [selectedChat] = await db
        .select()
        .from(chat)
        .where(eq(chat.id, startingAfter))
        .limit(1);

      if (!selectedChat) {
        throw new Error(`Chat with id ${startingAfter} not found`);
      }

      filteredChats = await query(gt(chat.createdAt, selectedChat.createdAt));
    } else if (endingBefore) {
      const [selectedChat] = await db
        .select()
        .from(chat)
        .where(eq(chat.id, endingBefore))
        .limit(1);

      if (!selectedChat) {
        throw new Error(`Chat with id ${endingBefore} not found`);
      }

      filteredChats = await query(lt(chat.createdAt, selectedChat.createdAt));
    } else {
      filteredChats = await query();
    }

    const hasMore = filteredChats.length > limit;

    return {
      chats: hasMore ? filteredChats.slice(0, limit) : filteredChats,
      hasMore,
    };
  } catch (error) {
    console.error('Failed to get chats by user from database');
    throw error;
  }
}

export async function getChatById({ id }: { id: string }) {
  try {
    const [selectedChat] = await db.select().from(chat).where(eq(chat.id, id));
    return selectedChat;
  } catch (error) {
    console.error('Failed to get chat by id from database');
    throw error;
  }
}

export async function saveMessages({
  messages,
}: {
  messages: Array<DBMessage>;
}) {
  try {
    return await db.insert(message).values(messages);
  } catch (error) {
    console.error('Failed to save messages in database', error);
    throw error;
  }
}

export async function getMessagesByChatId({ id }: { id: string }) {
  try {
    return await db
      .select()
      .from(message)
      .where(eq(message.chatId, id))
      .orderBy(asc(message.createdAt));
  } catch (error) {
    console.error('Failed to get messages by chat id from database', error);
    throw error;
  }
}

export async function voteMessage({
  chatId,
  messageId,
  type,
}: {
  chatId: string;
  messageId: string;
  type: 'up' | 'down';
}) {
  try {
    const [existingVote] = await db
      .select()
      .from(vote)
      .where(and(eq(vote.messageId, messageId)));

    if (existingVote) {
      return await db
        .update(vote)
        .set({ isUpvoted: type === 'up' })
        .where(and(eq(vote.messageId, messageId), eq(vote.chatId, chatId)));
    }
    return await db.insert(vote).values({
      chatId,
      messageId,
      isUpvoted: type === 'up',
    });
  } catch (error) {
    console.error('Failed to upvote message in database', error);
    throw error;
  }
}

export async function getVotesByChatId({ id }: { id: string }) {
  try {
    return await db.select().from(vote).where(eq(vote.chatId, id));
  } catch (error) {
    console.error('Failed to get votes by chat id from database', error);
    throw error;
  }
}

export async function saveDocument({
  id,
  title,
  kind,
  content,
  userId,
}: {
  id: string;
  title: string;
  kind: ArtifactKind;
  content: string;
  userId: string;
}) {
  try {
    return await db
      .insert(document)
      .values({
        id,
        title,
        kind,
        content,
        userId,
        createdAt: new Date(),
      })
      .returning();
  } catch (error) {
    console.error('Failed to save document in database');
    throw error;
  }
}

export async function getDocumentsById({ id }: { id: string }) {
  try {
    const documents = await db
      .select()
      .from(document)
      .where(eq(document.id, id))
      .orderBy(asc(document.createdAt));

    return documents;
  } catch (error) {
    console.error('Failed to get document by id from database');
    throw error;
  }
}

export async function getDocumentById({ id }: { id: string }) {
  try {
    const [selectedDocument] = await db
      .select()
      .from(document)
      .where(eq(document.id, id))
      .orderBy(desc(document.createdAt));

    return selectedDocument;
  } catch (error) {
    console.error('Failed to get document by id from database');
    throw error;
  }
}

export async function deleteDocumentsByIdAfterTimestamp({
  id,
  timestamp,
}: {
  id: string;
  timestamp: Date;
}) {
  try {
    await db
      .delete(suggestion)
      .where(
        and(
          eq(suggestion.documentId, id),
          gt(suggestion.documentCreatedAt, timestamp),
        ),
      );

    return await db
      .delete(document)
      .where(and(eq(document.id, id), gt(document.createdAt, timestamp)))
      .returning();
  } catch (error) {
    console.error(
      'Failed to delete documents by id after timestamp from database',
    );
    throw error;
  }
}

export async function saveSuggestions({
  suggestions,
}: {
  suggestions: Array<Suggestion>;
}) {
  try {
    return await db.insert(suggestion).values(suggestions);
  } catch (error) {
    console.error('Failed to save suggestions in database');
    throw error;
  }
}

export async function getSuggestionsByDocumentId({
  documentId,
}: {
  documentId: string;
}) {
  try {
    return await db
      .select()
      .from(suggestion)
      .where(and(eq(suggestion.documentId, documentId)));
  } catch (error) {
    console.error(
      'Failed to get suggestions by document version from database',
    );
    throw error;
  }
}

export async function getMessageById({ id }: { id: string }) {
  try {
    console.log('查询消息ID:', id);
    const result = await db.select()
      .from(message)
      .where(eq(message.id, id));
    
    if (!result || result.length === 0) {
      console.log('未找到消息ID:', id);
      return []; // 返回空数组而不是抛出错误
    }
    
    console.log('找到消息:', result[0].id, '聊天ID:', result[0].chatId);
    return result;
  } catch (error) {
    console.error('查询消息时出错:', error);
    return []; // 出错时返回空数组
  }
}

export async function deleteMessagesByChatIdAfterTimestamp({
  chatId,
  timestamp,
}: {
  chatId: string;
  timestamp: Date;
}) {
  try {
    const messagesToDelete = await db
      .select({ id: message.id })
      .from(message)
      .where(
        and(eq(message.chatId, chatId), gte(message.createdAt, timestamp)),
      );

    const messageIds = messagesToDelete.map((message) => message.id);

    if (messageIds.length > 0) {
      await db
        .delete(vote)
        .where(
          and(eq(vote.chatId, chatId), inArray(vote.messageId, messageIds)),
        );

      return await db
        .delete(message)
        .where(
          and(eq(message.chatId, chatId), inArray(message.id, messageIds)),
        );
    }
  } catch (error) {
    console.error(
      'Failed to delete messages by id after timestamp from database',
    );
    throw error;
  }
}

export async function updateChatVisiblityById({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: 'private' | 'public';
}) {
  try {
    return await db.update(chat).set({ visibility }).where(eq(chat.id, chatId));
  } catch (error) {
    console.error('Failed to update chat visibility in database');
    throw error;
  }
}

export async function getChatHistory({ limit }: { limit: number }) {
  try {
    console.log('获取聊天历史，限制:', limit);
    // 先获取聊天记录
    const chats = await db.select()
      .from(chat)
      .orderBy(desc(chat.createdAt))
      .limit(limit);
    
    // 如果需要获取每个聊天的消息，需要单独查询
    const result = await Promise.all(
      chats.map(async (chatItem) => {
        const messages = await db.select()
          .from(message)
          .where(eq(message.chatId, chatItem.id))
          .orderBy(asc(message.createdAt));
        
        return {
          ...chatItem,
          messages
        };
      })
    );
    
    console.log(`找到 ${result.length} 个聊天记录`);
    if (result.length > 0) {
      console.log(`第一个聊天有 ${result[0].messages.length} 条消息`);
    }
    
    return result;
  } catch (error) {
    console.error('获取聊天历史出错:', error);
    return [];
  }
}

// 添加通过邮箱查询用户的功能
export async function getUserByEmail(email: string) {
  try {
    // 使用sql查询来获取用户
    const result = await sql`
      SELECT * FROM "User" WHERE email = ${email}
    `;
    return result.rows;
  } catch (error) {
    console.error('通过邮箱查询用户失败:', error);
    throw error;
  }
}

// 直接在文件中定义Chat类型
type Chat = {
  id: string;
  createdAt: Date;
  userId: string;
  title: string;
  visibility?: 'public' | 'private';
  [key: string]: any;
};
