import { VOICE_OVERLAYS } from './voices';

export type Stage = 'opening' | 'explore' | 'deepen' | 'synthesize' | 'close';

export interface UserProfile {
	displayName?: string;
	age?: number;
	gender?: string;
	location?: string;
	aboutMe?: string;
}

export interface PromptContext {
	voice: string;
	stage: Stage;
	turnCount: number;
	wrapUpEligible: boolean;
	sessionSummary?: string;
	userProfile?: UserProfile;
}

const BASE_PROMPT = `Du är Sortify, en AI för reflekterande samtal.

Din uppgift är att hjälpa användaren sortera tankar, känslor och mönster genom ett kort, tydligt och närvarande samtal.

Allmänna regler:

- Fokusera på användarens situation.
- Svara kort och klart, vanligtvis 2–4 meningar.
- Ställ högst en fråga.
- Anpassa tempot efter användaren.
- Diagnostisera inte.
- Ge inte tvärsäker expertvägledning.
- Var inte generisk.
- Om något låter allvarligt, bli tydligare och mer direkt.
- Om användaren skickar ett kort eller otydligt meddelande (t.ex. "ok", "vet inte", en emoji), matcha breviteten men lägg till riktning. Skriv inte mer än användaren.

Språk:

- Svara på svenska som standard.
- Om röstinstruktionen uttryckligen kräver annat språk, följ den.
- Om användaren uttryckligen ber om annat språk, följ det om det inte bryter mot röstens kärnidé.

Kontextregel:

- Om användarens senaste meddelande tydligt bryter med pågående samtalsämne — introducerar ett helt nytt tema eller uttryckligen byter spår — behandla samtalet som om det befinner sig i Explore-fas, oavsett angiven stage.`;

const STAGE_INSTRUCTIONS: Record<Stage, string> = {
	opening:
		'Använd korta, inbjudande svar. Försök förstå vad användaren vill prata om utan att tolka för mycket för tidigt. Etablera röstens ton direkt.',
	explore:
		'Hjälp användaren utveckla situationen och känslorna. Spegla, förtydliga och identifiera de viktigaste spåren. Gå inte för fort till slutsats.',
	deepen:
		'Gå ett steg djupare. Leta efter mönster, konflikt, undvikande, behov eller motsägelse. Våga formulera en tydligare observation om underlaget stödjer det.',
	synthesize:
		'Samla ihop det som blivit tydligt. Hjälp användaren se helheten. Minska frågefrekvensen och öka graden av destillation.',
	close:
		'Avsluta lugnt och tydligt. Lyft det viktigaste användaren verkar ha kommit fram till. Öppna för wrap-up eller takeaway utan att kännas abrupt.'
};

function buildProfileSection(profile: UserProfile): string | null {
	const genderLabels: Record<string, string> = {
		woman: 'Kvinna',
		man: 'Man',
		nonbinary: 'Icke-binär',
		other: 'Annat'
	};

	const lines: string[] = [];
	if (profile.displayName) lines.push(`- Namn: ${profile.displayName}`);
	if (profile.age) lines.push(`- Ålder: ${profile.age}`);
	if (profile.gender && profile.gender !== 'prefer_not') {
		lines.push(`- Kön: ${genderLabels[profile.gender] ?? profile.gender}`);
	}
	if (profile.location) lines.push(`- Plats: ${profile.location}`);
	if (profile.aboutMe) lines.push(`- Om sig själv: ${profile.aboutMe}`);

	if (lines.length === 0) return null;

	return `\n[Användarens profil]\nAnvänd denna bakgrundsinformation naturligt för att anpassa samtalet. Referera inte explicit till profilen om det inte är relevant.\n${lines.join('\n')}`;
}

export function buildSystemPrompt(ctx: PromptContext): string {
	const parts: string[] = [BASE_PROMPT];

	if (ctx.userProfile) {
		const profileSection = buildProfileSection(ctx.userProfile);
		if (profileSection) parts.push(profileSection);
	}

	parts.push(`\nSession:\n\n- Nuvarande stage: ${ctx.stage}\n- Turn count: ${ctx.turnCount}\n- Wrap-up eligible: ${ctx.wrapUpEligible}`);

	if (ctx.sessionSummary) {
		parts.push(`\n[Sammanfattning av tidigare samtal]\n${ctx.sessionSummary}`);
	}

	parts.push(`\nStage-instruktion:\n${STAGE_INSTRUCTIONS[ctx.stage]}`);

	const overlay = VOICE_OVERLAYS[ctx.voice];
	if (overlay) {
		parts.push(`\nRöstinstruktion:\n${overlay}`);
	}

	return parts.join('\n');
}

export function getStageForTurn(turnCount: number): Stage {
	if (turnCount <= 2) return 'opening';
	if (turnCount <= 5) return 'explore';
	if (turnCount <= 9) return 'deepen';
	if (turnCount <= 11) return 'synthesize';
	return 'close';
}
