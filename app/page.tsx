import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50">
      <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text mb-8">
        欢迎来到夸夸星球
      </h1>
      
      <div className="flex flex-col space-y-4 w-full max-w-md">
        <Link href="/chat" className="w-full">
          <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
            开始聊天
          </Button>
        </Link>
        
        <Link href="/exercises" className="w-full">
          <Button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
            进入成长乐园
          </Button>
        </Link>
      </div>
    </main>
  );
} 