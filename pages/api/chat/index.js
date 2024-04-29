import { ChatOllama } from '@langchain/community/chat_models/ollama';
import { OllamaEmbeddings } from '@langchain/community/embeddings/ollama';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { SerpAPILoader } from 'langchain/document_loaders/web/serpapi';
import { ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { createStuffDocumentsChain } from 'langchain/chains/combine_documents';
import { createRetrievalChain } from 'langchain/chains/retrieval';
import { ConversationChain } from 'langchain/chains';

import { LLMChain } from 'langchain/chains';
import { BufferMemory, ChatMessageHistory } from 'langchain/memory';

// CONFIG
const apiKey = process.env.SERPAPI_API_KEY;
const ollamaPort = process.env.OLLAMA_PORT || 11434;

const ollamaConfig = {
  baseUrl: `http://localhost:${ollamaPort}`, // Default value
  model: 'llama3',
  temperature: 0,
};

const systemChatPrompts = {
  convertToQuery: `Do not respond to a question, just only convert {input} into a polish search query for browser engine. Respond in template:
    search query`,
  handleChatPrompt: {
    mainFlow: `You are an expert in providing information about cities in Poland. Answer in polish the user's questions based on the below context:\n\n{context}`,
    errorFlow: 'Inform the person that you are responding based on the data available in your database in polish.',
  },
};
// ----------------------------------------------------

export default async function handler(req, res) {
  const { method } = req;
  if (method === 'POST') {
    await handleChatPrompt(req, res);
  }
  if (method === 'DELETE') {
    await clearChatHistory(req, res);
  }
}

// -----------------------------------------------------

// Chat Conversation Memory Object - Used by POST & DELETE method
const memory = new BufferMemory({
  memoryKey: 'main_history',
  returnMessages: true,
});

// DELETE method
/**
 * Clear chat conversation history
 */
async function clearChatHistory(req, res) {
  await memory.clear();
  const { messages } = memory.chatHistory;
  messages.length === 0 ? res.status(200).end() : res.status(404).end();
}

/**
 * Helper function for 'handleChatPrompt'. Convert user input into a search query.
 * @param {string} userInput
 * @param {object} llm - Instance of Chat LLM Class
 * @returns {Promise<string>} search query
 */
function userInputToQuery(userInput) {
  return new Promise(async function (resolve, reject) {
    try {
      const chatModel = new ChatOllama({
        ...ollamaConfig,
      });

      const chatPromptMemory = new BufferMemory({
        memoryKey: 'chat_history',
        returnMessages: true,
        chatHistory: new ChatMessageHistory([...memory.chatHistory.messages]),
      });
      const chatPrompt = ChatPromptTemplate.fromMessages([
        ['system', systemChatPrompts.convertToQuery],
        // The variable name here is what must align with memory
        new MessagesPlaceholder('chat_history'),
        ['human', '{input}'],
      ]);

      const chatConversationChain = new LLMChain({
        llm: chatModel,
        prompt: chatPrompt,
        verbose: true,
        memory: chatPromptMemory,
      });

      const res = await chatConversationChain.invoke({ input: userInput });

      const query = String(res.text)
        .slice(res.text.indexOf(':') + 1)
        .replaceAll('"', '')
        .trim();

      resolve(query);
    } catch (error) {
      reject(error);
    }
  });
}

// POST method
/**
 * Handle user chat prompt by serching interner for newest information and return's answer based onsearched informations.
 * @param {Request} req
 * @param {Response} res
 */
async function handleChatPrompt(req, res) {
  const llm = new ChatOllama({
    ...ollamaConfig,
    callbacks: [
      {
        handleLLMNewToken(token) {
          res.write(token);
        },
      },
    ],
  });
  const embeddings = new OllamaEmbeddings({
    ...ollamaConfig,
  });

  const { prompt: userPrompt } = req.body;

  try {
    // Define your question and query
    const query = await userInputToQuery(userPrompt);
    const question = query;

    // Use SerpAPILoader to load web search results
    const loader = new SerpAPILoader({ q: query, apiKey });
    const docs = await loader.load();

    // Use MemoryVectorStore to store the loaded documents in memory
    const vectorStore = await MemoryVectorStore.fromDocuments(docs, embeddings);

    const questionAnsweringPrompt = ChatPromptTemplate.fromMessages([
      ['system', systemChatPrompts.handleChatPrompt.mainFlow],
      ['human', '{input}'],
    ]);

    const combineDocsChain = await createStuffDocumentsChain({
      llm,
      prompt: questionAnsweringPrompt,
    });

    const chain = await createRetrievalChain({
      retriever: vectorStore.asRetriever(),
      combineDocsChain,
    });
    const aiAnswer = await chain.invoke({
      input: question,
    });
    memory.chatHistory.addUserMessage(query);
    memory.chatHistory.addAIChatMessage(aiAnswer.answer);
    res.end();
  } catch (error) {
    try {
      const chatprompt = ChatPromptTemplate.fromMessages([
        SystemMessagePromptTemplate.fromTemplate(systemChatPrompts.handleChatPrompt.errorFlow),
        new MessagesPlaceholder('main_history'),
        HumanMessagePromptTemplate.fromTemplate('{input}'),
      ]);

      const chain = new ConversationChain({ llm: llm, memory: memory, prompt: chatprompt });
      await chain.invoke({
        input: userPrompt,
      });

      res.end();
    } catch (error) {
      res.status(500).end();
    }
  }
}
