# Visagem

Jogo de navegador no estilo *survivors*: um vaqueiro perdido no sertão precisa sobreviver 15 minutos às assombrações do folclore até o sol nascer.

**Jogar:** https://dmwnezes.com/survival

## Como jogar
- **PC:** WASD ou setas para andar, `P` ou `Esc` para pausar, teclas `1` a `4` para escolher cartas.
- **Celular:** toque e arraste em qualquer lugar da tela (o joystick aparece onde o dedo encosta). Jogue deitado.
- As armas atacam sozinhas. Pegue os cajus para subir de nível e escolher melhorias.
- Arma no nível 8 + o item certo = evolução.

## Conteúdo
- 3 personagens: Vaqueiro, Pescador e Forrozeira (liberados por conquista ou rapadura)
- 8 armas com evolução: Chapéu de Couro, Peixeira, Baladeira, Sanfona, Fogueira de São João, Rojão, Tarrafa e Berimbau
- 9 itens passivos, incluindo Cachaça de Alambique (mais dano, anda torto) e Ferradura (sorte)
- Inimigos: morcego, vagalume, Saci, Mula sem cabeça, Curupira (pegadas que invertem o controle) e revoadas de urubus
- Inimigos de elite que soltam o Baú do Coronel (roleta que sobe de 1 a 3 armas)
- Chefões: Lobisomem (5:00), Corpo-Seco (10:00), Cuca (12:00, poções que deixam lento) e Boitatá (14:00)
- Eventos: capelas que curam, fogueiras que dão +30% de dano, chuva no sertão e lua de sangue a partir dos 12:00
- Comida espalhada pelo mapa (tapioca, cuscuz, baião de dois)
- Minimapa, dano por arma na tela final, dificuldade adaptativa, loja, conquistas e recordes salvos no aparelho
- Instalável no celular (PWA) e funciona offline

## Publicar
O jogo está em `index.html`, sem dependências; `manifest.webmanifest`, `sw.js` e os ícones cuidam da instalação e do modo offline. No GitHub: **Settings → Pages → Branch `main` / root**. Como o domínio `dmwnezes.com` já aponta para o site principal, o jogo aparece em `dmwnezes.com/survival`.

## Testes
Adicione `?speed=4` ao endereço para acelerar o tempo (até 10x) e chegar mais rápido aos chefões.
