# Appkoncept

**Arbetsnamn:** _Sortify_

> _Det löser inget. Men det känns lite lättare._

## Vad det är

En kompis snarare än ett verktyg. Du lämnar över vad som än snurrar i huvudet — det stora eller det löjligt små — och en röst du valt möter det. Inte för att lösa det. För att lämna tillbaka det en aning lättare. Du frågar inte appen om fakta; du räcker den något som tynger, och får det metaboliserat genom en personlighet.

## Idén

Det här är en sammanslagning av två saker: röst- och karaktärsappen, och Sortify. Sortify hade hjärtat — du är här för att lägga av dig något, inte nödvändigtvis för att få det fixat — men blev aldrig något. Röstappen hade ensemblen. Tillsammans blir de något ingen av dem var ensam: Sortifys hjärta med röstappens skådespelare.

Det avgörande som skiljer det från dina andra appar: Storify och Sortify förvandlar _ditt eget_ material. Den här pekar utåt, mot vilket problem som helst, och låter flera röster bryta samma sak på olika sätt. Den refraktionen är det enda den här appen gör som ingen annan gör — det är den som ska skyddas.

## Vad det egentligen handlar om

Leverans, inte svar. Frågan är en förevändning; behållningen är att se _hur_ en röst håller den. Samma oro, lämnad till olika röster, smälts olika: Stoikern krymper den till det du kan styra, mormor får dig att känna dig älskad om den, den överdramatiske berättaren blåser upp den tills den blir absurd, Rakt på sak skalar bort katastrofen till _det här är faktiskt lugnt_, den uttråkade tonåringen kallar din 3-på-natten-spiral _"inte så deep"_.

Rösten _är_ alltså coping-verktyget. Och under skämtet ligger en på riktigt bärande idé: hur något sägs förändrar vad det betyder. Det är det som gör appen minnesvärd istället för en engångsleksak.

## Så funkar det

Flödet vänder på den vanliga chatten. Istället för _"fråga vad som helst"_ börjar det med en inbjudan att lägga av sig något — _"Vad snurrar i huvudet?"_

Sedan **frågar du rummet**: tryck på en röst, hör den reagera. Tryck på en till. Det är som att ha ett rum fullt av vänner med vitt skilda temperament som alla väger in i din röra — en får dig att skratta, en håller om dig, en skär igenom bruset. Att välja röst är ett humörval, inte en inställning: _vem vill jag höra från just nu._

Sortifys tre lägen mappar mot vad du behöver, inte vad du gör:

- **Ventilera** — när du bara vill bli sedd, inte fixad
- **Sortera** — när du vill reda ut härvan
- **Formulera** — när du behöver ord för det

Läget är inte en egen röst utan ett lager ovanpå den valda. Det förskjuter _vad_ rösten siktar mot — möta, reda ut eller hitta ord — men aldrig dess ton eller grepp. Samma mormor i Ventilera håller om dig; i Sortera hjälper hon dig reda ut härvan, fortfarande som mormor. Tekniskt vävs läget in i kompositionen **bas + läge + röst**: läges-direktiven bor i `lagena.md` och mekaniken i `basprompt.md`, så varje röst anpassar sig efter läget utan att behöva specas tre gånger.

## Rösterna

Ensemblen finns specad i `rosterna.md`. Tre slag — **Stilar** (en ton, inget vem), **Karaktärer** (ett vem med personlighet) och **Format** (greppet är hela rösten). Varje röst är dessutom vikttaggad efter hur tung en fråga den klarar, vilket är det som driver säkerhetsväxlingen nedan.

## Tonen

Standardläget är modigt, vanvördigt och lekfullt. Det mesta folk bär på är vardagligt och _vill_ ha lätthet — den uttråkade tonåringen som avfärdar din jobbkris är bra för dig. Slipas kanterna av blir det bara ännu en mild dagboksapp. Det här ska vara den med tänder.

## När det blir allvar

Det här är inte en fotnot — det är ryggraden. Ensemblen är perfekt för _"kollegan värmde fisk igen"_ och direkt fel för _"jag har inte sovit på en vecka och ser ingen mening"_. När inmatningen går från att vädra till genuint illamående måste komedin kliva åt sidan: de lekfulla rösterna dras tillbaka, ett **uppriktigt ankare** (Genuint eller Eftertänksamt) tar fronten, de suppress-flaggade rösterna stängs av, och appen pekar varsamt utåt mot en människa.

Det här är precis den triageringen Sortifys krisprotokoll redan handlade om. Det som gjorde Sortify svårt att släppa är det den här idén behöver mest — och du har löst det en gång förut.

## Vad det inte är

Inte en bättre assistent. Inte terapi. Inte ett frågesport- eller faktaverktyg. De uppriktiga stilarna finns som en ventil för _"okej, nu behöver jag faktiskt det här"_ — inte som poängen. Lockelsen att göra den nyttig är fällan; det ärliga, ödmjuka och faktiskt uppnåeliga löftet är att vara värdelös-men-värmande.

## Vad som gör det hållbart

"Rolig chatt i utklädnad" förbrukas — när du hört varje röst en gång, varför komma tillbaka? Det som håller:

- **Kombinatoriken** — 37 röster blir tusentals parningar; det är glappet mellan dem som är innehållet
- **Delbarheten** — en skärmdump av mormor som besvarar din skattefråga är hela marknadsföringsmotorn
- **Upptäckandet** — att hitta sin egen favoritkombination för olika sorters problem

## Teknik

Samma stack som dina övriga appar: SvelteKit 5, TypeScript, Supabase och Anthropic API. Varje röst är i grunden en systemprompt; "fråga rummet" är flera anrop som vävs ihop i samma tråd. Vikttaggarna styr vilka röster som får ledas fram vid en given distress-nivå.

## Öppna frågor

- **Namn** — inte satt
- **"Tål något på riktigt"-nivån är tunn** — bara en handfull röster klarar verklig tyngd. Ska appen handla om riktiga problem behöver den nivån byggas ut med fler varma/perspektivgivande röster som inte är rena skämt
- **Distress-detektion** — hur växlingen faktiskt triggas
- **En röst i taget vs. hela rummet** — vilket som är standardläge
