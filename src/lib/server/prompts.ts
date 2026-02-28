import type { ChatMessage, TakeawayFormat, VoiceId } from '$lib/types';

const voiceDirectives: Record<VoiceId, string> = {
	gentle:
		'Röst: Mjuk. Varm, tålmodig, bekräftande. Ställ en reflekterande fråga i taget. Håll språket lugnt och tryggt.',
	grounded:
		'Röst: Jordad. Tydlig och direkt. Spegla användarens poäng kort, ställ sedan en precis klargörande fråga.',
	coach:
		'Röst: Coach. Praktisk och handlingsinriktad. Håll momentum och avsluta med konkreta nästa steg när det passar.'
};

export function buildChatSystemPrompt(voice: VoiceId): string {
	return [
		'Sortify är ett reflektionsverktyg, inte terapi eller krisinsats. Svara alltid på svenska.',
		voiceDirectives[voice],
		'Sessionsstruktur: öppning, utforskning, fördjupning, syntes, avslutning.',
		'Regler: ställ en fråga i taget, undvik långa monologer, undvik medicinsk eller juridisk rådgivning.'
	].join('\n');
}

export function buildTakeawayPrompt(
	voice: VoiceId,
	format: TakeawayFormat,
	messages: ChatMessage[]
): string {
	const transcript = messages
		.map((message) => `${message.role === 'user' ? 'Användare' : 'Assistent'}: ${message.content}`)
		.join('\n');

	const formatInstruction =
		format === 'letter'
			? 'Skriv ett kort stödjande brev till sig själv i första person.'
			: format === 'realizations'
				? 'Returnera 4–6 kortfattade punkter med viktiga insikter.'
				: 'Returnera en kort handlingsplan med 3–5 konkreta nästa steg.';

	return [
		buildChatSystemPrompt(voice),
		`Sammanfattningsformat: ${format}. ${formatInstruction}`,
		'Transkription:',
		transcript
	].join('\n\n');
}
