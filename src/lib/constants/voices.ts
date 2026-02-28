import type { VoiceOption, VoiceId } from '$lib/types';

export const VOICES: VoiceOption[] = [
	{
		id: 'gentle',
		name: 'Mjuk',
		description: 'Varm, tålmodig och bekräftande.',
		opening: "Hej. Jag finns här, ingen brådska. Vad har legat och tyngt dig på sistone?",
		accentClass: 'voice-card--gentle'
	},
	{
		id: 'grounded',
		name: 'Jordad',
		description: 'Direkt, lugn och tydlig.',
		opening: 'Låt oss reda ut det här. Hur ser situationen ut just nu?',
		accentClass: 'voice-card--grounded'
	},
	{
		id: 'coach',
		name: 'Coach',
		description: 'Handlingsinriktad och praktisk.',
		opening: 'Låt oss jobba igenom det här. Vilken utmaning står du inför idag?',
		accentClass: 'voice-card--coach'
	}
];

export const DEFAULT_VOICE: VoiceId = 'gentle';

export function getVoice(voiceId: string | null | undefined): VoiceOption {
	return VOICES.find((voice) => voice.id === voiceId) ?? VOICES[0];
}
