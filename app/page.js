'use client';

import { useRef, useState } from 'react';
import Messages from './components/messages';

export default function Home() {
  const [streamedData, setStreamedData] = useState('');
  const [aiTyping, setaiTyping] = useState(false);
  const [msgHistory, setMsgHistory] = useState([]);
  const [userPrompt, setUserPrompt] = useState('');
  const promptInput = useRef(null);

  async function handleChatPrompt(e) {
    try {
      e.preventDefault();

      const formInput = promptInput.current;
      const userMessage = formInput.value;
      let aiMessage = '';

      setaiTyping(true);
      setStreamedData('');
      setUserPrompt(userMessage);

      const data = new FormData(e.currentTarget);
      const response = await fetch('api/chat', {
        method: 'POST',
        body: JSON.stringify({ prompt: data.get('prompt') }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error();
      if (formInput) formInput.value = '';

      const reader = response.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          setaiTyping(false);
          break;
        }
        const text = new TextDecoder().decode(value);
        setStreamedData((prevData) => prevData + text);
        aiMessage += text;
      }
      setMsgHistory((msgHistory) => [
        ...msgHistory,
        {
          ai: aiMessage.trim(),
          user: userMessage,
        },
      ]);
    } catch (error) {
      setStreamedData('Niestety nie udało się skomunikować z AI. Spróbuj później.');
    }
  }

  async function handleClearChat() {
    try {
      const response = await fetch('api/chat', {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error();
      setStreamedData('');
      setaiTyping(false);
      setMsgHistory([]);
    } catch (error) {
      setStreamedData('Wystąpił problem i niestety nie udało się wyczyścić historii czatu.');
    }
  }

  return (
    <div className="flex flex-col gap-3 w-full max-w-6xl mx-auto min-h-screen justify-between px-3 py-2 ">
      <header className="border-gray-600 border-solid border-b pt-8">
        <h1 className="font-extrabold text-center text-xl lg:text-5xl text-gray-300">City Break Chat</h1>
        <p className="text-gray-400 text-sm lg:text-base py-6">
          City Break to sztuczna inteligencja, która może odpowiadać na pytania dotyczące miast w Polsce w oparciu o dane dostępne w internecie. Możesz zadać
          jej pytania dotyczące historii, kultury, geografii lub gospodarki miasta.
        </p>
      </header>
      <main className=" grow  flex flex-col justify-between rounded-lg p-3 pb-0  ">
        <div className="lg:max-h-[62vh] overflow-auto self">
          {msgHistory.length > 0 &&
            msgHistory.map((msg, i) => {
              return <Messages key={i} userPrompt={msg.user} streamedData={msg.ai}></Messages>;
            })}
          {aiTyping && (
            <Messages userPrompt={userPrompt} streamedData={streamedData} aiTypingMsg="Poczekaj! AI szuka dla Ciebie najlepszej odpowiedzi."></Messages>
          )}
        </div>
        <form onSubmit={handleChatPrompt} action="" className="relative mt-10">
          <input
            ref={promptInput}
            aria-label="Wprowadź zapytanie do AI"
            type=""
            required
            name="prompt"
            id="prompt"
            placeholder="Wprowadź zapytanie do AI"
            className="w-full rounded-lg px-6 py-3 bg-transparent border-solid border-gray-500 border resize-y overflow-hidden max-h-52 text-gray-300 h-14 focus:outline-none focus:border-gray-400"
          />
          <button
            type="submit"
            aria-label="Wyślij zapytanie"
            className="flex justify-center items-center size-8 bg-zinc-500 absolute top-1/2 right-4 -translate-y-1/2 rounded-lg focus:bg-zinc-400 hover:bg-zinc-400 focus:outline-none transition-colors duration-300">
            <svg viewBox="0 0 32 32" className="size-5 fill-zinc-800 ">
              <path d="M27.414 12.586l-10-10c-0.781-0.781-2.047-0.781-2.828 0l-10 10c-0.781 0.781-0.781 2.047 0 2.828s2.047 0.781 2.828 0l6.586-6.586v19.172c0 1.105 0.895 2 2 2s2-0.895 2-2v-19.172l6.586 6.586c0.39 0.39 0.902 0.586 1.414 0.586s1.024-0.195 1.414-0.586c0.781-0.781 0.781-2.047 0-2.828z"></path>
            </svg>
          </button>
          {streamedData && (
            <button
              onClick={handleClearChat}
              type="button"
              className="px-4 py-2 bg-zinc-600 absolute -top-7 right-1/2 -translate-y-1/2
            translate-x-1/2 rounded-lg focus:bg-zinc-500 hover:bg-zinc-500 focus:outline-none transition-colors duration-300 w-max">
              Wyczyść historię czatu
            </button>
          )}
        </form>
      </main>
      <footer className="text-center text-xs text-gray-500">City Break Chat może popełniać błędy. Rozważ sprawdzenie ważnych informacji.</footer>
    </div>
  );
}
