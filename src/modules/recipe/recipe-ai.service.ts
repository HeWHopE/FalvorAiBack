// recipe-ai.service.ts
import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class RecipeAiService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY, // .env file
    });
  }

  async generateRecipeSuggestion(prompt: string) {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // or gpt-3.5-turbo
      messages: [
        { role: 'user', content: `Generate a recipe using: ${prompt}` },
      ],
      max_tokens: 300,
    });

    return response.choices[0].message?.content;
  }
}
