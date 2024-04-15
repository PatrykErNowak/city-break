import { ChatOllama } from '@langchain/community/chat_models/ollama';
import { OllamaEmbeddings } from '@langchain/community/embeddings/ollama';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { SerpAPILoader } from 'langchain/document_loaders/web/serpapi';
import { ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { createStuffDocumentsChain } from 'langchain/chains/combine_documents';
import { createRetrievalChain } from 'langchain/chains/retrieval';
import { BufferMemory } from 'langchain/memory';
import { ConversationChain } from 'langchain/chains';

// CONFIG
const apiKey = process.env.SERPAPI_API_KEY;
const ollamaConfig = {
  baseUrl: 'http://localhost:11434', // Default value
  model: 'openchat',
  temperature: 0,
};

const systemChatPrompts = {
  convertToQuery:
    'Never answer to a question.Try to refer to the chat history to get specific city information and Convert in english the following user input into a single query for the browser search engine: {input}',
  handleChatPrompt: {
    mainFlow: `You are an expert in providing information about cities in Poland. Answer in polish the user's questions based on the below context:\n\n{context}`,
    errorFlow: 'Inform the person that you are responding based on the data available in your database in polish.',
  },
};
// const answerChatPrompt = `You are an expert in providing information about cities in Poland. Answer in polish the user's questions based on the below context:\n\n{context}`;
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
const memory = new BufferMemory({ memoryKey: 'history', returnMessages: true });

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
  return new Promise(async function (res, _) {
    const llm = new ChatOllama({
      ...ollamaConfig,
    });

    const chatprompt = ChatPromptTemplate.fromMessages([
      SystemMessagePromptTemplate.fromTemplate(systemChatPrompts.convertToQuery),
      new MessagesPlaceholder('history'),
      HumanMessagePromptTemplate.fromTemplate('{input}'),
    ]);

    const chain = new ConversationChain({ llm: llm, memory: memory, prompt: chatprompt });
    const result = await chain.invoke({
      input: userInput,
    });

    res(result.response);
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
    callbacks: [
      {
        handleLLMNewToken(token) {
          res.write(token);
        },
      },
    ],
  });

  const { prompt: userPrompt } = req.body;

  try {
    // Define your question and query
    const query = await userInputToQuery(userPrompt);
    const question = query;

    // Use SerpAPILoader to load web search results
    const loader = new SerpAPILoader({ q: query, apiKey, gl: 'pl', hl: 'pl', engine: 'google', num: 25 });
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
    await chain.invoke({
      input: question,
    });

    res.end();
  } catch (error) {
    const chatprompt = ChatPromptTemplate.fromMessages([
      SystemMessagePromptTemplate.fromTemplate(systemChatPrompts.handleChatPrompt.errorFlow),
      new MessagesPlaceholder('history'),
      HumanMessagePromptTemplate.fromTemplate('{input}'),
    ]);

    const chain = new ConversationChain({ llm: llm, memory: memory, prompt: chatprompt });
    await chain.invoke({
      input: userPrompt,
    });

    res.end();
  }
}
