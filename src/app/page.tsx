'use client';
import dynamic from 'next/dynamic';

// Draft storage and HTML rendering use browser APIs; the editor must initialize only on the client.
const Editor = dynamic(() => import('../App'), {ssr:false,loading:()=> <div className="app-loading"><span>简言 <small>SAYLIT</small></span><p>准备你的写作空间…</p></div>});
export default function Page() { return <Editor />; }
