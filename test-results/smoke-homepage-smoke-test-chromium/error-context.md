# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - banner [ref=e3]:
      - heading "🍎 Mercadinho Connect Ofertas de Hoje" [level=1] [ref=e4]:
        - text: 🍎 Mercadinho Connect
        - generic [ref=e5]: Ofertas de Hoje
    - main [ref=e6]:
      - heading "🔥 Promoções Imperdíveis" [level=2] [ref=e7]
      - generic [ref=e8]:
        - paragraph [ref=e9]: Nenhuma oferta cadastrada ainda. 😴
        - link "Sou o dono (Cadastrar)" [ref=e10] [cursor=pointer]:
          - /url: /admin
    - link "📲 Mandar no Grupo!" [ref=e12] [cursor=pointer]:
      - /url: https://wa.me/?text=%F0%9F%94%A5%20*Corre%20que%20t%C3%A1%20barato!*%20Olha%20as%20ofertas%20de%20hoje%20no%20Mercadinho%3A%0A%0Ahttp%3A%2F%2Flocalhost%3A3000
      - button "📲 Mandar no Grupo!" [ref=e13]
  - alert [ref=e14]
```