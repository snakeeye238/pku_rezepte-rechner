# PKU Rezepte-Rechner

Statischer PKU-Rezepte-Rechner für Cloudflare Pages. Eigene Lebensmittel werden über eine Pages Function in Cloudflare D1 gespeichert.

## Cloudflare Pages einrichten

1. Das Repository in Cloudflare Pages verbinden. Es ist kein Build-Befehl nötig; als Ausgabeverzeichnis `.` verwenden.
2. Unter **Workers & Pages → pku_rezepte-rechner → Settings → Bindings** eine D1-Bindung hinzufügen.
3. Die Binding-Variable muss exakt `DB` heißen. Eine neue oder vorhandene D1-Datenbank auswählen.
4. Das Projekt erneut deployen.

Die API legt die Tabelle beim ersten Aufruf selbst an. Alternativ kann das Schema aus `migrations/0001_custom_foods.sql` vorab auf die D1-Datenbank angewendet werden.

## Endpunkte

- `GET /api/foods` lädt alle manuell angelegten Lebensmittel.
- `POST /api/foods` speichert ein Lebensmittel mit Name, Kategorie sowie Phe, Eiweiß, Kohlenhydraten, Fett und Kalorien pro 100 g.

Ohne die D1-Bindung bleibt der eingebaute Lebensmittelbestand nutzbar; das Formular zeigt dann einen verständlichen Konfigurationsfehler an.
