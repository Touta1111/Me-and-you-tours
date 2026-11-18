# TikTok Lead Studio — Me & You Tours Egypt

Privé-werkplek om reisvragen op TikTok te verzamelen, een goed antwoord te maken en bij te houden wat eruit komt.
Plaatsen op TikTok doe je altijd zelf. Website gemaakt door VormVivo Studios.

## Online zetten op Vercel (eenmalig)

1. Ga naar vercel.com en maak een gratis account met **Continue with GitHub**.
2. Kies **Add New → Project** en importeer de repository **Me-and-you-tours**.
3. Zet **Root Directory** op `lead-studio`. Framework: **Other**.
4. Open **Environment Variables** en voeg toe: `ACCESS_KEY` met de geheime code die je hebt gekregen.
5. Klik op **Deploy**.
6. Ga in het project naar **Storage → Create Database → Upstash for Redis** (gratis plan) en koppel hem aan dit project.
7. Ga naar **Deployments**, kies de laatste en klik op **Redeploy**.

Je privélink is dan: `https://<jouw-project>.vercel.app/#k=<ACCESS_KEY>`.
Stuur die link alleen naar de 2 of 3 mensen die mee mogen doen. Wie hem opent, kiest zijn naam; de eerste wordt beheerder.

## Optioneel: slimme hulp (kost geld)

Voor screenshots uitlezen en vrij geschreven antwoorden: voeg `ANTHROPIC_API_KEY` toe (een betaalde API-sleutel) en redeploy.
Zonder sleutel werkt alles ook, met de ingebouwde antwoorden in 6 talen en reacties plakken als tekst.

## Andere code wijzigen of vernieuwen

`ACCESS_KEY` aanpassen in Vercel en opnieuw deployen. De oude link werkt dan niet meer.
