import classic from './classic';
import friendly from './friendly';
import friend from './friend';
import mentor from './mentor';
import lifecoach from './lifecoach';
import philosophical from './philosophical';
import realistic from './realistic';
import formal from './formal';
import cynical from './cynical';
import sarcastic from './sarcastic';
import passiveAggressive from './passive-aggressive';
import chaotic from './chaotic';
import british from './british';
import bureaucratic from './bureaucratic';
import tinfoilhat from './tinfoilhat';
import aiRobot from './ai-robot';
import grandma from './grandma';
import socratic from './socratic';

export const VOICE_OVERLAYS: Record<string, string> = {
	classic,
	friendly,
	friend,
	mentor,
	lifecoach,
	philosophical,
	realistic,
	formal,
	cynical,
	sarcastic,
	'passive-aggressive': passiveAggressive,
	chaotic,
	british,
	bureaucratic,
	tinfoilhat,
	'ai-robot': aiRobot,
	grandma,
	socratic
};
