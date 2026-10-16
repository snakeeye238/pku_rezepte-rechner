# PKU Rezepte-Rechner

Statischer PKU-Rezepte-Rechner für Cloudflare Pages.

**Eigene Lebensmittel sind umgezogen:** Die D1-Datenbank `pku-rezepte-rechner-db` wird nicht mehr genutzt. Die hier angelegten eigenen Lebensmittel wurden in die App PKUche (Datenbank `pkueche-db`) übernommen. Ohne D1-Bindung bleibt der eingebaute Lebensmittelbestand vollständig nutzbar; das Formular „Lebensmittel hinzufügen“ meldet dann, dass der Speicher fehlt.

## Cloudflare Pages

Das Git-verbundene Pages-Projekt heißt `pku-rezepte-rechner`. Ein manuelles Deployment ist mit `npm run deploy` möglich; Pushes auf `main` werden weiterhin über die bestehende Git-Anbindung veröffentlicht.

## Endpunkte

- `GET /api/foods` lädt alle manuell angelegten Lebensmittel.
- `POST /api/foods` speichert ein Lebensmittel mit Name, Kategorie sowie Phe, Eiweiß, Kohlenhydraten, Fett und Kalorien pro 100 g.

Ohne die D1-Bindung bleibt der eingebaute Lebensmittelbestand nutzbar; das Formular zeigt dann einen verständlichen Konfigurationsfehler an.
