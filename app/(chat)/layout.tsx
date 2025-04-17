import { cookies } from 'next/headers';
import Link from 'next/link';

import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { auth } from '../(auth)/auth';
import Script from 'next/script';
import UserNav from '@/components/user-nav';

export const experimental_ppr = true;

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, cookieStore] = await Promise.all([auth(), cookies()]);
  const isCollapsed = cookieStore.get('sidebar:state')?.value !== 'true';

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js"
        strategy="beforeInteractive"
      />
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-purple-300/20 mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-1/4 -left-20 w-80 h-80 rounded-full bg-blue-300/20 mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-indigo-300/20 mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        <div className="absolute -bottom-32 left-1/3 w-72 h-72 rounded-full bg-pink-300/20 mix-blend-multiply filter blur-3xl animate-blob animation-delay-6000"></div>
      </div>
      
      <SidebarProvider defaultOpen={!isCollapsed}>
        <AppSidebar user={session?.user} />
        <SidebarInset className="bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50">
          <nav className="bg-white/80 backdrop-blur-sm border-b border-indigo-100/50 shadow-sm relative z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex items-center">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                      <span className="text-white text-sm font-bold">夸</span>
                    </div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">夸夸星球</h1>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <Link href="/chat" className="text-sm px-4 py-1.5 rounded-full bg-white border border-indigo-200 text-indigo-600 hover:bg-indigo-50 transition-colors shadow-sm flex items-center space-x-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span>所有对话</span>
                  </Link>
                </div>
              </div>
            </div>
          </nav>
          
          {children}
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}
