import { NextPage } from 'next';

declare module 'next/app' {
  export type AppProps = {
    params: Record<string, string>;
    searchParams?: Record<string, string | string[]>;
  };
} 