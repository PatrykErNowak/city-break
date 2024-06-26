# City Break Chat

City Break is an artificial intelligence that can answer questions about cities in Poland based on data available online. You can ask it questions about the city's history, culture, geography or economy.

![city-break-hat](https://github.com/PatrykErNowak/city-break/assets/111689089/af19e2ca-df67-4e6a-bd65-37b800b26a4d)

## Tech-Stack

I decided to create a fullstack application based on JavaScript.

- [Next.js](https://nextjs.org) - Framework
- [TailwindCSS](https://tailwindcss.com) - CSS
- [LangChain.js](https://js.langchain.com/docs/get_started/introduction) – LLC Framework
- [Ollama](https://ollama.com)/[llama3](https://ollama.com/library/llama3)

## Getting Started

### Prerequisites

Here's what you need to be able to run City Break

- Node.js (version >= 18)
- Local [OLLAMA](https://ollama.com) server with ['llama3'](https://ollama.com/library/llama3) model available and port set to :11434 (default port). If you change the port, change the application port - in the ".env.local" file
- API key for https://serpapi.com. Generate the API key and place it in the file - .env.local

### 1. Clone this repository

```
git clone https://github.com/PatrykErNowak/city-break.git
cd city-break
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create `.env.local` file

```bash
touch .env.local
```

### 4. Edit `.env.local`

```
SERPAPI_API_KEY='yourSERPApiKey'
OLLAMA_PORT=11434
```

### 5. Run the app

```bash
npm run dev
```

### 6. Open the app in your browser

Visit http://localhost:3000 in your browser.
