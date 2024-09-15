import mysql from 'mysql2/promise';
import { ITwitt, UserViews } from "./definitions";

export const connectionConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 25777,
}

export async function query<T>(query: string, values: any[] = []): Promise<T[]> {
  const conn = await mysql.createConnection(connectionConfig);
  try {
    const [result] = await conn.execute(query, values);
    return <T[]>result || result;
  } catch (err: any) {
    console.error(err.message);
    throw new Error('database error.');
  } finally {
    conn.end();
  }
}

export async function getAlltwitts(): Promise<ITwitt[]> {
  const allTwitts = await query<ITwitt>("select twitts.id, twitts.text, twitts.media, twitts.created_at, twitts.media_type, twitts.likes, twitts.views, twitts.reply_to, twitts.comments, twitts.retwitts, users.id as user_id, users.username, users.name, users.profile as user_profile from twitts join users on twitts.user_id = users.id order by twitts.id desc");

  return allTwitts;
}

export async function getTwittComments(twitt_id: number | string) {
  const comments = await query<ITwitt>("select twitts.id, twitts.text, twitts.media, twitts.created_at, twitts.media_type, twitts.likes, twitts.views, twitts.reply_to, users.username, users.name, users.profile as user_profile from twitts join users on twitts.user_id = users.id where reply_to = ? order by twitts.id desc", [twitt_id]);

  return comments;
}