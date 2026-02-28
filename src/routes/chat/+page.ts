import { getVoice } from '$lib/constants/voices';

export const load = ({ url }) => {
	const voice = getVoice(url.searchParams.get('voice'));
	return { voice };
};
