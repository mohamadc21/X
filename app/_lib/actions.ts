"use server";

import { ID } from "appwrite";
import bcrypt from 'bcryptjs';
import { AuthError } from "next-auth";
import { revalidatePath } from "next/cache";
import { storage } from "./appwrite";
import { signIn, signOut } from "./auth";
import { query } from "./db";
import { ActionError, AddTwitt, ITwitt, PasswordData, SignupData, User, UserFollowingsAndFollowers, UserFollowingsAndFollowersTable, Verification } from "./definitions";
import { sendMail } from "./sendMail";
import { ResultSetHeader } from "mysql2";

interface CredentialsData extends SignupData, PasswordData { }

interface OAuthData {
  name: string,
  email: string,
  image: string,
  password: null
}

export async function getAlltwitts({ byUsername = false, username, with_reply = false }: { byUsername?: boolean, username?: string, with_reply?: boolean } = {}): Promise<ITwitt[]> {
  const condition = `${byUsername && username ? 'where users.username = ?' : ''} ${!with_reply ? 'and reply_to is null' : ''}`;
  const params: any[] = [];

  if (byUsername) {
    params.push(username);
  }

  const allTwitts = await query<ITwitt[]>(`select twitts.id, twitts.text, twitts.media, twitts.created_at, twitts.media_type, twitts.likes, twitts.views, twitts.reply_to, twitts.comments, twitts.retwitts, users.id as user_id, users.username, users.name, users.profile as user_profile from twitts join users on twitts.user_id = users.id ${condition} order by twitts.id desc`, params);

  return allTwitts;
}

export async function logOut() {
  await signOut();
}

export async function getTwittById(id: number | string): Promise<ITwitt | null> {
  const [twitt] = await query<ITwitt[]>('select twitts.id, twitts.text, twitts.media, twitts.created_at, twitts.media_type, twitts.likes, twitts.views, twitts.reply_to, twitts.comments, twitts.retwitts, users.id as user_id, users.username, users.name, users.profile as user_profile from twitts join users on twitts.user_id = users.id where twitts.id = ? order by twitts.id desc', [id]);
  if (!twitt) return null

  return twitt;
}

export async function getTwittComments(twitt_id: number | string) {
  const comments = await query<ITwitt[]>("select twitts.id, twitts.text, twitts.media, twitts.created_at, twitts.media_type, twitts.likes, twitts.views, twitts.reply_to, twitts.retwitts, twitts.comments, users.id as user_id, users.username, users.name, users.profile as user_profile from twitts join users on twitts.user_id = users.id where twitts.reply_to = ? order by twitts.id desc", [twitt_id]);

  return comments;
}

export async function getUserByUsername(username: string, twittsWithReply: boolean = false): Promise<(User & { twitts: ITwitt[] }) | null> {
  const result = await query<User[]>("select * from users where username = ?", [username]);

  if (result.length < 1) return null;
  const userTwitts = await getAlltwitts({ byUsername: true, username, with_reply: twittsWithReply });

  return {
    ...result[0],
    twitts: userTwitts
  };
}

export async function getUserById(id: number | string, twittsWithReply: boolean = false): Promise<(User & { twitts: ITwitt[] }) | null> {
  const result = await query<User[]>("select * from users where id = ?", [id]);

  if (result.length < 1) return null;
  const userTwitts = await getAlltwitts({ byUsername: true, username: result[0].username!, with_reply: twittsWithReply });

  return {
    ...result[0],
    twitts: userTwitts
  };
}

export async function getUserFollowersAndFollowings(user_id: number | string): Promise<UserFollowingsAndFollowers> {
  const result = await query<UserFollowingsAndFollowersTable[]>("select * from follows where following_id = ? or follower_id = ?", [user_id, user_id]);

  const followers = result.filter(follow => follow.following_id == user_id).map(follow => follow.follower_id);
  const followings = result.filter(follow => follow.follower_id == user_id).map(follow => follow.following_id);
  return {
    followers: followers,
    followings: followings
  };
}

export async function deleteTwitt(twitt_id: number | string) {
  const twitt = await query<ITwitt[]>("select * from twitts where id = ?", [twitt_id]);
  async function deleteComments() {
    twitt[0].comments.forEach(async (comment) => {
      await query("delete from twitts where id = ?", [comment]);
    })
  }
  if (twitt[0].reply_to) {
    const replyedtoTwitt = await query<{ comments: number[] }[]>("select comments from twitts where id = ?", [twitt[0].reply_to]);
    await Promise.all([
      query("delete from twitts where id = ?", [twitt_id]),
      query("update twitts set comments = ? where id = ?", [`"${replyedtoTwitt[0].comments.filter(comment => comment != twitt_id)}"`, twitt[0].reply_to]),
      twitt[0].comments.length ? deleteComments() : null
    ]);
  } else {
    await query("delete from twitts where id = ?", [twitt_id]);
  }
}

export async function signinWithGoogle() {
  await signIn('google', {
    redirectTo: '/home'
  })
}

export async function checkExistsEmail(email: string): Promise<boolean> {
  const result = await query<{ total_users: number }[]>("select count(*) as total_users from users where email=?", [email]);
  return result[0].total_users > 0;
}

export async function sendVerification(email: string) {
  const code = Math.floor(Math.random() * (99999 - 10000 + 1)) + 10000;
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 2);

  try {
    await sendMail({
      to: email,
      replyTo: email,
      subject: `${code} is your verification code`,
      html: `<div style="width:100%;padding-top:4rem;display:grid">
            <div style="width:100%;max-width:400px; margin:0 auto">
              <div style="text-align:right">
                <img src="https://ci3.googleusercontent.com/meips/ADKq_NZv1LPCO7Dm0Tbxgo4wYzgVc98KD0XOwdh2ApRPvtcVePA5mJQh7FXBNxGjHCxLDdp2iqKqET39bJqpw3weaVsdP-zGJWNJ03cPCASbcXV1iX1pp3bCY7bzGZIUIvhYSBY9_zU=s0-d-e1-ft#https://ton.twitter.com/twitter_blue_for_business/verified-programs/x_logo.png" width="30" height="30" class="CToWUd" data-bit="iit">
              </div>
              <h1 style="margin-bottom:14px; margin-top:27px">Confirm your email address</h1>
              <p style="margin-bottom:12px;font-size:1rem">There’s one quick step you need to complete before creating your X account. Let’s make sure this is the right email address for you — please confirm this is the right address to use for your new account.</p>
              <div style="margin-bottom:12px">
                <p style="font-size:1rem">Please enter this verification code to get started on X:</p>
                <h1>${code}</h1>
              </div>
    
              <p style="font-size:1rem">
                Verification codes expire after two hours.
              </p>
              <p style="font-size:1rem">
                Thanks,
                X
              </p>
            </div>
          </div>
        `
    });

    const oldVerification = await query<{ total_verifications: number }[]>("select count(*) as total_verifications from verifications where email=?", [email]);
    let result;
    if (oldVerification[0].total_verifications > 0) {
      result = await query("update verifications set code=?,expires_at=?", [code, expiresAt.toISOString()]);
    } else {
      result = await query("insert into verifications (email, code, expires_at) values (?, ?, ?)", [email, code, expiresAt.toISOString()]);
    }
  } catch (err) {
    console.error(err);
  }

}

export async function sendPasswordResetVerification(email: string) {
  const code = Math.floor(Math.random() * (99999 - 10000 + 1)) + 10000;
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 2);

  try {
    await sendMail({
      to: email,
      replyTo: email,
      subject: `${code} is your verification code`,
      html: `<div style="width:100%;padding-top:4rem;display:grid">
            <div style="width:100%;max-width:400px; margin:0 auto">
              <div style="text-align:right">
                <img src="https://ci3.googleusercontent.com/meips/ADKq_NZv1LPCO7Dm0Tbxgo4wYzgVc98KD0XOwdh2ApRPvtcVePA5mJQh7FXBNxGjHCxLDdp2iqKqET39bJqpw3weaVsdP-zGJWNJ03cPCASbcXV1iX1pp3bCY7bzGZIUIvhYSBY9_zU=s0-d-e1-ft#https://ton.twitter.com/twitter_blue_for_business/verified-programs/x_logo.png" width="30" height="30" class="CToWUd" data-bit="iit">
              </div>
              <h1 style="margin-bottom:14px; margin-top:27px">Reset your password?</h1>
              <p style="margin-bottom:12px;font-size:1rem">If you requested a password reset for @Mohamadc21, use the confirmation code below to complete the process. If you didn't make this request, ignore this email.</p>
              <div style="margin-bottom:12px">
                <h3>${code}</h3>
              </div>
    
              <div>
                <h2 style="margin-bottom: 4px;">Getting a lot of password reset emails?</h2>
                <p style="font-size:1rem">
                You can change your account settings to require personal information to reset your password.
                </p>
              </div>
            </div>
          </div>
        `
    });

    const oldVerification = await query<{ total_verifications: number }[]>("select count(*) as total_verifications from verifications where email=?", [email]);
    let result;
    if (oldVerification[0].total_verifications > 0) {
      result = await query("update verifications set code=?,expires_at=?", [code, expiresAt.toISOString()]);
    } else {
      result = await query("insert into verifications (email, code, expires_at) values (?, ?, ?)", [email, code, expiresAt.toISOString()]);
    }
  } catch (err) {
    console.error(err);
  }

}

export async function checkVerificationCode(email: string, code: string | number): Promise<ActionError> {
  const result = await query<Verification[]>("select * from verifications where email=? and code=?", [email, code]);

  if (result.length < 1) return { message: 'verification is not correct' }

  const now = new Date().setHours(new Date().getHours() + 1);
  const timeDifference = Math.floor((now - Date.parse(result[0].expires_at.toString())) / 1000);

  if (timeDifference < -7200) {
    return { message: 'Verification expired' }
  }
}

export async function signinWithCredentials(data: { email_username: string, password: string }): Promise<ActionError> {

  try {
    await signIn('credentials', {
      email: data.email_username,
      password: data.password,
      redirect: false,
    });
  } catch (err: any) {
    if (err instanceof AuthError) {
      return { message: err.message };
    }
    console.error(err.message);
    return { message: 'something went wrong. try again later' }
  }
}

export async function signupWithCredentials(data: CredentialsData): Promise<ActionError> {
  const { name, email, password, year, month, day } = data;
  const birthDay = new Date(`${year}-${month}-${day}`).toISOString();
  const hashedPass = await bcrypt.hash(password, 10);
  const username = name.split(' ')[0] + Math.floor(Math.random() * (99999 - 10000 + 1)) + 10000;
  const defaultProfile = 'https://cloud.appwrite.io/v1/storage/buckets/66d0a02800176fb696ad/files/66ede78f000632afeb19/view?project=66d09f8b003509928242&project=66d09f8b003509928242';

  try {
    await query("insert into users (name, email, password, username, profile, birthday) values (?,?,?,?,?, ?)", [name, email, hashedPass, username, defaultProfile, birthDay]);
    await signIn('credentials', { email, password, redirect: false });
  } catch (err) {
    if (err instanceof AuthError) {
      return {
        message: err.message
      }
    } else {
      return {
        message: 'an error occurred.'
      }
    }
  }
}

export async function signupWithOAuth(data: OAuthData): Promise<ActionError> {
  const { name, email, image } = data;
  const username = name.split(' ').join('').slice(0, 8) + (Math.floor(Math.random() * (99999 - 10000 + 1)) + 10000);

  try {
    await query("insert into users (name, email, username, profile) values (?,?,?,?)", [name, email, username, image]);
    await signIn('credentials', { email, redirect: false });
  } catch (err) {
    if (err instanceof AuthError) {
      return {
        message: err.message
      }
    } else {
      return {
        message: 'an error occurred.'
      }
    }
  }
}

export async function uploadProfile(formData: FormData) {

  const file = <File>formData.get('upload')!;
  const email = <string>formData.get('email')!;

  if (!file.type.startsWith('image/')) {
    throw new Error("image type not allowed. only image files allowed.");
  }

  // const fileSize = Math.floor(file.size / 1024);
  // if (fileSize > 700) return {
  //   message: 'upload size must be less than 700 KB.'
  // };

  try {
    const upload = await storage.createFile(
      process.env.APPWRITE_PROFILES_BUCKET_ID!,
      ID.unique(),
      file
    );

    const uploadUrl = storage.getFileView(process.env.APPWRITE_PROFILES_BUCKET_ID!, upload.$id);

    await query("update users set profile = ? where email = ?", [uploadUrl.toString(), email])

  } catch (err: any) {
    console.error(err);
    throw new Error(err.message);
  }

}

export async function uploadHeaderPhoto(formData: FormData) {

  const file = <File>formData.get('upload')!;
  if (!file.type.startsWith('image/')) {
    throw new Error("image type not allowed. only image files allowed.");
  }

  const email = <string>formData.get('email')!;

  // const fileSize = Math.floor(file.size / 1024);
  // if (fileSize > 700) return {
  //   message: 'upload size must be less than 700 KB.'
  // };

  try {
    const upload = await storage.createFile(
      process.env.APPWRITE_USERS_HEADER_PHOTO_BUCKET_ID!,
      ID.unique(),
      file
    );

    const uploadUrl = storage.getFileView(process.env.APPWRITE_USERS_HEADER_PHOTO_BUCKET_ID!, upload.$id);

    await query("update users set header_photo = ? where email = ?", [uploadUrl.toString(), email])

  } catch (err: any) {
    console.error(err);
    throw new Error(err.message);
  }

}

export async function uploadTwittMedia(formData: FormData) {

  const file = <File>formData.get('media');

  if (!file.type.startsWith('video/')) {
    throw new Error("media type not allowed. only image/gif and video files allowed.");
  }

  try {
    const upload = await storage.createFile(
      process.env.APPWRITE_TWITT_IMAGES_BUCKET_ID!,
      ID.unique(),
      file
    );

    const uploadUrl = storage.getFileView(process.env.APPWRITE_TWITT_IMAGES_BUCKET_ID!, upload.$id);

    return uploadUrl.toString();

  } catch (err: any) {
    console.error(err);
    throw new Error(err.message);
  }

}

export async function usernameIsUnique(username: string): Promise<boolean> {
  const result = await query<{ total_usernames: number }[]>("select count(*) as total_usernames from users where username=?", [username]);
  return result[0].total_usernames < 1;
}

export async function updateUsername(username: string, email: string): Promise<ActionError> {
  try {
    const isUnqiue = await usernameIsUnique(username);
    if (!isUnqiue) return {
      message: 'Username already has been taken. choose something different'
    }
    await query("update users set username=? where email=?", [
      username, email
    ]);
  } catch (err) {
    return {
      message: 'an error occurred'
    }
  }
}

export async function checkExistsUserByEmailUsername(value: string, giveEmail: boolean = false): Promise<any> {
  const res = await query<{ email: string }[]>("select email from users where email = ? or username = ?", [value, value]);
  if (giveEmail) {
    return {
      exists: Boolean(res.length > 0),
      email: res.length > 0 ? res[0].email : null
    }
  }
  return res.length > 0;
}

export async function changePassword(email: string, password: string): Promise<ActionError> {
  const hashedPass = await bcrypt.hash(password, 10);
  try {
    await query("update users set password = ? where email = ?", [hashedPass, email]);
  } catch (err) {
    return {
      message: "an error occurred. try again later."
    }
  }
}

export async function addTwitt({ userId, text, formData, gif, replyTo }: AddTwitt): Promise<ActionError> {
  let fields = 'user_id, text, comments, likes, retwitts, views';
  let values = '?,?,?,?,?,?';
  let params = [userId, text, '[]', '[]', '[]', `[${userId}]`];

  if (formData?.get('media')) {
    try {
      const media = formData.get('media') as File;
      const uploadUrl = await uploadTwittMedia(formData);
      fields += ', media, media_type';
      values += ',?,?';
      params.push(uploadUrl, media.type.split('/')[0]);
    } catch (err: any) {
      console.error(err.message);
      return {
        message: 'an error occurred'
      }
    }
  }

  if (gif) {
    fields += ', media, media_type';
    values += ',?, ?';
    params.push(gif, 'gif');
  }

  if (replyTo) {
    fields += ', reply_to';
    values += ',?';
    params.push(replyTo);
  }

  try {
    const result = await query<ResultSetHeader>(`insert into twitts (${fields}) values (${values})`, params);
    if (replyTo) {
      await query("update twitts set comments = json_array_append(comments, '$', ?) where id = ?", [result.insertId.toString(), replyTo]);
    }
    revalidatePath('/home');
  } catch (err) {
    console.error(err);
    return { message: 'an error occurred' }
  }
}

export async function increaseTwittView(twitt_id: number | string, user_id: number | string) {

  const result = await query<{ views: number[] }[]>("select views from twitts where id = ?", [twitt_id]);

  if (result.length < 1) return;

  const views = result[0].views;

  const alreadyViewed = views.some(view => view === (typeof user_id === 'string' ? parseInt(user_id) : user_id));

  if (alreadyViewed) return;

  await Promise.all([
    query("update twitts set views = json_array_append(views, '$', ?) where id = ?", [user_id, <string>twitt_id])
  ]);
}

export async function likeTwitt({ twitt_id, user_id }: { twitt_id: number | string, user_id: number | string }) {
  const result = await query<{ likes: number[] }[]>("select likes from twitts where id = ? and json_contains(likes, ?)", [twitt_id, `"${user_id}"`]);

  if (!result.length) {
    await Promise.all([
      query("update twitts set likes = json_array_append(likes, '$', ?) where id = ?", [user_id, twitt_id])
    ]);
  } else {
    const likes = result[0].likes.filter(like => like != user_id);
    await Promise.all([
      query("update twitts set likes = ? where id = ?", [likes, twitt_id])
    ]);
  }
}

export async function follow(follower_id: number | string, following_id: number | string) {
  const exists = await query<{ id: number }[]>("select id from follows where follower_id = ? and following_id = ?", [follower_id, following_id]);
  if (exists.length > 0) return;

  await query("insert into follows (follower_id, following_id) values (?,?)", [
    follower_id,
    following_id
  ]);

}

export async function unFollow(follower_id: number | string, following_id: number | string) {
  await query("delete from follows where follower_id = ? and following_id = ?", [follower_id, following_id]);
}

export async function updateUserInfo(formData: FormData): Promise<ActionError> {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const username = formData.get("username") as string;
  const bio = formData.get("bio") as string;
  const website = formData.get("website") as string;
  const location = formData.get("location") as string;
  const header_photo_upload = formData.get("header_photo_upload") as string;
  const profile_photo_upload = formData.get("profile_photo_upload") as string;

  let updateQuery = "update users set name=?, bio=?, website=?, location=? where email = ?";
  const params = [name, bio, website, location, email];
  const promises: Promise<any>[] = [];
  const headerPhotoFormData = new FormData();
  const profilePhotoFormData = new FormData();

  promises.push(query(updateQuery, params));

  if (header_photo_upload) {
    headerPhotoFormData.append('upload', header_photo_upload);
    headerPhotoFormData.append('email', email);
    promises.push(uploadHeaderPhoto(headerPhotoFormData));
  }

  if (profile_photo_upload) {
    profilePhotoFormData.append('upload', profile_photo_upload);
    profilePhotoFormData.append('email', email);
    promises.push(uploadProfile(profilePhotoFormData));
  }

  try {
    await Promise.all(promises);
    revalidatePath('/', 'layout');
  } catch (err) {
    console.error(err);
    return { message: "an error occurred" };
  }

}

export async function getUserTwittsByMedia(user_id: number | string) {
  const twitts = await query<ITwitt[]>(`select twitts.id, twitts.text, twitts.media, twitts.created_at, twitts.media_type, twitts.likes, twitts.views, twitts.reply_to, twitts.comments, twitts.retwitts, users.id as user_id, users.username, users.name, users.profile as user_profile from twitts join users on twitts.user_id = users.id where users.id = ? or users.username = ? and not media is null order by twitts.id desc`, [user_id, user_id]);
  return twitts;
}