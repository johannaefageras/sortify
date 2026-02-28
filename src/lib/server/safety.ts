const crisisKeywords = [
	'kill myself',
	'suicide',
	'want to die',
	'end my life',
	'hurt myself',
	'harming myself',
	'hurt someone',
	'kill someone'
];

export function isCrisisText(text: string): boolean {
	const normalized = text.toLowerCase();
	return crisisKeywords.some((keyword) => normalized.includes(keyword));
}

export function crisisResponse(): string {
	return "Jag är verkligen glad att du delade det här. Jag kan inte ge akut hjälp, men din säkerhet är viktig just nu. Ring 112 omedelbart om du befinner dig i akut fara. Du kan också ringa Mind Självmordslinjen på 90101, eller Jourhavande medmänniska på 08-702 16 80. Försök gärna att nå en person du litar på som kan vara med dig.";
}
