# Sortify

> _Det löser inget. Men det känns lite lättare._

En app där du lämnar över vad som än snurrar i huvudet — det stora eller det löjligt små — och en röst du valt möter det. Inte för att lösa problemet, utan för att lämna tillbaka det en aning lättare, genom humor, värme eller ett nytt perspektiv. Ensemblen sträcker sig från en uttråkad tonåring och en pensionerad överste till en stoiker och en allas mormor, och samma fråga känns olika beroende på vem du frågar. Under skämtet ligger en enkel idé: hur något sägs förändrar vad det betyder.

## Dokumentation

- **[konceptet.md](docs/konceptet.md)** — vad appen är, vad den handlar om, kärnloopen "fråga rummet", de tre lägena, säkerhetsväxlingen och vad appen medvetet _inte_ ska vara. Börja här.
- **[rosterna.md](docs/rosterna.md)** — hela ensemblen. Indelad i tre slag (Stilar, Karaktärer, Format) och vikttaggad efter hur tung en fråga varje röst klarar.
- **[basprompt.md](docs/basprompt.md)** — bas-systemprompten som läggs först i varje röst. Bär det gemensamma: sammanhang, uppdrag, grundregler, läges-mekaniken, krisresurs-regeln och hela säkerhetsspärren. Komposition: **bas + läge + röst**.
- **[lagena.md](docs/lagena.md)** — läges-lagret. De tre lägena (Ventilera, Sortera, Formulera) som injicerbara direktiv; exakt ett läggs in mellan basen och rösten och förskjuter vad rösten siktar mot, aldrig dess ton.
- **[systempromptmallen.md](docs/systempromptmallen.md)** — mall skriven för att läsas av en AI som genererar systemprompterna, en per röst. Innehåller struktur, regler och ett fullt utskrivet exempel. Säkerhetsspärren ärvs från basen; varje röst-prompt anger bara sin egen tröskel.

## Teknik

SvelteKit 5, TypeScript, Supabase och Anthropic API — samma stack som de andra projekten. Varje röst är i grunden en systemprompt, komponerad som **bas + läge + röst**: basprompten först, sedan det aktiva av tre lägen (**Ventilera**, **Sortera**, **Formulera**), sist själva rösten. Läget förskjuter vad rösten siktar mot utan att ändra dess ton, så varje röst anpassar sig efter användarens val utan att specas tre gånger. "Fråga rummet" är flera anrop som vävs ihop i samma tråd. Vikttaggarna styr vilka röster som får ledas fram vid en given distress-nivå.

## Status

Konceptet, ensemblen och promptmallen är på plats. Kvar innan bygget drar igång på riktigt:

- **Säkerhets-/distress-spec** — hur växlingen faktiskt triggas, vad som sker på app-nivå kontra i prompten, och vilken granskad resurslista som visas. Den enda dokumentationsfil som saknas, och den är både säkerhetskritisk och arkitektonisk.
- **Namnet** — sätter tonen för allt annat.
- **Bygg ut "tål något på riktigt"-nivån** — bara en handfull röster tål verklig tyngd; ska appen handla om riktiga problem behöver den nivån bli tjockare.
