# 🌌 Digithin Galaxy — Jogo de Digitação Arcade Espacial

[![Versão](https://img.shields.io/badge/versão-v1.10.1-8B5CF6?style=for-the-badge&logo=gamepad)](https://github.com/rlearsi/digithin-galaxy)
[![Status](https://img.shields.io/badge/status-estável-10B981?style=for-the-badge)](https://github.com/rlearsi/digithin-galaxy)
[![Licença](https://img.shields.io/badge/licença-MIT-38BDF8?style=for-the-badge)](https://github.com/rlearsi/digithin-galaxy)

> **Digithin Galaxy** é um jogo de digitação arcade espacial moderno e roguelike, desenvolvido em **HTML5**, **CSS3 Vanilla** e **JavaScript modular**. Palavras, termos astronômicos e corpos celestes caem pela coluna central em direção a um buraco negro; o jogador digita velozmente antes que sejam tragados pelo horizonte de eventos, acumulando XP, subindo de nível com escolhas de habilidades roguelike e enfrentando 6 Comandantes Alienígenas que ameaçam o Sistema Solar.

---

## 🎮 Sumário
- [1. Visão Geral](#1-visão-geral)
- [2. Estrutura e Arquitetura do Projeto](#2-estrutura-e-arquitetura-do-projeto)
- [3. Mecânicas do Jogo (Gameplay)](#3-mecânicas-do-jogo-gameplay)
  - [3.1 Vocábulos Cósmicos & Horizonte da Terra](#31-vocábulos-cósmicos--horizonte-da-terra)
  - [3.2 Smart Targeting do Eco Cósmico & Buffer Lock](#32-smart-targeting-do-eco-cósmico--buffer-lock)
  - [3.3 Sistema de XP e Level-Up Roguelike](#33-sistema-de-xp-e-level-up-roguelike)
  - [3.4 Escudos da Terra, Horizonte Planetário & Queda de Destroços](#34-escudos-da-terra-horizonte-planetário--queda-de-destroços)
  - [3.5 Multiplicadores de Combo e Modo Fúria](#35-multiplicadores-de-combo-e-modo-fúria)
  - [3.6 Batalhas Contra Comandantes Alienígenas](#36-batalhas-contra-comandantes-alienígenas)
  - [3.7 Modos de Jogo Disponíveis](#37-modos-de-jogo-disponíveis)
- [4. Habilidades Roguelike Periódicas](#4-habilidades-roguelike-periódicas)
- [5. Guia Visual de Digitação (Finger Guide)](#5-guia-visual-de-digitação-finger-guide)
- [6. Biblioteca Cósmica (Bestiário Astronômico)](#6-biblioteca-cósmica-bestiário-astronômico)
- [7. Design, UI e Experiência do Jogador](#7-design-ui-e-experiência-do-jogador)
- [8. Controles e Atalhos de Teclado](#8-controles-e-atalhos-de-teclado)
- [9. Como Executar](#9-como-executar)
- [10. Histórico de Versões](#10-histórico-de-versões)

---

## 1. Visão Geral

O projeto foi projetado com forte ênfase na estética espacial arcade moderna, feedback sonoro dinâmico via síntese em tempo real com **Web Audio API** (sem arquivos externos de áudio) e jogabilidade responsiva.

- **Stack 100% Nativa:** HTML5 semântico, CSS3 Moderno (CSS Grid, Flexbox, Glassmorphism translúcido) e JavaScript Vanilla.
- **Zero Dependências:** Funciona imediatamente no navegador via protocolo local `file:///` ou servidores locais (Apache / LAMPP / Live Server).
- **Design Espacial Arcade:** Fundo cósmico com 200 estrelas cintilantes, estrelas cadentes, buraco negro estelar estilizado com photon sphere e disco de acreção luminoso, coluna central em vidro fosco translúcido e animação de espaguetificação gravitacional.
- **Isolamento de Armazenamento Local:** Todas as chaves utilizam o prefixo `digithin_galaxy_` no `localStorage`, garantindo total independência de recordes, conquistas, configurações e progresso em relação a outros projetos no mesmo domínio local.

---

## 2. Estrutura e Arquitetura do Projeto

A base de código é completamente modular, dividida em arquivos de responsabilidade única dentro de `css/` e `js/`:

```
digithin-galaxy/
├── index.html            # Estrutura do jogo, HUD, modais translúcidos e esteira cósmica
├── privacy.html          # Política de Privacidade & Transparência (LGPD, GitHub Pages)
├── style.css             # Agregador mestre de estilos
├── game.js               # Orquestrador central: loop RAF, matching de digitação e colisões
├── ChangeLog.md          # Registro oficial e detalhado de todas as versões do projeto
├── README.md             # Documentação do jogo e guia de uso
├── TRANSLATING.md        # Guia para localização e tradução i18n
├── AGENTS.md             # Diretrizes de design, vidro translúcido e regras técnicas
├── version.json          # Fonte da verdade de versão para detecção de atualizações
├── css/
│   ├── variables.css     # Design tokens, paleta cósmica unificada e superfícies glass
│   ├── components.css    # Botões aeroespaciais, tags, barras de progresso e badges
│   ├── layout.css        # Telas, HUD, colunas em vidro e posicionamento de elementos
│   ├── gameplay.css      # Vocábulos flutuantes, buraco negro, mira cósmica e efeitos
│   ├── modals.css        # Modais de Level-Up, pausa, biblioteca, chefão e game over
│   └── responsive.css    # Adaptações e media queries para diferentes resoluções
├── locales/              # Pacotes de tradução em 7 idiomas (en, pt, fr, de, ja, ko, zh)
└── js/
    ├── ambient.js        # Canvas de campo estelar 2D, estrelas cintilantes e buraco negro
    ├── audio.js          # Síntese Web Audio API (digitação, sucção, acertos, level-up)
    ├── i18n.js           # Mecanismo de internacionalização e carregador de pacotes JSON
    ├── data.js           # Constantes (CFG), vocabulário cósmico (75 palavras) e chefões
    ├── state.js          # Estado global da corrida e persistência local (digithin_galaxy_*)
    ├── ui.js             # Atualizações de HUD, notificações, partículas e modais
    ├── shop.js           # Mecânica de ofertas e inventário de habilidades
    ├── library.js        # Biblioteca Cósmica e estatísticas de vocabulário
    ├── spawner.js        # Motor de geração de vocábulos cósmicos e esteira de fila
    ├── skills.js         # Habilidades roguelike periódicas e mira inteligente do Eco Cósmico
    ├── boss.js           # Batalhas contra os 6 Comandantes Alienígenas e enigmas cósmicos
    ├── pause.js          # Controle de pausa/retomada com contagem 3-2-1
    ├── phase.js          # Resumo de partidas, pontuação e recordes
    └── input.js          # Captura de teclado, buffer de digitação e auto-pausa
```

---

## 3. Mecânicas do Jogo (Gameplay)

### 3.1 Vocábulos Cósmicos & Buraco Negro
Os elementos que caem do topo da tela em direção ao buraco negro são denominados **Vocábulos Cósmicos**. O jogo adota o padrão de Game UX *"Cor é Mecânica, Não Tipologia"*: todos os vocábulos comuns compartilham uma base visual serena e unificada, destacando apenas mecânicas especiais:

| Tipo de Vocábulo | Visual / Identificador | XP Concedido | Descrição |
|---|---|:---:|---|
| **Letra Isolada** | Círculo Azul Cósmico (`#2563EB`) | **+8 XP** | Vocábulo de aquecimento e memória muscular. |
| **Sílaba Cósmica** | Pílula Azul Cósmico (`#2563EB`) | **+16 XP** | Transição motora entre teclas individuais e termos complexos. |
| **Palavra Nova na Run** | Pílula Azul + Micro-badge `NOVO` | **+30 XP** | Termo virgem na partida. Requer digitação manual do jogador para ser dominado. |
| **Palavra Já Aprendida** | Pílula Azul Cósmico limpa | **+30 XP** | Termo já dominado na run; elegível para destruição pelo Eco Cósmico. |
| **Vocábulo com Habilidade** | Badge `⚡` anexado | **+30 XP** + Habilidade | Concede um drop temporário de habilidade ao ser digitado. |
| **Palavra Coringa** | Badge `💥` anexado | **+50 XP** + Limpeza de Tela | Provoca detonação cósmica que varre os termos ativos em tela. |
| **Desafio do Chefão** | Caixa de enigma translúcida | **+150 XP** + Recompensa | Dica científica para enfraquecer o Comandante Invasor. |

> **Alternância Fluida entre Espaço e Hífen:** Em termos compostos (`buraco-negro`, `poeira-estelar`, `velocidade-da-luz`), o jogador pode digitar indiferentemente a barra de **Espaço** ou a tecla **- (Hífen)** sem travar a digitação.

---

### 3.2 Distinção de Palavras Novas & Smart Targeting do Eco Cósmico
O jogo mantém transparência absoluta de gameplay sem poluir a visão do jogador:
- **Micro-badge de Palavra Nova (`.new-word-badge`):** Palavras ainda não dominadas na partida atual recebem uma pequena insígnia âmbar no canto superior esquerdo com ícone em SVG limpo (`NOVO` / `NEW`). Ao digitá-la pela primeira vez, o badge desaparece de todas as instâncias da palavra na tela e na esteira de próximos.
- **Eco Cósmico e Prioridade de Digitação:** O Eco Cósmico opera **exclusivamente sobre palavras já aprendidas** (sem o badge `NOVO`). Portanto, o jogador sabe que palavras com a insígnia `NOVO` devem ser digitadas manualmente, enquanto as palavras sem insígnia podem ser aniquiladas pela habilidade.
- **Indicador de Mira em Tempo Real (`.eco-target`):** Quando o Eco Cósmico está em ação, a palavra exata escolhida para a próxima explosão recebe um retículo astronômico em SVG e pulso dinâmico.
- **Proteção Buffer Lock:** Se o jogador já iniciou a digitação de qualquer palavra (letras acertadas no buffer), o Eco Cósmico é **bloqueado de mira-la ou destruí-la**, redirecionando a mira para outro termo livre.

---

### 3.3 Sistema de XP e Level-Up Roguelike
Durante a corrida arcade, cada vocábulo digitado alimenta a barra contínua de experiência (**XP**) no topo da tela:
1. **Acúmulo de XP:** A barra superior preenche-se em direção à meta do nível atual (`state.currentXp / state.xpRequired`).
2. **Subida de Nível (Level-Up):** Ao atingir o total necessário, o jogo pausa e exibe o modal de subida de nível com **3 cartas de habilidades aleatórias**.
3. **Seleção Tática:** O jogador escolhe 1 carta utilizando o mouse ou as teclas <kbd>1</kbd>, <kbd>2</kbd>, <kbd>3</kbd>, Setas e <kbd>Enter</kbd>.
4. **Perks Ativos da Run:** A habilidade escolhida permanece ativa por toda a corrida, operando em ciclos periódicos até o final da partida.

---

### 3.4 Escudos da Terra, Horizonte Planetário & Queda de Destroços
- O jogador inicia com **3 escudos** (🛡️ 🛡️ 🛡️).
- A partir de ~80% da altura da tela, os vocábulos não digitados entram em trajetória atmosférica perigosa, atingindo a barreira defensiva externa da Terra.
- Ao colidir com a camada atmosférica, o impacto abala as defesas planetárias e o jogador perde 1 escudo (a menos que esteja protegido pelo **Escudo de Plasma**).
- Com zero escudos, a partida é encerrada com a tela de **Game Over**. Fichas de Continue restauram integralmente os 3 escudos e permitem retomar a partida imediatamente.

---

### 3.5 Multiplicadores de Combo e Modo Fúria
Digitações consecutivas sem erros ativam o multiplicador de pontuação:
- **1 a 4 acertos:** Multiplicador normal ($1\times$).
- **5 a 9 acertos:** Multiplicador dobrado ($2\times$).
- **10 a 14 acertos:** Multiplicador triplo ($3\times$).
- **15+ acertos — MODO FÚRIA:** Multiplicador máximo que atinge até **$8\times$ pontos** totais!

---

### 3.6 Batalhas Contra Comandantes Alienígenas
Durante a jornada arcade, o Sistema Solar é invadido esporadicamente por um dos **6 Comandantes Invasores Alienígenas**:

| Comandante Invasor | Arquétipo Visual | Ameaça Alienígena | Domínio de Enigmas |
|:---|:---:|:---|:---|
| **Xylarion** | Cyan (`#06B6D4`) | Vanguarda Alienígena | Radares orbitais, sondas, naves batedoras e vácuo. |
| **Zorkon** | Emerald (`#10B981`) | Enxame Biomecânico | Colmeias cósmicas, bio-drones e matéria adaptativa. |
| **Vespera** | Violet (`#A855F7`) | Soberana Psiônica | Ondas psíquicas, hiperspaço e tempestades estelares. |
| **Kragthor** | Crimson (`#EF4444`) | General Belicista | Frotas de guerra, canhões estelares e supernovas. |
| **Nebulor** | Indigo (`#6366F1`) | Entidade Cósmica | Vórtices de matéria escura, quasars e lentes relativísticas. |
| **Xenor** | Amber (`#F59E0B`) | Consciência Central | Singularidades, velocidade da luz e buracos de minhoca. |

- O Comandante lança enigmas astronômicos em caixas de vidro fosco. Digite a resposta correta antes que ela toque o buraco negro para causar dano crítico no invasor.
- Ao derrotá-lo, o jogador escolhe uma grande recompensa: `+1 Escudo`, `+1 Ficha Continue` ou `+100 Moedas`.

---

### 3.7 Modos de Jogo Disponíveis
1. **Modo Arcade Roguelike:** A jornada estelar principal com progressão infinita de XP, cartas de Level-Up, aceleração contínua e chefões alienígenas.
2. **Modo Treinamento por Linhas do Teclado:** 4 Mundos pedagógicos (Linha Base, Linha Superior, Linha Inferior e Acentos) com progressão didática dedo-a-dedo.
3. **Modo Zen (Treino Livre):** Modo descontraído com escudos ilimitados, ideal para treinar velocidade e vocabulário sem risco de derrota.
4. **Modo Contra o Relógio (Time Attack 60s):** Desafio frenético de 1 minuto em busca do recorde máximo de palavras e WPM.

---

## 4. Habilidades Roguelike Periódicas

As habilidades obtidas no Level-Up atuam automaticamente ao longo da partida, gerenciadas pelo painel lateral direito ("Perks da Run") com recargas automáticas e fila de ativação inteligente:

| Habilidade | Tipo | Ciclo / Duração | Efeito em Jogo |
|:---|:---:|:---:|:---|
| **Dilação Espacial** | Passiva Permanente | Efeito Contínuo | Amplia o espaçamento e intervalo entre novos vocábulos gerados (2x a 5x). |
| **Bomba Estelar** | Ativa Periódica | A cada 90s | Onda de choque estelar que desintegra todos os vocábulos na tela. |
| **Escudo de Plasma** | Ativa Periódica | 10s a cada 120s | Imunidade absoluta: vocábulos caídos não removem escudos e erros não quebram o combo. |
| **Criostase Sideral** | Ativa Periódica | 10s a cada 120s | Paralisa todos os vocábulos na esteira, suspendendo a queda em direção ao buraco negro. |
| **Vórtice Cósmico** | Ativa Periódica | A cada 180s | Abre uma singularidade gravitacional central que suga todos os termos ativos da tela. |
| **Desaceleração** | Ativa Periódica | 15s a cada 60s | Reduz a velocidade de descida dos vocábulos em 50%. |
| **Eco Cósmico** | Ativa Periódica | 10s a cada 60s | Aniquila automaticamente termos aprendidos com mira inteligente (`.eco-target`) e buffer lock. |
| **Pontos em Dobro** | Ativa Periódica | 10s a cada 30s | Dobra toda a pontuação recebida por digitação durante sua vigência (2x). |

---

## 5. Guia Visual de Digitação (Finger Guide)

O jogo inclui um mini-mapa ergonômico posicionado na base da tela (`finger-guide`), ativado por padrão:
- Exibe o mapa completo de dedos e mãos em posição de repouso (Home Row: `ASDF` e `JKLÇ`).
- Destaca em tempo real o dedo correto a ser utilizado para a próxima tecla da palavra em digitação.
- Oculta-se automaticamente caso o Teclado Virtual touch esteja ativo em dispositivos móveis, evitando qualquer sobreposição visual.

---

## 6. Biblioteca Cósmica (Bestiário Astronômico)

A **Biblioteca Cósmica** cataloga todos os **75 termos astrofísicos** do jogo, divididos por complexidade (Fácil, Normal e Difícil):
- **Significado Científico:** Cada vocábulo desbloqueado exibe sua definição astronômica real e contador de vezes digitado.
- **Pausa Automática:** Abrir a biblioteca durante uma partida pausa o jogo com segurança.

---

## 7. Design, UI e Experiência do Jogador

- **Vidro Fosco Translúcido (Glassmorphism):** Superfícies aeroespaciais com refração calibrada (`backdrop-filter: blur(24px) saturate(200%)`), 100% sem bordas (`border: none !important`) e contraste otimizado.
- **Estabilidade no Cursor:** Zero efeito de salto no hover (`transform: none !important`); o feedback interativo ocorre exclusivamente por tom de cor e luminosidade mais clara.
- **Ícones Vetoriais Modernos em SVG:** 100% de ícones em SVG inline com traçado limpo, eliminando emojis nativos do sistema operacional em interfaces.
- **Internacionalização Completa (7 Idiomas):** Suporte nativo em `pt`, `en`, `fr`, `de`, `ja`, `ko`, `zh` para todas as palavras, diálogos de chefões e opções de interface.

---

## 8. Controles e Atalhos de Teclado

| Tecla / Ação | Função |
|:---:|:---|
| <kbd>A</kbd> – <kbd>Z</kbd> | Digitação direta dos vocábulos em queda |
| <kbd>Espaço</kbd> ou <kbd>-</kbd> | Digitação contínua de termos compostos espaciais (`buraco-negro`, `materia-escura`) |
| <kbd>Backspace</kbd> | Limpa o buffer de digitação e cancela a mira no vocábulo atual |
| <kbd>ESC</kbd> | Pausa ou retoma o jogo imediatamente com contagem suave |
| <kbd>1</kbd>, <kbd>2</kbd>, <kbd>3</kbd> | Escolha direta de cartas no modal de Level-Up |
| <kbd>Setas</kbd> + <kbd>Enter</kbd> | Navegação e confirmação em modais e diálogos |
| **Clique do Mouse** | Seleção de cartas, botões de ação e interação nos menus |

---

## 9. Como Executar

O projeto é estático e autônomo, não dependendo de `npm`, build tools ou bundlers externos.

### Opção 1: Diretamente no Navegador
Abra o arquivo `index.html` em qualquer navegador moderno:
```bash
google-chrome index.html
# Ou:
firefox index.html
```

### Opção 2: Servidor Web Local (Apache / LAMPP / Live Server)
Caso utilize LAMPP/XAMPP:
```
http://localhost/digithin-galaxy/
```
Ou utilizando o servidor local integrado do Python:
```bash
python3 -m http.server 8000
# Acesse no navegador: http://localhost:8000
```

---

## 10. Histórico de Versões

O registro cronológico completo de novidades, refatorações, notas de lançamento e correções de cada versão do Digithin Galaxy está documentado detalhadamente em **[ChangeLog.md](ChangeLog.md)**.
