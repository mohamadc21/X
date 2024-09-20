import mysql from 'mysql2/promise';
import { ITwitt, User, UserFollowingsAndFollowers, UserFollowingsAndFollowersTable } from "./definitions";

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

export async function getAlltwitts({ byUsername = false, username }: { byUsername?: boolean, username?: string } = {}): Promise<ITwitt[]> {
  const selectByUsername = byUsername && username ? ' where users.username = ? ' : ' ';
  const params: any[] = [];
  if (byUsername) {
    params.push(username);
  }

  const allTwitts = await query<ITwitt>(`select twitts.id, twitts.text, twitts.media, twitts.created_at, twitts.media_type, twitts.likes, twitts.views, twitts.reply_to, twitts.comments, twitts.retwitts, users.id as user_id, users.username, users.name, users.profile as user_profile from twitts join users on twitts.user_id = users.id${selectByUsername}order by twitts.id desc`, params);

  return allTwitts;
}

export async function getTwittComments(twitt_id: number | string) {
  const comments = await query<ITwitt>("select twitts.id, twitts.text, twitts.media, twitts.created_at, twitts.media_type, twitts.likes, twitts.views, twitts.reply_to, users.username, users.name, users.profile as user_profile from twitts join users on twitts.user_id = users.id where reply_to = ? order by twitts.id desc", [twitt_id]);

  return comments;
}

export async function getUserByUsername(username: string): Promise<(User & { twitts: ITwitt[] }) | null> {
  const result = await query<User>("select * from users where username = ?", [username]);

  if (result.length < 1) return null;
  const userTwitts = await getAlltwitts({ byUsername: true, username });

  return {
    ...result[0],
    twitts: userTwitts
  };
}

export async function getUserById(id: number | string): Promise<(User & { twitts: ITwitt[] }) | null> {
  const result = await query<User>("select * from users where id = ?", [id]);

  if (result.length < 1) return null;
  const userTwitts = await getAlltwitts({ byUsername: true, username: result[0].username! });

  return {
    ...result[0],
    twitts: userTwitts
  };
}

export async function getUserFollowersAndFollowings(user_id: number | string): Promise<UserFollowingsAndFollowers> {
  const result = await query<UserFollowingsAndFollowersTable>("select * from follows where following_id = ? or follower_id = ?", [user_id, user_id]);

  const followers = result.filter(follow => follow.following_id == user_id).map(follow => follow.follower_id);
  const followings = result.filter(follow => follow.follower_id == user_id).map(follow => follow.following_id);
  return {
    followers: followers,
    followings: followings
  };
}