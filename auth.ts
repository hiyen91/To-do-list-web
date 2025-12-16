import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" }, // Bắt buộc dùng JWT
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) return null;
        const email = credentials.email as string;
        const password = credentials.password as string;

        const user = await prisma.user.findUnique({ where: { email } });
        
        if (!user || !user.password) {
          throw new Error("Email không tồn tại hoặc sai mật khẩu.");
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) throw new Error("Sai mật khẩu.");

        return user;
      }
    })
  ],
  // === PHẦN QUAN TRỌNG CẦN THÊM VÀO ĐÂY ===
  callbacks: {
    // 1. Khi tạo Token, lưu ID của user vào token
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id; // 'sub' là trường chuẩn chứa ID
      }
      return token;
    },
    // 2. Khi tạo Session, lấy ID từ token nhét vào session
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    }
  }
})