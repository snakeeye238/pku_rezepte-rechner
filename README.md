# PKU Rezepte-Rechner

Statischer PKU-Rezepte-Rechner für Cloudflare Pages. Eigene Lebensmittel werden über eine Pages Function in Cloudflare D1 gespeichert.

## Cloudflare Pages

Das Git-verbundene Pages-Projekt heißt `pku-rezepte-rechner`. Die produktive D1-Datenbank `pku-rezepte-rechner-db` ist in `wrangler.jsonc` unter dem Binding `DB` konfiguriert.

Die Datenbankmigration kann mit `npm run db:migrate` angewendet werden. Ein manuelles Deployment ist mit `npm run deploy` möglich; Pushes auf `main` werden weiterhin über die bestehende Git-Anbindung veröffentlicht.

## Endpunkte

- `GET /api/foods` lädt alle manuell angelegten Lebensmittel.
- `POST /api/foods` speichert ein Lebensmittel mit Name, Kategorie sowie Phe, Eiweiß, Kohlenhydraten, Fett und Kalorien pro 100 g.

Ohne die D1-Bindung bleibt der eingebaute Lebensmittelbestand nutzbar; das Formular zeigt dann einen verständlichen Konfigurationsfehler an.
