# TikTok Lead Studio — online zetten op Vercel

Website gemaakt door VormVivo Studios.

1. Ga naar vercel.com/drop en sleep **lead-studio-vercel.zip** op de pagina (niet uitpakken). Kies je team en klik op **Deploy**.
2. Open het nieuwe project op vercel.com → **Storage → Create Database → Upstash for Redis** → gratis plan → **Connect** met dit project.
3. **Deployments** → bij de bovenste **⋯ → Redeploy**.
4. Open je adres (…vercel.app) en vul het wachtwoord in. De eerste die zijn naam invult, wordt beheerder.

Deel het adres en het wachtwoord alleen met je 2 of 3 mensen.
Ander wachtwoord? Zet in Vercel bij Settings → Environment Variables `ACCESS_KEY` op je nieuwe wachtwoord (minstens 8 tekens) en doe een Redeploy.

Optioneel (kost geld): `ANTHROPIC_API_KEY` toevoegen voor het uitlezen van screenshots en vrij geschreven antwoorden.
