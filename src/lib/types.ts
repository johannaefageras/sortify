export type VoiceId = 'gentle' | 'grounded' | 'coach';

export type ChatRole = 'user' | 'assistant';

export interface VoiceOption {
	id: VoiceId;
	name: string;
	description: string;
	opening: string;
	accentClass: string;
}

export interface ChatMessage {
	role: ChatRole;
	content: string;
}

export type TakeawayFormat = 'letter' | 'realizations' | 'steps';
