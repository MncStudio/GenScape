import Anthropic from '@anthropic-ai/sdk'
import type { AIProvider, ChatMessage, ChatResponse } from '../AIService'

export class ClaudeProvider implements AIProvider {
  readonly name = 'claude'
  private client: Anthropic

  constructor() {
    const apiKey = import.meta.env.VITE_CLAUDE_API_KEY
    if (!apiKey) {
      throw new Error('未配置 VITE_CLAUDE_API_KEY，请在 .env 文件中设置该环境变量')
    }
    this.client = new Anthropic({
      apiKey,
      dangerouslyAllowBrowser: true,
    })
  }

  async chat(
    messages: ChatMessage[],
    options?: { temperature?: number; maxTokens?: number; stream?: boolean },
  ): Promise<ChatResponse> {
    const systemMsg = messages.find(m => m.role === 'system')
    const userMsgs = messages.filter(m => m.role !== 'system')

    const response = await this.client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: options?.maxTokens ?? 4096,
      temperature: options?.temperature ?? 0.7,
      system: systemMsg?.content,
      messages: userMsgs.map(m => ({
        role: 'user' as const,
        content: m.content,
      })),
    })

    const textBlock = response.content.find(block => block.type === 'text')
    const content = textBlock?.text ?? ''

    return {
      content,
      truncated: response.stop_reason === 'max_tokens',
      usage: {
        promptTokens: response.usage?.input_tokens ?? 0,
        completionTokens: response.usage?.output_tokens ?? 0,
      },
    }
  }

  async chatStream(
    messages: ChatMessage[],
    onChunk: (chunk: string) => void,
    options?: { temperature?: number; maxTokens?: number },
  ): Promise<ChatResponse> {
    const systemMsg = messages.find(m => m.role === 'system')
    const userMsgs = messages.filter(m => m.role !== 'system')

    const stream = await this.client.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: options?.maxTokens ?? 4096,
      temperature: options?.temperature ?? 0.7,
      system: systemMsg?.content,
      messages: userMsgs.map(m => ({
        role: 'user' as const,
        content: m.content,
      })),
    })

    let fullContent = ''
    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        fullContent += event.delta.text
        onChunk(event.delta.text)
      }
    }

    const final = await stream.finalMessage()
    return {
      content: fullContent,
      truncated: final.stop_reason === 'max_tokens',
    }
  }
}
