'use client';

import { useState } from 'react';
import Header from './components/Header';
import Main from './components/Main/Main';
import MessagesBox from './components/Main/MessagesBox';
import ChatForm from './components/Main/ChatForm';
import Footer from './components/Footer';
import PromptInput from './components/Main/PromptInput';
import Button from './components/Button';
import Message from './components/Main/Message';

const aiErrorMessage = 'Niestety nie udało się skomunikować z AI. Spróbuj później.';
const clearChatErroMessage = 'Wystąpił problem i niestety nie udało się wyczyścić historii czatu.';
let userMessage = '';

export default function Home() {
  const [streamedData, setStreamedData] = useState('');
  const [aiTyping, setaiTyping] = useState(false);
  const [msgHistory, setMsgHistory] = useState([]);
  const [userPrompt, setUserPrompt] = useState('');

  // Helper function
  function addMsgToHistoryState({ message, type }) {
    setMsgHistory((msgHistory) => [
      ...msgHistory,
      {
        message,
        type,
      },
    ]);
  }

  async function handleChatPrompt(e) {
    try {
      e.preventDefault();

      let aiMessage = '';
      userMessage = userPrompt;

      addMsgToHistoryState({ message: userMessage, type: 'human' });

      setaiTyping(true);
      setStreamedData('');
      setUserPrompt('');

      const data = new FormData(e.currentTarget);
      const response = await fetch('api/chat', {
        method: 'POST',
        body: JSON.stringify({ prompt: data.get('prompt') }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error();

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
      addMsgToHistoryState({ message: aiMessage, type: 'ai' });
    } catch (error) {
      setStreamedData(aiErrorMessage);
      setaiTyping(false);
      addMsgToHistoryState({ message: aiErrorMessage, type: 'ai' });
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
      setUserPrompt('');
    } catch (error) {
      setStreamedData(clearChatErroMessage);
    }
  }

  return (
    <div className="flex flex-col gap-3 w-full max-w-6xl mx-auto min-h-screen justify-between px-3 py-2 ">
      <Header title="City Break Chat">
        City Break to sztuczna inteligencja, która może odpowiadać na pytania dotyczące miast w Polsce w oparciu o dane dostępne w internecie. Możesz zadać jej
        pytania dotyczące historii, kultury, geografii lub gospodarki miasta.
      </Header>
      <Main>
        <MessagesBox scrollTrigger={msgHistory}>
          {msgHistory.length > 0 &&
            msgHistory.map((msg, i) => {
              return <Message data={msg} key={i}></Message>;
            })}
          {aiTyping && <Message data={{ message: streamedData }}></Message>}
        </MessagesBox>
        <ChatForm onSubmit={handleChatPrompt}>
          <PromptInput value={userPrompt} onChange={(e) => setUserPrompt(e.target.value)} name="prompt" id="prompt"></PromptInput>
          <Button type="submit" ariaLabel="Wyślij zapytanie" className="flex justify-center items-center size-8 absolute top-1/2 right-4 -translate-y-1/2">
            <svg viewBox="0 0 32 32" className="size-5 fill-zinc-800 ">
              <path d="M27.414 12.586l-10-10c-0.781-0.781-2.047-0.781-2.828 0l-10 10c-0.781 0.781-0.781 2.047 0 2.828s2.047 0.781 2.828 0l6.586-6.586v19.172c0 1.105 0.895 2 2 2s2-0.895 2-2v-19.172l6.586 6.586c0.39 0.39 0.902 0.586 1.414 0.586s1.024-0.195 1.414-0.586c0.781-0.781 0.781-2.047 0-2.828z"></path>
            </svg>
          </Button>
          {streamedData && (
            <Button onClick={handleClearChat} className="px-4 py-2 absolute -top-7 right-1/2 -translate-y-1/2 translate-x-1/2">
              Wyczyść historię czatu
            </Button>
          )}
        </ChatForm>
      </Main>
      <Footer>City Break Chat może popełniać błędy. Rozważ sprawdzenie ważnych informacji.</Footer>
    </div>
  );
}
