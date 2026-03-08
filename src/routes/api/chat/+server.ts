import { ANTHROPIC_API_KEY } from '$env/static/private';
import { buildSystemPrompt, getStageForTurn } from '$lib/prompt';
import { getUser } from '$lib/server/auth';
import { detectCrisis, getCrisisResponse } from '$lib/server/safety';
import { supabaseAdmin } from '$lib/server/supabase';
import type { RequestHandler } from './$types';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY });
const MODEL = 'claude-sonnet-4-20250514';
const PROMPT_VERSION = '1.0';

export const POST: RequestHandler = async ({ request }) => {
	const user = await getUser(request);
	const { sessionId, message, voice } = await request.json();

	if (!message || typeof message !== 'string' || !message.trim()) {
		return new Response(JSON.stringify({ error: 'Message is required' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	if (!voice || typeof voice !== 'string') {
		return new Response(JSON.stringify({ error: 'Voice is required' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	try {
		// --- Resolve or create session ---
		let currentSessionId = sessionId;

		if (!currentSessionId) {
			const { data: session, error: sessionError } = await supabaseAdmin
				.from('sessions')
				.insert({
					user_id: user?.id ?? null,
					voice,
					status: 'active',
					turn_count: 0,
					stage: 'opening',
					safety_flag: false,
					model: MODEL,
					prompt_version: PROMPT_VERSION
				})
				.select('id')
				.single();

			if (sessionError || !session) {
				return new Response(
					JSON.stringify({ error: 'Failed to create session' }),
					{ status: 500, headers: { 'Content-Type': 'application/json' } }
				);
			}
			currentSessionId = session.id;
		}

		// --- Save user message ---
		const userContent = message.trim();
		const { error: userMsgError } = await supabaseAdmin.from('messages').insert({
			session_id: currentSessionId,
			role: 'user',
			content: userContent
		});

		if (userMsgError) {
			console.error('Failed to save user message:', userMsgError);
		}

		// --- Crisis detection (runs BEFORE LLM) ---
		const safety = detectCrisis(userContent);

		if (safety.flagged) {
			// Flag session and lock it
			await supabaseAdmin
				.from('sessions')
				.update({
					safety_flag: true,
					safety_type: safety.type,
					status: 'completed',
					ended_at: new Date().toISOString()
				})
				.eq('id', currentSessionId);

			// Save crisis response as assistant message
			const crisisText = getCrisisResponse();
			await supabaseAdmin.from('messages').insert({
				session_id: currentSessionId,
				role: 'assistant',
				content: crisisText
			});

			// Return crisis response via SSE (same format as normal streaming)
			const encoder = new TextEncoder();
			const crisisStream = new ReadableStream({
				start(controller) {
					controller.enqueue(
						encoder.encode(
							`data: ${JSON.stringify({ sessionId: currentSessionId })}\n\n`
						)
					);
					controller.enqueue(
						encoder.encode(
							`data: ${JSON.stringify({ text: crisisText, crisis: true })}\n\n`
						)
					);
					controller.enqueue(encoder.encode('data: [DONE]\n\n'));
					controller.close();
				}
			});

			return new Response(crisisStream, {
				headers: {
					'Content-Type': 'text/event-stream',
					'Cache-Control': 'no-cache',
					Connection: 'keep-alive'
				}
			});
		}

		// --- Load full message history ---
		const { data: dbMessages, error: historyError } = await supabaseAdmin
			.from('messages')
			.select('role, content')
			.eq('session_id', currentSessionId)
			.order('created_at', { ascending: true });

		if (historyError || !dbMessages) {
			return new Response(
				JSON.stringify({ error: 'Failed to load message history' }),
				{ status: 500, headers: { 'Content-Type': 'application/json' } }
			);
		}

		// --- Calculate turn count and stage ---
		const turnCount = Math.ceil(
			dbMessages.filter((m) => m.role === 'user').length
		);
		const stage = getStageForTurn(turnCount);

		// --- Update session ---
		await supabaseAdmin
			.from('sessions')
			.update({ turn_count: turnCount, stage })
			.eq('id', currentSessionId);

		// --- Build system prompt ---
		const systemPrompt = buildSystemPrompt({
			voice,
			stage,
			turnCount,
			wrapUpEligible: turnCount >= 14
		});

		const anthropicMessages = dbMessages.map((msg) => ({
			role: msg.role as 'user' | 'assistant',
			content: msg.content
		}));

		// --- Stream response ---
		const startTime = Date.now();
		const stream = await client.messages.stream({
			model: MODEL,
			max_tokens: 512,
			system: systemPrompt,
			messages: anthropicMessages
		});

		const encoder = new TextEncoder();
		let fullResponse = '';

		const readable = new ReadableStream({
			async start(controller) {
				try {
					// Send sessionId as first event so frontend can track it
					controller.enqueue(
						encoder.encode(
							`data: ${JSON.stringify({ sessionId: currentSessionId })}\n\n`
						)
					);

					for await (const event of stream) {
						if (
							event.type === 'content_block_delta' &&
							event.delta.type === 'text_delta'
						) {
							fullResponse += event.delta.text;
							controller.enqueue(
								encoder.encode(
									`data: ${JSON.stringify({ text: event.delta.text })}\n\n`
								)
							);
						}
					}

					controller.enqueue(encoder.encode('data: [DONE]\n\n'));
					controller.close();

					// --- Persist assistant message after stream completes ---
					const latencyMs = Date.now() - startTime;
					const finalMessage = await stream.finalMessage();
					const tokenCount =
						finalMessage.usage?.output_tokens ?? null;

					await supabaseAdmin.from('messages').insert({
						session_id: currentSessionId,
						role: 'assistant',
						content: fullResponse,
						token_count: tokenCount,
						latency_ms: latencyMs
					});
				} catch (err) {
					const errMessage =
						err instanceof Error ? err.message : 'Unknown error';
					controller.enqueue(
						encoder.encode(
							`data: ${JSON.stringify({ error: errMessage })}\n\n`
						)
					);
					controller.close();
				}
			}
		});

		return new Response(readable, {
			headers: {
				'Content-Type': 'text/event-stream',
				'Cache-Control': 'no-cache',
				Connection: 'keep-alive'
			}
		});
	} catch (err) {
		console.error('Chat API error:', err);
		return new Response(
			JSON.stringify({
				error: err instanceof Error ? err.message : 'Internal server error'
			}),
			{ status: 500, headers: { 'Content-Type': 'application/json' } }
		);
	}
};
