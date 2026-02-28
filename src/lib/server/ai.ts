import Anthropic from '@anthropic-ai/sdk';
import { env } from '$env/dynamic/private';
import type { ChatMessage, TakeawayFormat, VoiceId } from '$lib/types';
import { buildChatSystemPrompt, buildTakeawayPrompt } from '$lib/server/prompts';

function getAnthropicClient(): Anthropic | null {
	if (!env.ANTHROPIC_API_KEY) return null;
	return new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
}

function modelName(): string {
	return env.ANTHROPIC_MODEL ?? 'claude-3-5-sonnet-latest';
}

export async function generateAssistantReply(voice: VoiceId, messages: ChatMessage[]): Promise<string> {
	const client = getAnthropicClient();
	const userMessage = messages[messages.length - 1]?.content ?? '';

	if (!client) {
		return `Thanks for sharing that. To keep moving, what feels most important about this right now: the feeling, the situation, or the next action?`;
	}

	const response = await client.messages.create({
		model: modelName(),
		max_tokens: 500,
		system: buildChatSystemPrompt(voice),
		messages: messages.map((message) => ({ role: message.role, content: message.content }))
	});

	const firstText = response.content.find((block) => block.type === 'text');
	return firstText?.text?.trim() || `Thanks for sharing. What part of "${userMessage}" feels hardest right now?`;
}

export async function generateTakeaway(
	voice: VoiceId,
	format: TakeawayFormat,
	messages: ChatMessage[]
): Promise<string> {
	const client = getAnthropicClient();

	if (!client) {
		if (format === 'realizations') {
			return '- I named what is actually bothering me.\n- I separated facts from assumptions.\n- I identified one small next move.';
		}

		if (format === 'steps') {
			return '1. Write down the core problem in one sentence.\n2. Choose one action you can do in 24 hours.\n3. Schedule a check-in with yourself in two days.';
		}

		return 'Dear me,\n\nYou took the time to slow down and understand what is going on. You are not stuck; you are in process. Keep this simple: take one clear step today and revisit with honesty tomorrow.';
	}

	const response = await client.messages.create({
		model: modelName(),
		max_tokens: 700,
		messages: [{ role: 'user', content: buildTakeawayPrompt(voice, format, messages) }]
	});

	const firstText = response.content.find((block) => block.type === 'text');
	return firstText?.text?.trim() || 'Ingen sammanfattning kunde skapas. Försök igen.';
}
