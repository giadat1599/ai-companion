import { Redis } from "@upstash/redis";

export type CompanionKey = {
   companionName: string;
   modelName: string;
   userId: string;
};

// TODO: add more comments to this MemoryManager class
export class MemoryManager {
   private static instance: MemoryManager;
   private history: Redis;

   public constructor() {
      // Instantiate a new Upstash Redis Client which will automatically read the
      // env vars: UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN
      this.history = Redis.fromEnv();
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
