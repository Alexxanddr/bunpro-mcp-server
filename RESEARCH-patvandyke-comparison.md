# Confronto con PatVandyke/bunpro-mcp

Ricerca eseguita il 21 ottobre 2026 confrontando il commit upstream
[`651d22e`](https://github.com/PatVandyke/bunpro-mcp/tree/651d22ed1a5f075a2b2e55f5851d9f6274f90c06)
con il server locale `bunpro-mcp-server`.

## Risultato principale

L'altro progetto contiene una correzione reale che manca localmente: la ricerca usa
`POST /search/reviewables_v1_1` con un payload completo, mentre il server locale usa
il vecchio `POST /search/v1_1` con il solo campo `query`. La richiesta upstream è stata
provata con il token locale e risponde `200` con `grammar_points` e `vocabs`; quella
locale risponde `500`.

Gli altri quattro gruppi di endpoint problematici non sono risolti dall'altro progetto:
usa gli stessi path per `review_histories/last_session`, `review_histories/last_24_hours`
e `user_stats/review_activity`. Per `/reviews` aggiunge `page=1&per_page=25`, ma una
prova con gli stessi header e parametri restituisce ancora `500`. Quindi il repository
upstream li espone, ma non contiene evidenza che oggi funzionino.

Fonti:

- [client upstream: review, statistiche, history e ricerca](https://github.com/PatVandyke/bunpro-mcp/blob/651d22ed1a5f075a2b2e55f5851d9f6274f90c06/src/client.ts#L201-L285)
- [client locale](src/client.ts)
- [registrazione tool locale](src/server.ts)

## Differenze utili

### Ricerca

Upstream invia:

```json
{
  "query": "...",
  "options": {
    "include_reviews": true,
    "include_bookmarks": true,
    "include_notes": true,
    "only_bookmarks": false
  },
  "is_searching_grammar": true,
  "is_searching_vocab": true
}
```

Inoltre permette di filtrare grammar/vocab, limita i risultati e rimuove campi molto
pesanti prima di mandarli sul trasporto MCP. È una protezione utile: l'autore documenta
risposte raw oltre 240 KB. Vedi
[`trimSearch` e `search`](https://github.com/PatVandyke/bunpro-mcp/blob/651d22ed1a5f075a2b2e55f5851d9f6274f90c06/src/client.ts#L71-L105)
e lo [schema del tool](https://github.com/PatVandyke/bunpro-mcp/blob/651d22ed1a5f075a2b2e55f5851d9f6274f90c06/src/tools.ts#L169-L200).

### Token e gestione errori

Upstream:

- legge il token a ogni chiamata da un file JSON configurabile, con cache di 30 secondi;
- su `401` rilegge il file e riprova una volta;
- restituisce un messaggio specifico per token scaduto;
- supporta anche la vecchia `BUNPRO_API_KEY` per due endpoint legacy.

Il server locale legge `BUNPRO_API_TOKEN` soltanto all'avvio. Il meccanismo upstream è
più comodo, ma il percorso predefinito dipende da uno specifico client e non è portabile;
l'idea riutilizzabile è un eventuale `BUNPRO_TOKEN_FILE` esplicito.

Fonte: [risoluzione token e retry 401](https://github.com/PatVandyke/bunpro-mcp/blob/651d22ed1a5f075a2b2e55f5851d9f6274f90c06/src/client.ts#L107-L169).

### Funzioni aggiuntive upstream

Upstream espone operazioni che il server locale ha escluso intenzionalmente:

- aggiunta/rimozione di elementi dalle review tramite `PATCH /reviews/update_via_action_type`;
- aggiunta/rimozione bookmark;
- `get_study_queue_legacy` e `get_recent_items_legacy` con API key legacy.

Fonti: [implementazione mutation e legacy](https://github.com/PatVandyke/bunpro-mcp/blob/651d22ed1a5f075a2b2e55f5851d9f6274f90c06/src/client.ts#L288-L323),
[tool MCP](https://github.com/PatVandyke/bunpro-mcp/blob/651d22ed1a5f075a2b2e55f5851d9f6274f90c06/src/tools.ts#L202-L321).

Queste funzioni non vanno copiate automaticamente: le mutation cambiano dati utente e
non hanno test live nel repository upstream.

### Funzioni presenti solo localmente

Il server locale ha più copertura read-only della specifica community:

- impostazioni furigana;
- contenuti Learn per deck;
- risposte Discourse;
- precedente/successivo vocab nel deck;
- dettagli SRS self-study;
- un test end-to-end che verifica l'elenco dei tool MCP;
- una suite live separata contro Bunpro.

Upstream ha 23 tool totali, ma 6 sono mutation o legacy; il server locale ha 22 tool,
tutti read-only.

## Problemi trovati nell'altro progetto

1. Lo schema upstream di `get_srs_level_details` accetta `level` numerico 1–10 e tipo
   `GrammarPoint`/`Vocabulary`. L'API corrente, verificata dal server locale, usa livelli
   nominali come `beginner` e tipi `Grammar`/`Vocab`. La richiesta upstream
   `level=1&reviewable_type=GrammarPoint` restituisce `500`.
2. `get_item` dichiara di supportare anche grammar point, ma chiama sempre
   `/reviewables/vocab/{id-or-slug}`. Una prova con lo slug grammaticale indicato nel suo
   stesso schema restituisce `500`.
3. I test upstream coprono solo ricerca compatta e caricamento del token; non coprono
   mapping degli endpoint, registry MCP o API live. Vedi
   [test/client.test.ts](https://github.com/PatVandyke/bunpro-mcp/blob/651d22ed1a5f075a2b2e55f5851d9f6274f90c06/test/client.test.ts).
4. I tool non dichiarano le annotation MCP `readOnlyHint`/`destructiveHint`, quindi un
   client non può distinguere programmaticamente letture e mutation dal metadata.

## Verifica empirica delle differenze

Richieste read-only effettuate con lo stesso token e gli stessi header usati da upstream:

| Richiesta | Status |
|---|---:|
| `/reviews?page=1&per_page=25` | 500 |
| `/review_histories/last_session` | 500 |
| `/review_histories/last_24_hours` | 500 |
| `/user_stats/review_activity` | 500 |
| `POST /search/reviewables_v1_1` con payload upstream | 200 |
| `/user_stats/srs_level_details?level=1&reviewable_type=GrammarPoint&page=1` | 500 |
| `/reviewables/vocab/は-wa-topic-marking-particle` | 500 |

Queste prove dimostrano il comportamento con l'account corrente, non garantiscono quello
di altri account o versioni future dell'API.

## Raccomandazione minima

Adottare soltanto la correzione della ricerca e la sua proiezione compatta, con test del
payload e test live. Facoltativamente aggiungere un file token esplicito con retry su 401.
Non copiare per ora mutation, legacy API o schemi SRS upstream: aumentano il rischio o
sono incompatibili con l'API osservata. Mantenere visibili i quattro endpoint che
continuano a restituire `500`, perché upstream non li risolve.

## Follow-up dal frontend Bunpro

L'ispezione delle richieste eseguite dal sito autenticato ha successivamente identificato
gli endpoint correnti:

- attività: `/user_stats/activity_daily` e `/user_stats/activity_hourly`;
- domande della sessione Review: `/reviews/quiz_index`;
- accuratezza dell'ultima sessione: campo `facts.last_session` di
  `/user_stats/base_stats`.

Il frontend corrente non usa `/review_histories/last_24_hours`; il relativo tool è stato
rimosso. Le sostituzioni sopra sono state provate con la suite live e rispondono `200`.
