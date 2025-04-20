import type { UserInsert, UserSelect } from './schema';

// 定义前端表单或API请求中接收到的用户数据结构
export interface UserFormData {
  name?: string;
  email: string;
  password: string;
}

// 定义转换函数，将前端数据映射到数据库插入类型
export function mapToUserInsert(formData: UserFormData, userId: string): UserInsert {
  return {
    id: userId,
    name: formData.name || null,
    email: formData.email,
    password: formData.password, // 注意：这里假设密码已经被哈希
    points: 0,
    level: 1,
    created_at: new Date(),
    updated_at: new Date()
  };
}

// 定义用于客户端展示的用户数据类型（不包含敏感字段）
export interface UserViewModel {
  id: string;
  name?: string;
  email: string;
  points: number;
  level: number;
}

// 将数据库用户对象转换为视图模型
export function mapToUserViewModel(user: UserSelect): UserViewModel {
  return {
    id: user.id,
    name: user.name || undefined,
    email: user.email,
    points: user.points || 0,
    level: user.level || 1
  };
} 