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

// ----------------------------------------------------

export default async function handler(req, res) {
  const { method } = req;
  if (method === 'POST') {
    await handleChatPrompt(req, res);
  }
  if (method === 'DELETE') {
    clearChatHistory();
  }
}

// -----------------------------------------------------

// Chat Conversation Memory Object - Used by POST & DELETE method
const memory = new BufferMemory({ memoryKey: 'history', returnMessages: true });

// DELETE method
/**
 * Clear chat conversation history
 */
async function clearChatHistory() {
  await memory.clear();
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
      SystemMessagePromptTemplate.fromTemplate(
        'Never answer to a question.Try to refer to the chat history to get specific city information and Convert the following user input into a single query for the browser search engine: {input}'
      ),
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
    console.log(query);

    // Use SerpAPILoader to load web search results
    const loader = new SerpAPILoader({ q: query, apiKey, gl: 'pl', hl: 'pl', engine: 'google', num: 20 });
    const docs = await loader.load();

    // Use MemoryVectorStore to store the loaded documents in memory
    const vectorStore = await MemoryVectorStore.fromDocuments(docs, embeddings);

    // TODO pooprawic prompt
    const questionAnsweringPrompt = ChatPromptTemplate.fromMessages([
      [
        'system',
        `You are an expert in providing information about cities in Poland. Answer the user's questions in polish`,
        // `You are an expert in providing information about cities in Poland. Answer the user's questions based on the below context in polish:\n\n{context}`,
      ],
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
    console.log('error block');
    const chatprompt = ChatPromptTemplate.fromMessages([
      SystemMessagePromptTemplate.fromTemplate('Inform the person that you are responding based on the data available in your database in polish.'),
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
