export interface Session {
	id: string;
	user_id: string;
	voice: string;
	title: string | null;
	status: 'active' | 'completed' | 'abandoned';
	started_at: string;
	ended_at: string | null;
	turn_count: number;
	stage: string;
	safety_flag: boolean;
	safety_type: string | null;
	model: string;
	prompt_version: string;
	created_at: string;
}

export interface Message {
	id: string;
	session_id: string;
	role: 'user' | 'assistant';
	content: string;
	token_count: number | null;
	latency_ms: number | null;
	created_at: string;
}

export interface Takeaway {
	id: string;
	session_id: string;
	format: string;
	content: string;
	version: number;
	regenerated_from_message_id: string | null;
	created_at: string;
}
