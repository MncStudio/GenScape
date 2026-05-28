import OpenAI from 'openai'
import type { AIProvider, ChatMessage, ChatResponse } from '../AIService'

export class DeepSeekProvider implements AIProvider {
  readonly name = 'deepseek'
  private client: OpenAI

  constructor() {
    const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY
    if (!apiKey) {
      throw new Error('未配置 VITE_DEEPSEEK_API_KEY，请在 .env 文件中设置该环境变量')
    }
    this.client = new OpenAI({
      apiKey,
      baseURL: import.meta.env.VITE_DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
      dangerouslyAllowBrowser: true,
    })
  }

  async chat(
    messages: ChatMessage[],
    options?: { temperature?: number; maxTokens?: number; stream?: boolean },
  ): Promise<ChatResponse> {
    const response = await this.client.chat.completions.create({
      model: 'deepseek-chat',
      messages: messages as any,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 4096,
      stream: false,
    })

    const choice = response.choices[0]
    const content = choice?.message?.content ?? ''
    return {
      content,
      truncated: choice?.finish_reason === 'length',
      usage: {
        promptTokens: response.usage?.prompt_tokens ?? 0,
        completionTokens: response.usage?.completion_tokens ?? 0,
      },
    }
  }

  async chatStream(
    messages: ChatMessage[],
    onChunk: (chunk: string) => void,
    options?: { temperature?: number; maxTokens?: number },
  ): Promise<ChatResponse> {
    const stream = await this.client.chat.completions.create({
      model: 'deepseek-chat',
      messages: messages as any,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 4096,
      stream: true,
    })

    let fullContent = ''
    let finishReason = ''
    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content ?? ''
      if (delta) {
        fullContent += delta
        onChunk(delta)
      }
      if (chunk.choices[0]?.finish_reason) {
        finishReason = chunk.choices[0].finish_reason
      }
    }

    return { content: fullContent, truncated: finishReason === 'length' }
  }
}
