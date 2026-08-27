# QXProjectWeergave

QXProjectWeergave is de alleen-lezen desktopvariant van Projectoverzicht.

## Wat gebruikers kunnen

- De actuele projectgegevens live bekijken.
- Zoeken, sorteren en filteren.
- De bewerkingsgeschiedenis bekijken.
- Exporteren naar CSV en printen.

## Alleen-lezen beveiliging

- De tabel bevat alleen tekst en geen bewerkbare invoervelden.
- Toevoegen, bewerken, verwijderen, herstellen en PDF-import zijn niet beschikbaar.
- De Supabase-koppeling gebruikt alleen `select` en realtime leesupdates; er is geen schrijfaanroep aanwezig.
- De live-configuratie kan niet via de app worden gewijzigd.
- Electron Developer Tools en externe navigatie zijn uitgeschakeld.

## Ontwikkelen en controleren

```powershell
npm install
npm test
npm start
```

## Installer bouwen

```powershell
npm run dist
```

De Windows-installer wordt in `dist` geplaatst. De automatische updater leest gepubliceerde releases uit `ReinJanssenBouw/QXProjectWeergave`. Elke toekomstige update moet een hogere semantische versie hebben en minimaal `latest.yml`, de installer en het bijbehorende `.blockmap`-bestand bevatten.
