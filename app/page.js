'use client';
import dynamic from 'next/dynamic';

const Gurmukhi = dynamic(() => import('../components/Gurmukhi'), { ssr: false });

export default function Home() {
  return <Gurmukhi />;
}
