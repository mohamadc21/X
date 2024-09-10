"use server";

import { ID } from "appwrite";
import { storage } from "./appwrite";
import { auth, signIn, signOut } from "./auth";
import { getAlltwitts, query } from "./db";
import { ActionError, AddTwitt, PasswordData, SignupData, User, Verification } from "./definitions";
import { sendMail } from "./sendMail";
import { AuthError } from "next-auth";
import bcrypt from 'bcryptjs';
import { redirect } from "next/navigation";
import { pusherServer } from "./pusher";

interface CredentialsData extends SignupData, PasswordData { }
interface OAuthData {
  name: string,
  email: string,
  image: string,
  password: null
}

export async function signinWithGoogle() {
  await signIn('google', {
    redirectTo: '/home'
  })
}

export async function checkExistsEmail(email: string): Promise<boolean> {
  const result = await query<{ total_users: number }>("select count(*) as total_users from users where email=?", [email]);
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

    const oldVerification = await query<{ total_verifications: number }>("select count(*) as total_verifications from verifications where email=?", [email]);
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

    const oldVerification = await query<{ total_verifications: number }>("select count(*) as total_verifications from verifications where email=?", [email]);
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
  const result = await query<Verification>("select * from verifications where email=? and code=?", [email, code]);

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

  try {
    await query("insert into users (name, email, password, username, birthday) values (?,?,?,?,?)", [name, email, hashedPass, username, birthDay]);
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

export async function uploadProfile(formData: FormData): Promise<ActionError> {

  const allowedTypes = ['image/jpeg', 'image/pjp', 'image/png', 'image/jpg', 'image/pjpeg', 'image/jfif', 'image/webp']

  const file = <File>formData.get('upload')!;
  const email = <string>formData.get('email')!;
  const fileSize = Math.floor(file.size / 1024);

  if (!allowedTypes.includes(file.type)) return {
    message: `image type not allowed. only ${allowedTypes.join(', ')} files`
  };

  if (fileSize > 700) return {
    message: 'upload size must be less than 700 KB.'
  };

  try {
    const upload = await storage.createFile(
      process.env.APPWRITE_PROFILES_BUCKET_ID!,
      ID.unique(),
      file
    );

    const uploadUrl = storage.getFileView(process.env.APPWRITE_PROFILES_BUCKET_ID!, upload.$id);

    await query("update users set profile = ? where email = ?", [uploadUrl.toString(), email])

  } catch (err) {
    console.error(err);
    return {
      message: 'an error occurred'
    };
  }

}

export async function uploadTwittImage(formData: FormData): Promise<any> {

  const allowedTypes = ['image/jpeg', 'image/pjp', 'image/png', 'image/jpg', 'image/pjpeg', 'image/jfif', 'image/webp']

  const file = <File>formData.get('image');

  // if (!allowedTypes.includes(file.type)) {
  //   throw new Error(`image type not allowed. only ${allowedTypes.join(', ')} files`);
  // }

  try {
    const upload = await storage.createFile(
      process.env.APPWRITE_TWITT_IMAGES_BUCKET_ID!,
      ID.unique(),
      file
    );

    const uploadUrl = storage.getFileView(process.env.APPWRITE_TWITT_IMAGES_BUCKET_ID!, upload.$id);

    return uploadUrl.toString();

  } catch (err) {
    console.error(err);
    throw new Error('an error occurred');
  }

}

export async function usernameIsUnique(username: string): Promise<boolean> {
  const result = await query<{ total_usernames: number }>("select count(*) as total_usernames from users where username=?", [username]);
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
  const res = await query<{ email: string }>("select email from users where email = ? or username = ?", [value, value]);
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

export async function addTwitt({ userId, text, formData, gif }: AddTwitt): Promise<ActionError> {
  let fields = 'user_id, text';
  let values = '?,?';
  let params = [userId, text];

  if (formData?.get('image')) {
    try {
      const uploadUrl = await uploadTwittImage(formData);
      fields += ', media, media_type';
      values += ',?,?';
      params.push(uploadUrl, 'image');
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

  try {
    await query(`insert into twitts (${fields}) values (${values})`, params);
  } catch (err) {
    return { message: 'an error occurred' }
  }
}

export async function triggerTwitts() {
  try {
    const twitts = await getAlltwitts();
    await pusherServer.trigger('twitts', 'lastTwitt', twitts[0]);
  } catch (err) {
    console.error(err);
  }
}