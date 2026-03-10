# Quote API (services/quote-api)

This is the scriptable replacement for your Excel quoting pipeline.

- Endpoint: `POST /quote`
- Endpoint: `POST /quote/amortization`

Typical flow:
1) Lead arrives (TwentyCRM + your standalone UI)
2) n8n pipeline calls Quote API with the lead’s scenario parameters
3) Quote API returns PI + schedule + payoff date + totals
4) Campaign Engine picks the campaign + sends quote PDF/HTML via email/SMS provider

To run it in the stack:
- Ensure `docker-compose.services.yml` includes `quote_api`
- Then run the stack as usual and call `http://localhost:8089/docs`
