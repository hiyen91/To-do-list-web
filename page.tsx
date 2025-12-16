import { auth, signIn, signOut } from "@/auth"
import { prisma } from "@/lib/prisma"
import { createTodo, deleteTodo, toggleStatus, registerUser } from "./actions" // Import thêm registerUser
import TodoList from "./ToDoList"

export default async function Home() {
  const session = await auth()

  // === MÀN HÌNH CHƯA ĐĂNG NHẬP (LOGIN / REGISTER) ===
  if (!session?.user) {
    return (
      <div className="min-h-screen bg-pink-50 flex items-center justify-center p-4 text-gray-900">
        {/* Lớp nền hoa rơi */}
        <div className="absolute inset-0 petals-background pointer-events-none"></div>

        <div 
          // Cập nhật padding lớn hơn (p-12) và bo tròn (rounded-3xl)
          className="bg-white p-12 rounded-3xl shadow-2xl w-full max-w-sm border border-pink-100 
                     transition duration-500 hover:shadow-3xl hover:scale-[1.01] ease-in-out relative z-10" 
        >
          <h1 className="text-3xl font-extrabold mb-8 text-center text-pink-600">Đăng nhập để bắt đầu</h1>

          {/* Form Đăng nhập - Khoảng cách tốt hơn */}
          <div className="mb-8 border-b pb-6 border-pink-200">
            <h2 className="font-bold text-lg mb-5 text-gray-800">Đăng nhập Tài khoản</h2>
            <form
              action={async (formData) => {
                "use server"
                await signIn("credentials", formData)
              }}
              className="flex flex-col gap-4"
            >
              <input name="email" type="email" placeholder="Email" required className="p-3 border border-pink-300 rounded-xl text-black focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none" />
              <input name="password" type="password" placeholder="Mật khẩu" required className="p-3 border border-pink-300 rounded-xl text-black focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none" />
              <button className="bg-pink-600 text-white py-3 rounded-xl font-bold hover:bg-pink-700 transition shadow-lg hover:shadow-md">
                Đăng nhập
              </button>
            </form>
          </div>

          {/* Nút Google - Căn giữa và sạch sẽ */}
          <div className="mb-8">
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="flex-shrink mx-4 text-gray-400 text-sm font-medium">HOẶC</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>
            <form action={async () => { "use server"; await signIn("google") }}>
              <button className="w-full border border-pink-300 text-gray-700 font-bold py-3 rounded-xl hover:bg-pink-50 transition flex items-center justify-center gap-2 shadow-md">
                {/* ICON GOOGLE SVG */}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.62-.06-1.22-.16-1.79H12v3.62h5.36c-.22 1.16-.84 2.16-1.76 2.88v2.33h3.01c1.76-1.62 2.77-4 2.77-6.94z" fill="#4285F4"/>
                    <path d="M12 23c3.04 0 5.57-1 7.42-2.77l-3.01-2.33c-.83.56-1.92.89-3.41.89-2.64 0-4.88-1.77-5.69-4.17H3.3V18.1c1.86 3.7 5.86 5.9 8.7 5.9z" fill="#34A853"/>
                    <path d="M5.56 14.1c-.13-.42-.2-.86-.2-1.3s.07-.88.2-1.3V9.1H2.5C2.17 9.87 2 10.9 2 12s.17 2.13.5 2.9l3.06-2.9z" fill="#FBBC05"/>
                    <path d="M12 4.75c1.66 0 3.13.57 4.3 1.69l2.67-2.67C17.57 2.37 15.04 1 12 1 8.86 1 5.86 3.2 4.15 6.9l3.06 2.4c.81-2.4 3.05-4.15 5.79-4.15z" fill="#EA4335"/>
                </svg>
                <span>Tiếp tục với Google</span>
              </button>
            </form>
          </div>

          {/* Form Đăng ký */}
          <div>
            <h2 className="font-semibold mb-3 border-b border-pink-200 pb-2 text-sm text-gray-500">Chưa có tài khoản? Đăng ký ngay</h2>
            <form action={registerUser} className="flex flex-col gap-3">
              <input name="name" type="text" placeholder="Tên hiển thị" required className="p-3 border border-gray-300 rounded-xl text-black focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none" />
              <input name="email" type="email" placeholder="Email đăng ký" required className="p-3 border border-gray-300 rounded-xl text-black focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none" />
              <input name="password" type="password" placeholder="Mật khẩu mới" required className="p-3 border border-gray-300 rounded-xl text-black focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none" />
              <button className="bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 transition shadow-lg hover:shadow-md">
                Đăng ký tài khoản
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  // === MÀN HÌNH ĐÃ ĐĂNG NHẬP (DASHBOARD) ===
  const todos = await prisma.todo.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" }
  })

  return (
    // Nền màu hồng nhạt
    <div className="min-h-screen bg-pink-50 p-4 md:p-10 text-gray-900">
      <div className="absolute inset-0 petals-background pointer-events-none"></div>

      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Header - Thẻ hình viên thuốc (Pill-shaped) và đổ bóng nổi bật */}
        <div 
          className="flex justify-between items-center mb-12 bg-white p-3 px-6 rounded-full shadow-xl border border-pink-200 
                     transition duration-300 hover:shadow-2xl"
        >
          <div className="flex items-center gap-4">
            {session.user.image ? (
              <img src={session.user.image} alt="Avatar" className="w-10 h-10 rounded-full border-2 border-pink-500 shadow-md" />
            ) : (
              // Avatar mặc định bo tròn và kích thước hợp lý
              <div className="w-10 h-10 rounded-full bg-pink-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                {session.user.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className="font-bold text-base text-gray-800">{session.user.name}</p>
              <p className="text-xs text-gray-500">{session.user.email}</p>
            </div>
          </div>
          <form action={async () => { "use server"; await signOut() }}>
            <button className="text-sm text-gray-500 hover:text-red-500 hover:bg-red-50 px-4 py-2 rounded-full font-medium transition">
              Đăng xuất
            </button>
          </form>
        </div>

        {/* Form thêm mới - Rõ ràng, form-grouping */}
        <div 
          className="bg-white p-8 rounded-3xl shadow-xl mb-10 border border-pink-200 
                     transition duration-300 hover:shadow-2xl"
        >
          <h2 className="text-2xl font-bold mb-6 text-pink-600 border-b pb-3 border-pink-100">Thêm công việc mới</h2>
          <form action={createTodo} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
            
            <div className="col-span-1 md:col-span-3">
              <label className="block text-sm font-medium text-gray-600 mb-2">Nội dung công việc</label>
              <input 
                name="text" 
                required 
                placeholder="Ví dụ: Nộp báo cáo..." 
                className="w-full border border-pink-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-pink-500 outline-none"
              />
            </div>
            
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-600 mb-2">Hạn chót (Deadline)</label>
              <input 
                type="datetime-local" 
                name="deadline" 
                className="w-full border border-pink-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-pink-500 outline-none"
              />
            </div>
            
            <button className="col-span-1 md:col-span-1 bg-pink-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-pink-700 transition shadow-lg w-full">
              Thêm
            </button>
          </form>
        </div>

        <TodoList 
          initialTodos={todos} 
          onToggle={toggleStatus} 
          onDelete={deleteTodo} 
        />
        
      </div>
    </div>
  )
}