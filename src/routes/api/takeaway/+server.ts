import { ANTHROPIC_API_KEY } from '$env/static/private';
import { supabaseAdmin } from '$lib/server/supabase';
import type { RequestHandler } from './$types';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY });
const MODEL = 'claude-sonnet-4-20250514';

type TakeawayFormat = 'letter' | 'realizations' | 'next-steps';

const FORMAT_LABELS: Record<TakeawayFormat, string> = {
	letter: 'Brev till dig själv',
	realizations: 'Viktiga insikter',
	'next-steps': 'Nästa steg'
};

const FORMAT_PROMPTS: Record<TakeawayFormat, string> = {
	letter: `Skriv ett kort, varmt brev från användaren till sig själv baserat på samtalet.

Brevet ska:
- Vara i du-form (användaren skriver till sig själv)
- Fånga det viktigaste som kom fram i samtalet
- Vara ärligt och specifikt, inte generiskt
- Kännas som något användaren faktiskt skulle kunna skriva
- Vara 100–200 ord
- Inte innehålla klyschor eller floskler
- Skrivas på svenska`,

	realizations: `Sammanfatta de viktigaste insikterna från samtalet som en kort punktlista.

Listan ska:
- Innehålla 3–5 konkreta insikter
- Vara specifika för det här samtalet, inte generiska
- Formuleras som påståenden, inte frågor
- Fånga mönster, skiften eller aha-ögonblick som dök upp
- Vara på svenska`,

	'next-steps': `Formulera 3–5 konkreta nästa steg baserat på samtalet.

Stegen ska:
- Vara handlingsbara och realistiska
- Koppla direkt till det som diskuterades
- Vara formulerade som saker användaren kan göra, inte borde göra
- Vara på svenska
- Inte vara överdrivet ambitiösa — små, tydliga steg`
};

export const POST: RequestHandler = async ({ request }) => {
	const { sessionId, format } = await request.json();

	if (!sessionId || typeof sessionId !== 'string') {
		return new Response(JSON.stringify({ error: 'Session ID is required' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	const validFormats: TakeawayFormat[] = ['letter', 'realizations', 'next-steps'];
	if (!format || !validFormats.includes(format)) {
		return new Response(
			JSON.stringify({ error: 'Invalid format. Use: letter, realizations, next-steps' }),
			{ status: 400, headers: { 'Content-Type': 'application/json' } }
		);
	}

	try {
		// Check session exists and isn't safety-flagged
		const { data: session, error: sessionError } = await supabaseAdmin
			.from('sessions')
			.select('id, safety_flag, voice')
			.eq('id', sessionId)
			.single();

		if (sessionError || !session) {
			return new Response(JSON.stringify({ error: 'Session not found' }), {
				status: 404,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		if (session.safety_flag) {
			return new Response(
				JSON.stringify({ error: 'Takeaway cannot be generated for safety-flagged sessions' }),
				{ status: 403, headers: { 'Content-Type': 'application/json' } }
			);
		}

		// Load message history
		const { data: dbMessages, error: historyError } = await supabaseAdmin
			.from('messages')
			.select('role, content')
			.eq('session_id', sessionId)
			.order('created_at', { ascending: true });

		if (historyError || !dbMessages || dbMessages.length === 0) {
			return new Response(
				JSON.stringify({ error: 'No messages found for this session' }),
				{ status: 400, headers: { 'Content-Type': 'application/json' } }
			);
		}

		// Build transcript for the takeaway prompt
		const transcript = dbMessages
			.map((m) => `${m.role === 'user' ? 'Användaren' : 'Sortify'}: ${m.content}`)
			.join('\n\n');

		const takeawayFormat = format as TakeawayFormat;

		const systemPrompt = `Du är Sortifys takeaway-generator. Din uppgift är att skapa en sammanfattning av ett reflekterande samtal.

${FORMAT_PROMPTS[takeawayFormat]}

Basera allt på samtalet nedan. Lägg inte till information som inte finns i samtalet. Var specifik och träffsäker.`;

		const response = await client.messages.create({
			model: MODEL,
			max_tokens: 1024,
			system: systemPrompt,
			messages: [
				{
					role: 'user',
					content: `Här är samtalet:\n\n${transcript}\n\nGenerera en takeaway i formatet "${FORMAT_LABELS[takeawayFormat]}".`
				}
			]
		});

		const takeawayContent =
			response.content[0].type === 'text' ? response.content[0].text : '';

		// Check if a takeaway already exists for this session+format
		const { data: existing } = await supabaseAdmin
			.from('takeaways')
			.select('id, version')
			.eq('session_id', sessionId)
			.eq('format', format)
			.order('version', { ascending: false })
			.limit(1);

		const version = existing && existing.length > 0 ? existing[0].version + 1 : 1;

		// Save takeaway
		const { data: takeaway, error: saveError } = await supabaseAdmin
			.from('takeaways')
			.insert({
				session_id: sessionId,
				format,
				content: takeawayContent,
				version
			})
			.select('id, format, content, version, created_at')
			.single();

		if (saveError) {
			console.error('Failed to save takeaway:', saveError);
			return new Response(
				JSON.stringify({ error: 'Failed to save takeaway' }),
				{ status: 500, headers: { 'Content-Type': 'application/json' } }
			);
		}

		// Mark session as completed
		await supabaseAdmin
			.from('sessions')
			.update({ status: 'completed', ended_at: new Date().toISOString() })
			.eq('id', sessionId);

		return new Response(JSON.stringify(takeaway), {
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (err) {
		console.error('Takeaway API error:', err);
		return new Response(
			JSON.stringify({
				error: err instanceof Error ? err.message : 'Internal server error'
			}),
			{ status: 500, headers: { 'Content-Type': 'application/json' } }
		);
	}
};
