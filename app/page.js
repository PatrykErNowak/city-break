'use client';

import { useState } from 'react';

export default function Home() {
  const [streamedData, setStreamedData] = useState('123');

  function handleChatPrompt(e) {
    e.preventDefault();

    const data = new FormData(e.currentTarget);
    console.log(data.get('prompt'));
  }

  function handleClearChat() {
    setStreamedData('');
  }

  return (
    <div className="flex flex-col gap-3 w-full max-w-6xl mx-auto min-h-screen justify-between px-3 py-2">
      <header className="border-gray-600 border-solid border-b pt-8">
        <h1 className="font-extrabold text-center text-5xl text-gray-300">City Break Chat</h1>
        <p className="text-gray-400 py-6">
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Optio veritatis dolor, incidunt sapiente sint dignissimos quae maiores iusto expedita
          perspiciatis.
        </p>
      </header>
      <main className=" h-full grow flex flex-col justify-end rounded-lg p-3 pb-0  ">
        <div className="grow">
          {streamedData && (
            <div className="my-4">
              <h2 className="text-xl text-gray-300">AI Assistant</h2>
              <p className="text-gray-400 rounded-lg bg-zinc-700 w-max p-2">{streamedData}</p>
            </div>
          )}
        </div>
        <form onSubmit={handleChatPrompt} action="" className="relative">
          <input
            aria-label="Enter a prompt"
            type=""
            required
            name="prompt"
            id="prompt"
            placeholder="Enter Prompt"
            className="w-full rounded-lg px-6 py-3 bg-transparent border-solid border-gray-500 border resize-y overflow-hidden max-h-52 text-gray-300 h-14 focus:outline-none focus:border-gray-400"
          />
          <button
            type="submit"
            aria-label="Send prompt"
            className="flex justify-center items-center size-8 bg-zinc-500 absolute top-1/2 right-4 -translate-y-1/2 rounded-lg focus:bg-zinc-400 hover:bg-zinc-400 focus:outline-none transition-colors duration-300">
            <svg viewBox="0 0 32 32" className="size-5 fill-zinc-800 ">
              <path d="M27.414 12.586l-10-10c-0.781-0.781-2.047-0.781-2.828 0l-10 10c-0.781 0.781-0.781 2.047 0 2.828s2.047 0.781 2.828 0l6.586-6.586v19.172c0 1.105 0.895 2 2 2s2-0.895 2-2v-19.172l6.586 6.586c0.39 0.39 0.902 0.586 1.414 0.586s1.024-0.195 1.414-0.586c0.781-0.781 0.781-2.047 0-2.828z"></path>
            </svg>
          </button>
        </form>
      </main>
      <footer className="text-center text-xs text-gray-500">City Break Chat can make mistakes. Consider checking important information.</footer>
    </div>
  );
}
