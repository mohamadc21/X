import mysql from 'mysql2/promise';
import { ITwitt } from "./definitions";

export const connectionConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 25777,
}

export async function query<T>(query: string, values: (string | number | boolean)[] = []): Promise<T[]> {
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
  const allTwitts = await query<ITwitt>("select twitts.id, twitts.text, twitts.media, twitts.created_at, twitts.media_type, users.username, users.name, users.profile as user_profile from twitts join users on twitts.user_id = users.id order by twitts.id desc");

  return allTwitts;
}