import { NextAuthConfig, DefaultSession, AuthError } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { query } from "./db";
import { User } from "./definitions";
import bcrypt from 'bcryptjs';
import { NextResponse } from "next/server";
import { headers } from "next/headers";

declare module "next-auth" {
  interface User {
    id?: string,
    email?: string | null,
    username?: string | null
  }

  interface Session {
    user: User & DefaultSession["user"]
    expires: string
    error: string
  }
}

class CustomAuthError extends AuthError {
  static type: string;

  constructor(message?: any) {
    super();

    // this.type = message;
    this.message = message;
  }
}

export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET
    }),
    Credentials({
      credentials: {
        email: {},
        password: {}
      },
      authorize: async (credentials) => {
        const res = await fetch("${process.env.AUTH_URL}/api/auth/user?email=" + credentials.email);
        if (res.status !== 200) throw new CustomAuthError('email or username not found');;
        const user: User = await res.json();

        if (!user) throw new CustomAuthError('email or username not found');

        if (credentials?.password) {
          const matchPasswords = await bcrypt.compare(<string>credentials.password, user.password);

          if (!matchPasswords) throw new CustomAuthError('Wrong password!');
        }


        return {
          id: user.id.toString(),
          name: user.name,
          email: user.email,
          image: user.profile,
        }
      },
    }),
  ],
  callbacks: {
    authorized: ({ request, auth }) => {
      if (request.nextUrl.pathname === '/home' && !auth?.user) {
        return NextResponse.redirect(new URL('/', request.url));
      }
      if (request.nextUrl.pathname === '/' && auth?.user) {
        return NextResponse.redirect(new URL('/home', request.url));
      }
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-pathname', request.nextUrl.pathname);

      if (auth?.user) {
        return NextResponse.next({
          request: {
            headers: requestHeaders
          }
        })
      }
      return false;
    },
    async session({ session, token }) {
      if (!token || !session) return session;
      const res = await fetch(`${process.env.AUTH_URL}/api/auth/user?email=` + session.user.email);
      if (res.status !== 200) return session;
      // throw new Error(`an error occurred in session callback: ${res.statusText}`);
      const data: User = await res.json();

      return {
        ...session,
        user: {
          ...session.user,
          name: data.name,
          id: data.id.toString(),
          image: data.profile,
          username: data.username,
        }
      }
    },
    signIn: async ({ user, credentials }) => {
      const res = await fetch(`${process.env.AUTH_URL}/api/auth/user?email=` + user.email);

      const data: User = await res.json();
      if (!data?.id) {

        let pass = null;
        if (credentials?.password) {
          pass = bcrypt.hashSync(credentials!.password as string, 10);
        }

        await fetch(`${process.env.AUTH_URL}/api/auth/user/create?type=${pass ? 'credentials' : 'oAuth'}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name: user.name,
            email: user.email,
            image: user.image,
            password: pass,
          })
        });
      }
      return true;
    }
  },
  pages: {
    signIn: '/',
    signOut: '/api/auth/logout',
  },
}
