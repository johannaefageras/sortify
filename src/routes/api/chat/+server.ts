import { json } from '@sveltejs/kit';
import { z } from 'zod';
import type { ChatMessage, VoiceId } from '$lib/types';
import { generateAssistantReply } from '$lib/server/ai';
import { crisisResponse, isCrisisText } from '$lib/server/safety';

const messageSchema = z.object({
	role: z.enum(['user', 'assistant']),
	content: z.string().min(1).max(3000)
});

const chatSchema = z.object({
	voice: z.enum(['gentle', 'grounded', 'coach']),
	messages: z.array(messageSchema).min(1).max(40)
});

export async function POST({ request, locals }) {
	const { session } = await locals.safeGetSession();
	if (!session) {
		return json({ error: 'Ej behörig' }, { status: 401 });
	}

	const body = await request.json().catch(() => null);
	const parsed = chatSchema.safeParse(body);

	if (!parsed.success) {
		return json({ error: 'Ogiltigt anrop' }, { status: 400 });
	}

	const { voice, messages } = parsed.data;
	const latestUserMessage = [...messages].reverse().find((message) => message.role === 'user');

	if (!latestUserMessage) {
		return json({ error: 'Ett meddelande från användaren krävs' }, { status: 400 });
	}

	if (isCrisisText(latestUserMessage.content)) {
		return json({ reply: crisisResponse(), safetyTriggered: true });
	}

	const reply = await generateAssistantReply(voice as VoiceId, messages as ChatMessage[]);
	return json({ reply, safetyTriggered: false });
}
