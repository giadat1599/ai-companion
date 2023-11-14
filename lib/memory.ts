import { Redis } from "@upstash/redis";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { Pinecone } from "@pinecone-database/pinecone";
import { PineconeStore } from "langchain/vectorstores/pinecone";

export type CompanionKey = {
   companionName: string;
   modelName: string;
   userId: string;
};

// TODO: add more comments to this MemoryManager class
export class MemoryManager {
   private static instance: MemoryManager;
   private history: Redis;
   private vectorDBClient: Pinecone;

   public constructor() {
      // Instantiate a new Upstash Redis Client which will automatically read the
      // env vars: UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN
      this.history = Redis.fromEnv();

      // Instantiate a new Pinecone client, which will automatically read the
      // env vars: PINECONE_API_KEY and PINECONE_ENVIRONMENT.
      //---
      // Using pinecone database (a vector database) for Pinecone vectorstore
      // Reference: https://js.langchain.com/docs/integrations/vectorstores/pinecone
      this.vectorDBClient = new Pinecone();
   }

   public async vectorSearch(recentChatHistory: string, companionFileName: string) {
      const pineconeClient = this.vectorDBClient;
      const pineconeIndex = pineconeClient.Index(process.env.PINECONE_INDEX!);

      //  Using open ai embeddings to interact with embedding models
      //  Referece: https://js.langchain.com/docs/modules/data_connection/text_embedding/
      const vectorStore = await PineconeStore.fromExistingIndex(
         new OpenAIEmbeddings({ openAIApiKey: process.env.OPENAI_API_KEY }),
         {
            pineconeIndex,
         }
      );

      try {
         const similarDoc = await vectorStore.similaritySearch(recentChatHistory, 3, {
            fileName: companionFileName,
         });
         return similarDoc;
      } catch (error) {
         console.log("Failed to get vector search results", error);
      }
   }

   public static async getInstance(): Promise<MemoryManager> {
      if (!MemoryManager.instance) {
         MemoryManager.instance = new MemoryManager();
      }

      return MemoryManager.instance;
   }

   private generateRedisCompanionKey(companionKey: CompanionKey): string {
      return `${companionKey.companionName}-${companionKey.modelName}-${companionKey.userId}`;
   }

   public async writeToHistory(text: string, companionKey: CompanionKey) {
      if (!companionKey || typeof companionKey.userId == "undefined") {
         console.log("Companion key set incorrectly");
         return "";
      }

      const key = this.generateRedisCompanionKey(companionKey);
      const result = await this.history.zadd(key, {
         score: Date.now(),
         member: text,
      });

      return result;
   }

   public async readLatestHistory(companionKey: CompanionKey): Promise<string> {
      if (!companionKey || typeof companionKey.userId == "undefined") {
         console.log("Companion key set incorrectly");
         return "";
      }

      const key = this.generateRedisCompanionKey(companionKey);
      let result = await this.history.zrange(key, 0, Date.now(), {
         byScore: true,
      });

      result = result.slice(-30).reverse();
      const recentChat = result.reverse().join("\n");
      return recentChat;
   }

   public async seedChatHistory(
      seedContent: string,
      delimiter: string = "\n",
      companionKey: CompanionKey
   ) {
      const key = this.generateRedisCompanionKey(companionKey);

      if (await this.history.exists(key)) {
         console.log("User already has chat historu");
      }

      const content = seedContent.split(delimiter);
      let counter = 0;

      for (const line of content) {
         await this.history.zadd(key, { score: counter, member: line });
         counter += 1;
      }
   }
}
