import { Pinecone } from '@pinecone-database/pinecone';
import { Configuration, OpenAIApi } from 'openai';
import { getProducts } from './_database';

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
  environment: 'us-east-1',
});

const openai = new OpenAIApi(new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
}));

const INDEX_NAME = "bents-woodworking";

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { query } = req.body;

    try {
      // Generate embedding for the query
      const embeddingResponse = await openai.createEmbedding({
        model: "text-embedding-ada-002",
        input: query,
      });
      const [{ embedding }] = embeddingResponse.data.data;

      // Query Pinecone
      const index = pinecone.Index(INDEX_NAME);
      const queryResponse = await index.query({
        vector: embedding,
        topK: 3,
        includeMetadata: true,
      });

      // Generate answer with OpenAI
      const context = queryResponse.matches.map(match => match.metadata.text).join("\n");
      const completion = await openai.createChatCompletion({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are a woodworking expert assistant. Use the provided context to answer the user's question." },
          { role: "user", content: `Context: ${context}\n\nQuestion: ${query}` },
        ],
      });

      const answer = completion.data.choices[0].message.content;

      // Get related products
      const products = await getProducts();
      const relatedProducts = products.slice(0, 3); // Just get first 3 for simplicity

      // Mock video ID (replace with actual logic to find related video)
      const videoId = "dQw4w9WgXcQ";

      res.status(200).json({ answer, products: relatedProducts, videoId });
    } catch (error) {
      console.error('Error processing query:', error);
      res.status(500).json({ error: 'An error occurred while processing your query.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}