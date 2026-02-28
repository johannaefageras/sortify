import { json } from '@sveltejs/kit';
import { z } from 'zod';
import type { ChatMessage, TakeawayFormat, VoiceId } from '$lib/types';
import { generateTakeaway } from '$lib/server/ai';

const takeawaySchema = z.object({
	voice: z.enum(['gentle', 'grounded', 'coach']),
	format: z.enum(['letter', 'realizations', 'steps']),
	messages: z
		.array(
			z.object({
				role: z.enum(['user', 'assistant']),
				content: z.string().min(1).max(3000)
			})
		)
		.min(2)
		.max(50)
});

export async function POST({ request, locals }) {
	const { session } = await locals.safeGetSession();
	if (!session) {
		return json({ error: 'Ej behörig' }, { status: 401 });
	}

	const body = await request.json().catch(() => null);
	const parsed = takeawaySchema.safeParse(body);

	if (!parsed.success) {
		return json({ error: 'Ogiltigt anrop' }, { status: 400 });
	}

	const { voice, format, messages } = parsed.data;
	const takeaway = await generateTakeaway(
		voice as VoiceId,
		format as TakeawayFormat,
		messages as ChatMessage[]
	);

	return json({ takeaway });
}
