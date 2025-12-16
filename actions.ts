"use server"

import { auth } from "@/auth" // Import từ file src/auth.ts
import { prisma } from "@/lib/prisma" // Import từ file src/lib/prisma.ts
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"

// Hàm đăng ký tài khoản
export async function registerUser(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) return;

  // Kiểm tra email đã tồn tại chưa
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    // Trong thực tế nên trả về lỗi để hiện lên UI, ở đây mình return tạm
    return;
  }

  // Mã hóa mật khẩu trước khi lưu
  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    }
  });
}

// 1. Hàm tạo công việc mới
export async function createTodo(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return

  const text = formData.get("text") as string
  const deadlineVal = formData.get("deadline") as string

  if (!text) return

  await prisma.todo.create({
    data: {
      text,
      // Nếu có deadline thì lưu, không thì null
      deadline: deadlineVal ? new Date(deadlineVal) : null,
      userId: session.user.id,
      status: "pending"
    }
  })
  
  // Làm mới lại trang để hiện dữ liệu mới
  revalidatePath("/")
}

// 2. Hàm đổi trạng thái (Pending <-> Done)
export async function toggleStatus(id: string, currentStatus: string) {
  const session = await auth()
  if (!session?.user?.id) return

  const newStatus = currentStatus === "pending" ? "done" : "pending"
  
  await prisma.todo.update({
    where: { 
      id, 
      userId: session.user.id // Bảo mật: Chỉ sửa nếu đúng là của user này
    },
    data: { 
      status: newStatus,
      finishedTime: newStatus === "done" ? new Date() : null
    }
  })
  revalidatePath("/")
}

// 3. Hàm xóa công việc
export async function deleteTodo(id: string) {
  const session = await auth()
  if (!session?.user?.id) return

  await prisma.todo.delete({
    where: { id, userId: session.user.id }
  })
  revalidatePath("/")
}

export async function updateTodo(
  id: string, 
  text: string, 
  deadline: string | null, 
  finishedTime: string | null
) {
  const session = await auth()
  if (!session?.user?.id) return

  // Tự động cập nhật trạng thái dựa trên thời gian hoàn thành
  // Nếu có ngày hoàn thành -> status là 'done', ngược lại là 'pending'
  const status = finishedTime ? "done" : "pending"

  await prisma.todo.update({
    where: { 
      id, 
      userId: session.user.id 
    },
    data: {
      text,
      deadline: deadline ? new Date(deadline) : null,
      finishedTime: finishedTime ? new Date(finishedTime) : null,
      status
    }
  })
  
  revalidatePath("/")
}