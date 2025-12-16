"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Trash2, CheckCircle, Circle, Calendar, Search, Edit2, X, Save } from "lucide-react"
import { updateTodo } from "./actions" // Import hàm update vừa tạo

type Todo = {
  id: string
  text: string
  status: string
  deadline: Date | null
  finishedTime: Date | null
  createdAt: Date
}

export default function TodoList({ 
  initialTodos, 
  onToggle, 
  onDelete 
}: { 
  initialTodos: Todo[] 
  onToggle: any 
  onDelete: any 
}) {
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("all")
  const [sort, setSort] = useState("newest")

  // State quản lý việc chỉnh sửa
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({
    text: "",
    deadline: "",
    finishedTime: ""
  })

  // Hàm chuyển đổi Date sang chuỗi "YYYY-MM-DDTHH:mm" để hiện trong input datetime-local
  const formatDateForInput = (date: Date | null) => {
    if (!date) return ""
    return new Date(date).toISOString().slice(0, 16)
  }

  // Khi bấm nút Sửa (hình cây bút)
  const handleEditClick = (todo: Todo) => {
    setEditingId(todo.id)
    setEditForm({
      text: todo.text,
      deadline: formatDateForInput(todo.deadline),
      finishedTime: formatDateForInput(todo.finishedTime)
    })
  }

  // Khi bấm Lưu
  const handleSave = async (id: string) => {
    await updateTodo(
      id, 
      editForm.text, 
      editForm.deadline || null, 
      editForm.finishedTime || null
    )
    setEditingId(null) // Thoát chế độ sửa
  }

  const filteredTodos = initialTodos
    .filter(todo => {
      const matchSearch = todo.text.toLowerCase().includes(search.toLowerCase())
      const matchFilter = filter === "all" ? true : todo.status === filter
      return matchSearch && matchFilter
    })
    .sort((a, b) => {
      if (sort === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      if (sort === "deadline") {
        if (!a.deadline) return 1
        if (!b.deadline) return -1
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
      }
      return 0
    })

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      {/* --- PHẦN TÌM KIẾM & LỌC (GIỮ NGUYÊN) --- */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 pb-4 border-b">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Tìm công việc..."
            className="pl-10 w-full p-2 border rounded-lg focus:ring-2 focus:ring-black outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="p-2 border rounded-lg bg-gray-50" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">Tất cả</option>
          <option value="pending">Chưa xong</option>
          <option value="done">Đã xong</option>
        </select>
        <select className="p-2 border rounded-lg bg-gray-50" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="newest">Mới nhất</option>
          <option value="deadline">Hạn chót</option>
        </select>
      </div>

      {/* --- DANH SÁCH CÔNG VIỆC --- */}
      <ul className="space-y-3">
        {filteredTodos.map((todo) => {
          const isEditing = editingId === todo.id // Kiểm tra xem dòng này có đang được sửa không

          return (
            <li key={todo.id} className={`p-4 rounded-lg border transition-all ${todo.status === 'done' ? 'bg-gray-50 border-gray-200' : 'bg-white border-blue-100'}`}>
              
              {/* === GIAO DIỆN CHỈNH SỬA (KHI ĐANG EDIT) === */}
              {isEditing ? (
                <div className="flex flex-col gap-3">
                  <input
                    className="border p-2 rounded font-medium text-gray-900 w-full"
                    value={editForm.text}
                    onChange={(e) => setEditForm({...editForm, text: e.target.value})}
                    placeholder="Tên công việc"
                  />
                  <div className="flex gap-4 text-sm items-center">
                    <label className="flex flex-col text-gray-600">
                      <span>Hạn chót (Deadline):</span>
                      <input
                        type="datetime-local"
                        className="border p-1 rounded"
                        value={editForm.deadline}
                        onChange={(e) => setEditForm({...editForm, deadline: e.target.value})}
                      />
                    </label>
                    <label className="flex flex-col text-gray-600">
                      <span>Ngày hoàn thành:</span>
                      <input
                        type="datetime-local"
                        className="border p-1 rounded"
                        value={editForm.finishedTime}
                        onChange={(e) => setEditForm({...editForm, finishedTime: e.target.value})}
                      />
                    </label>
                  </div>
                  <div className="flex gap-2 mt-2 justify-end">
                    <button onClick={() => setEditingId(null)} className="flex items-center gap-1 px-3 py-1 text-gray-600 bg-gray-200 rounded hover:bg-gray-300">
                      <X className="w-4 h-4" /> Hủy
                    </button>
                    <button onClick={() => handleSave(todo.id)} className="flex items-center gap-1 px-3 py-1 text-white bg-green-600 rounded hover:bg-green-700">
                      <Save className="w-4 h-4" /> Lưu
                    </button>
                  </div>
                </div>
              ) : (
                
              /* === GIAO DIỆN HIỂN THỊ (BÌNH THƯỜNG) === */
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3 overflow-hidden">
                    <button 
                      onClick={() => onToggle(todo.id, todo.status)}
                      className={`mt-1 transition-colors ${todo.status === 'done' ? 'text-green-500' : 'text-gray-300 hover:text-blue-500'}`}
                    >
                      {todo.status === 'done' ? <CheckCircle /> : <Circle />}
                    </button>
                    
                    <div className="flex flex-col">
                      <span className={`font-medium text-lg ${todo.status === 'done' ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                        {todo.text}
                      </span>
                      
                      <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-500">
                        {todo.deadline && (
                          <span className={`flex items-center gap-1 ${new Date(todo.deadline) < new Date() && todo.status !== 'done' ? 'text-red-500 font-bold' : ''}`}>
                            <Calendar className="w-4 h-4" /> 
                            {format(new Date(todo.deadline), "HH:mm dd/MM/yyyy")}
                          </span>
                        )}
                        {todo.finishedTime && (
                          <span className="text-green-600 text-xs self-center">
                            (Xong: {format(new Date(todo.finishedTime), "HH:mm dd/MM")})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {/* Nút Sửa */}
                    <button 
                      onClick={() => handleEditClick(todo)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition"
                      title="Chỉnh sửa"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    {/* Nút Xóa */}
                    <button 
                      onClick={() => { if(confirm("Xóa nhé?")) onDelete(todo.id) }}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition"
                      title="Xóa"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}