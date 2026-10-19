# 🌌 Digithin Galaxy — Jogo de Digitação Arcade Espacial

[![Versão](https://img.shields.io/badge/versão-v1.18-8B5CF6?style=for-the-badge&logo=gamepad)](ChangeLog.md)
[![Status](https://img.shields.io/badge/status-estável-10B981?style=for-the-badge)](https://github.com/rlearsi/digithin-galaxy)
[![Licença](https://img.shields.io/badge/licença-MIT-38BDF8?style=for-the-badge)](https://github.com/rlearsi/digithin-galaxy)

> **Digithin Galaxy** é um jogo de digitação arcade espacial moderno e roguelike, desenvolvido em **HTML5**, **CSS3 Vanilla** e **JavaScript modular**. Palavras, termos astronômicos e corpos celestes caem pela coluna central em direção à Terra; o jogador digita velozmente para proteger o planeta e sua barreira defensiva contra o impacto dos destroços celestes, acumulando XP, subindo de nível com escolhas de habilidades roguelike e enfrentando 6 Comandantes Alienígenas que ameaçam o Sistema Solar.

---

## 🎮 Sumário
- [1. Visão Geral](#1-visão-geral)
- [2. Estrutura e Arquitetura do Projeto](#2-estrutura-e-arquitetura-do-projeto)
- [3. Mecânicas do Jogo (Gameplay)](#3-mecânicas-do-jogo-gameplay)
  - [3.1 Vocábulos Cósmicos & Defesa da Terra](#31-vocábulos-cósmicos--defesa-da-terra)
  - [3.2 Smart Targeting do Eco Cósmico & Buffer Lock](#32-smart-targeting-do-eco-cósmico--buffer-lock)
  - [3.3 Sistema de XP e Level-Up Roguelike](#33-sistema-de-xp-e-level-up-roguelike)
  - [3.4 Escudos da Terra, Horizonte Planetário & Queda de Destroços](#34-escudos-da-terra-horizonte-planetário--queda-de-destroços)
  - [3.5 Multiplicadores de Combo e Modo Fúria](#35-multiplicadores-de-combo-e-modo-fúria)
  - [3.6 Batalhas Contra Comandantes Alienígenas](#36-batalhas-contra-comandantes-alienígenas)
  - [3.7 Modos de Jogo Disponíveis](#37-modos-de-jogo-disponíveis)
  - [3.8 Trilha Sonora & Suíte Musical Procedural (Web Audio API)](#38-trilha-sonora--suíte-musical-procedural-web-audio-api)
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
- **Design Espacial Arcade:** Fundo cósmico com 200 estrelas cintilantes, estrelas cadentes, o Planeta Terra curvado no horizonte inferior com escudo orbital luminoso e atmosfera reativa, coluna central em vidro fosco translúcido e física realista de estilhaços celestes.
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
│   ├── gameplay.css      # Vocábulos flutuantes, horizonte da Terra, barreira de escudo e efeitos
│   ├── modals.css        # Modais de Level-Up, pausa, biblioteca, chefão e game over
│   └── responsive.css    # Adaptações e media queries para diferentes resoluções
├── locales/              # Pacotes de tradução em 7 idiomas (en, pt, fr, de, ja, ko, zh)
└── js/
    ├── ambient.js        # Canvas de campo estelar 2D, estrelas cintilantes e atmosfera reativa
    ├── audio.js          # Síntese Web Audio API (digitação, impactos, acertos, level-up)
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

### 3.1 Vocábulos Cósmicos & Defesa da Terra
Os elementos que caem do topo da tela em direção à órbita da Terra são denominados **Vocábulos Cósmicos**. O jogador deve destruí-los velozmente antes que atinjam a atmosfera e comprometam os escudos do planeta. O jogo adota o padrão de Game UX *"Cor é Mecânica, Não Tipologia"*: todos os vocábulos comuns compartilham uma base visual serena e unificada, destacando apenas mecânicas especiais:

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

### 3.6 Batalhas Contra Comandantes Alienígenas (Invasão do Espaço)
Durante a corrida contínua, aliens invasores surgem aleatoriamente vindo das profundezas do espaço sideral para atacar o planeta Terra. Cada um dos **6 Comandantes Alienígenas** possui visual estilizado e características morfológicas únicas:

| Comandante Invasor | Estilo & Características Únicas | Ameaça Alienígena | Domínio de Enigmas |
|:---|:---:|:---|:---|
| **Zorkon** | **Lagarto / Réptil Cósmico** (`#10B981`) — Escamas esmeralda, crista de espinhos dorsais, olhos dourados com pupila vertical e língua bífida. | Enxame Biomecânico | Colmeias cósmicas, bio-drones e matéria adaptativa. |
| **Vespera** | **Psíquica com Cabelos de Tentáculos** (`#A855F7`) — Cabelos longos ondulantes de energia cósmica/plasma e terceiro olho místico. | Soberana Psiônica | Ondas psíquicas, hiperspaço e tempestades estelares. |
| **Xylarion** | **Ciborgue com Cabos e Visor** (`#06B6D4`) — Mechas de fibra ótica azulada, visor laser biomecânico e antenas mecatrônicas. | Vanguarda Alienígena | Radares orbitais, sondas, naves batedoras e vácuo. |
| **Kragthor** | **Brutamontes com Chifres e Magma** (`#EF4444`) — Chifres curvados gigantes, juba/cabelo em chamas de magma e mandíbula pesada. | General Belicista | Frotas de guerra, canhões estelares e supernovas. |
| **Nebulor** | **Sombra com Cabelos de Névoa Estelar** (`#6366F1`) — Capuz espectral, filamentos de poeira cósmica ondulantes e 4 olhos hipnóticos. | Entidade Cósmica | Vórtices de matéria escura, quasars e lentes relativísticas. |
| **Xenor** | **Imperador com Cabelo de Fogo Solar** (`#F59E0B`) — Cabelos flamejantes dourados formando uma coroa radiante imperial. | Consciência Central | Singularidades, velocidade da luz e buracos de minhoca. |

- **Dinâmica de Ataque à Terra:** O Alien surge no céu espacial e executa animações de arremesso, jogando projéteis com enigmas em direção à Terra.
- **Velocidade dos Enigmas:** Mantida confortavelmente lenta e fixa em $1\times$ durante toda a batalha com o Alien.
- **Contra-ataque da Terra:** A cada palavra correta digitada pelo jogador, o projétil se estilhaça e um raio de plasma sobe da Terra causando dano crítico (-1 Vida) no Alien.
- **Escolha de Habilidades Especiais:** Ao derrotar o Alien, o jogador escolhe entre 3 recompensas de prestígio:
  1. 🔄 **+1 Continue:** Ficha de ressurreição instantânea para a partida.
  2. 🛡️ **+1 Escudo:** Restaura ou amplia a barreira defensiva planetária da Terra.
  3. 🪙 **+100 Moedas:** +100 moedas cósmicas instantâneas adicionadas à carteira do jogador.
- **Restauração de Velocidade:** Ao final da batalha, a velocidade do jogo retorna suavemente ao padrão anterior da corrida.

---

### 3.7 Modos de Jogo Disponíveis
1. **Modo Arcade Roguelike:** A jornada estelar principal com progressão infinita de XP, cartas de Level-Up, aceleração contínua e chefões alienígenas.
2. **Modo Treinamento por Linhas do Teclado:** 4 Mundos pedagógicos (Linha Base, Linha Superior, Linha Inferior e Acentos) com progressão didática dedo-a-dedo.
3. **Modo Zen (Treino Livre):** Modo descontraído com escudos ilimitados, ideal para treinar velocidade e vocabulário sem risco de derrota.
4. **Modo Contra o Relógio (Time Attack 60s):** Desafio frenético de 1 minuto em busca do recorde máximo de palavras e WPM.

---

### 3.8 Trilha Sonora & Suíte Musical Procedural (Web Audio API)

O Digithin Galaxy conta com um motor de áudio e música **100% nativo e procedural**, sintetizado em tempo real no navegador via **Web Audio API** através de osciladores, filtros biquad e geradores de ruído (`js/audio.js`). O sistema não utiliza nenhum arquivo externo de áudio (`.mp3` ou `.ogg`), garantindo carregamento instantâneo com zero latência, peso zero de download e sincronização matemática precisa.

A suíte musical é composta por **7 faixas originais com identidades e especificações exclusivas**: uma faixa relaxante para a exploração normal e 6 temas dramáticos de ação e suspense para cada Comandante Alienígena.

#### Tabela Comparativa da Suíte Musical

| Faixa / Contexto | Invasor / Momento | BPM | Escala / Harmonia | Timbre Principal | Estilo Musical & Atmosfera |
|:---|:---|:---:|:---|:---|:---|
| **Cosmic Voyage** | Partida Normal (sem Boss) | **82** | Fá Maior Lídio / Pentatônica | Onda Senoidal (`sine`) macia + Sinos Triângulo | Ambient Espacial / Ethereal Synthwave |
| **March of the Warlord** | **Kragthor** (Belicista `#EF4444`) | **144** | Mi Menor com Sensível Ré# e Trítono | Dente-de-serra (`sawtooth`) a 420Hz + Bumbo Duplo | Ação Militar Alienígena / Metal Arcade 16-bit |
| **Psionic Dread** | **Vespera** (Psiônica `#A855F7`) | **124** | Dó Frígio (Intervalo de 2ª menor) | Triângulo a 280Hz + Onda Quadrada com vibrato | Puro Suspense Cósmico / Terror Alienígena |
| **Titanium Siege** | **Xylarion** (Couraçado `#06B6D4`) | **134** | Ré Menor Dórico Sincopado | Dente-de-serra a 380Hz + Arpeggios Quadrados | Cyberpunk Industrial / Couraçado Mecha |
| **Swarm Infiltration** | **Zorkon** (Colmeia `#10B981`) | **140** | Lá Menor Cromático Descendente | Dente-de-serra a 450Hz + Percussão Tribal | Caos Extraterrestre / Perseguição de Enxame |
| **Singularity Abyss** | **Nebulor** (Matéria Escura `#6366F1`) | **120** | Si Lócrio / Menor com 5ª Diminuta | Triângulo ultra-grave a 260Hz + Lead Espectral | Terror Abissal / Singularidade Gravitacional |
| **Imperial Cataclysm** | **Xenor** (Nave-Mãe `#F59E0B`) | **140** | Sol Menor Orquestral em Crescendo | Fanfarra Quadrada + Baixo Galopante a 400Hz | Clímax Imperial Sinfônico / Batalha Decisiva |

---

#### Fichas Técnicas Detalhadas de Cada Faixa

##### 1. Cosmic Voyage (Trilha da Partida Normal)
- **Contexto:** Toca suavemente durante a digitação regular de vocábulos e termos astronômicos, antes do surgimento de chefões.
- **BPM:** `82 BPM` (Andamento calmo, contemplativo e relaxante).
- **Harmonia & Modos:** Fá Maior Lídio / Pentatônica Cósmica com tétrades suaves e abertas:
  * Compasso 1: `Fmaj7` (`['F4', 'A4', 'C5', 'E5']`)
  * Compasso 2: `Cmaj7` (`['C4', 'E4', 'G4', 'B4']`)
  * Compasso 3: `Dm7` (`['D4', 'F4', 'A4', 'C5']`)
  * Compasso 4: `Am7` (`['A3', 'C4', 'E4', 'G4']`)
  * Compasso 5 a 8: Progressão harmônica com `Bbmaj7`, `Fmaj7`, `Gm7` e `Cadd9`.
- **Timbres & Formas de Onda:**
  * **Pads Atmosféricos:** Ondas senoidais puras (`sine`) com envelope macio (ataque suave de 250ms e decaimento de 7.5 tempos), preenchendo o vácuo espacial com textura sedosa.
  * **Sinos de Poeira Cósmica:** Onda triângulo (`triangle`) aveludada disparando notas estelares cintilantes nos contra-tempos.
  * **Sub-Baixo Quente:** Onda senoidal pura em oitavas graves (`F1`, `C2`, `D2`, `A1`), criando sensação de sustentação gravitacional suave.
- **Estilo:** Ambient Espacial / Chillout Lofi Sci-Fi.
- **Objetivo Sonoro:** Proporcionar máximo conforto auditivo e concentração para a leitura e digitação, sem poluição sonora.

##### 2. March of the Warlord (Tema do Boss Kragthor — `#EF4444`)
- **Contexto:** Batalha contra o General Belicista Kragthor e sua frota armada de cruzadores pesados.
- **BPM:** `144 BPM` (Ação frenética, urgente e veloz).
- **Harmonia & Modos:** Mi Menor Natural e Menor Harmônico com o intervalo dissonante de trítono (`Bb2`) e a sensível dramática (`D#4` / `D#5`):
  * Progressão: `Em` $\rightarrow$ `C` $\rightarrow$ `Am` $\rightarrow$ `B7`.
- **Timbres & Formas de Onda:**
  * **Baixo Galopante:** Onda dente-de-serra (`sawtooth`) com corte em filtro passa-baixas a 420Hz, simulando palhetada dupla contínua de baixo elétrico pesado.
  * **Lead Melódico:** Onda dente-de-serra com ataque rápido e vibrato agressivo, executando riffs cortantes.
  * **Bateria Militar de Assalto:** Bumbo analógico em triângulo descendo bruscamente de 140Hz para 30Hz em 80ms, com caixa estalada gerada por ruído branco filtrado a 1200Hz.
- **Estilo:** Heavy Action Chiptune / Metal Arcade 16-bit (*Doom / Contra*).
- **Objetivo Sonoro:** Impulsionar a adrenalina e velocidade de digitação em um ritmo marcial implacável.

##### 3. Psionic Dread (Tema da Boss Vespera — `#A855F7`)
- **Contexto:** Confronto contra a Rainha das Sombras Vespera e suas ondas psíquicas alienígenas.
- **BPM:** `124 BPM` (Cadenciado, arrastado e tenso).
- **Harmonia & Modos:** Dó Frígio (`C`, `Db`, `Eb`, `F`, `G`, `Ab`, `Bb`), explorando o choque psicológico da 2ª menor (`Db`) contra a tônica (`C`):
  * Progressão: `Cm` $\rightarrow$ `Db` $\rightarrow$ `Fm` $\rightarrow$ `Gdim`.
- **Timbres & Formas de Onda:**
  * **Baixo Sombrio:** Onda triângulo (`triangle`) filtrada a 280Hz, emitindo passos furtivos no vácuo.
  * **Lead Psiônico:** Onda quadrada (`square`) com sustentação misteriosa e modulação sutil de frequência evocando lamentos espaciais.
  * **Arpeggiator Rápido:** Semicolcheias arpeggiadas que desenham nuvens mentais imprevisíveis.
  * **Percussão Espectral:** Caixas secas e batimentos esparsos que quebram o padrão convencional de bateria.
- **Estilo:** Dark Ambient Suspense / Chiptune Gótico (*Super Metroid / Castlevania: Symphony of the Night*).
- **Objetivo Sonoro:** Criar clima de suspense e arrepios, fazendo o jogador sentir a pressão psíquica da invasão.

##### 4. Titanium Siege (Tema do Boss Xylarion — `#06B6D4`)
- **Contexto:** Batalha contra o Couraçado Cibernético Xylarion e sua armadura de titânio biomecânica.
- **BPM:** `134 BPM` (Firme, mecânico e percussivo).
- **Harmonia & Modos:** Ré Menor Dórico com 6ª maior (`B`) e síncopes industriais:
  * Progressão: `Dm` $\rightarrow$ `G` $\rightarrow$ `F` $\rightarrow$ `Bb`.
- **Timbres & Formas de Onda:**
  * **Baixo Mecatrônico:** Onda dente-de-serra (`sawtooth`) filtrada a 380Hz com acentuação em oitavas robóticas sincopadas.
  * **Lead Laser:** Onda quadrada (`square`) com estalidos agudos simulando disparos de lasers e circuitos integrados.
  * **Percussão Industrial:** Bumbo de impacto sólido e pratos de ruído passa-altas a 6500Hz simulando engrenagens e turbinas metálicas.
- **Estilo:** Cyberpunk Industrial / Mecha Arcade (*Mega Man X / OutRun 16-bit*).
- **Objetivo Sonoro:** Transmitir a sensação de embate contra uma máquina impenetrável de engenharia alienígena avançada.

##### 5. Swarm Infiltration (Tema do Boss Zorkon — `#10B981`)
- **Contexto:** Combate contra a horda reptiliana adaptativa do Comandante Zorkon.
- **BPM:** `140 BPM` (Frenético, ágil e sinuoso).
- **Harmonia & Modos:** Lá Menor com arpeggios cromáticos descendentes (`A` $\rightarrow$ `G#` $\rightarrow$ `G` $\rightarrow$ `F#` $\rightarrow$ `F`):
  * Progressão: `Am` $\rightarrow$ `Dm` $\rightarrow$ `F` $\rightarrow$ `E7`.
- **Timbres & Formas de Onda:**
  * **Baixo Serpenteante:** Onda dente-de-serra (`sawtooth`) com filtro aberto a 450Hz, correndo velozmente pelas notas da escala.
  * **Lead de Enxame:** Onda quadrada rápida com notas staccato ultracurtas simulando o movimento de milhares de bio-drones.
  * **Bateria Tribal:** Síncopes em semicolcheias rápidas e rufos de caixa em compasso acelerado.
- **Estilo:** Extraterrestrial Chaos / Hive Swarm Rush.
- **Objetivo Sonoro:** Gerar sensação de perseguição ininterrupta, forçando digitação rápida e reflexos afiados.

##### 6. Singularity Abyss (Tema do Boss Nebulor — `#6366F1`)
- **Contexto:** Duelo contra a Entidade Espectral Nebulor no horizonte de eventos de um buraco negro de matéria escura.
- **BPM:** `120 BPM` (Profundo, gravitacional e imersivo).
- **Harmonia & Modos:** Si Lócrio e Si Menor Abissal com acordes de 5ª diminuta:
  * Progressão: `Bm` $\rightarrow$ `Fdim` $\rightarrow$ `Em` $\rightarrow$ `G`.
- **Timbres & Formas de Onda:**
  * **Pulso Gravitacional:** Baixo em onda triângulo (`triangle`) com filtro sub-grave a 260Hz, ressoando como ondas gravitacionais de baixa frequência.
  * **Lead Espectral:** Onda dente-de-serra com notas longas em decaimento lento, ecoando no vazio absoluto.
  * **Drums do Abismo:** Bumbos profundos com sustentação prolongada e percussão soturna.
- **Estilo:** Cosmic Void Horror / Abyssal Space Chiptune (*FTL / Dead Space 16-bit*).
- **Objetivo Sonoro:** Evocar a pequenez do ser humano perante as forças misteriosas e devoradoras da matéria escura.

##### 7. Imperial Cataclysm (Tema do Boss Xenor — `#F59E0B`)
- **Contexto:** A batalha final decisiva contra a Nave-Mãe Imperial do Imperador Xenor.
- **BPM:** `140 BPM` (Grandioso, triunfal e dramático).
- **Harmonia & Modos:** Sol Menor Épico com progressão clássica de confronto final em crescendo sinfônico:
  * Progressão: `Gm` $\rightarrow$ `Eb` $\rightarrow$ `Cm` $\rightarrow$ `D7`.
- **Timbres & Formas de Onda:**
  * **Fanfarra Imperial:** Onda quadrada dupla com arpeggios heróicos e acordes orquestrais 16-bit.
  * **Baixo Galopante Imperial:** Onda dente-de-serra a 400Hz mantendo o ritmo de marcha triunfal com oitavas duplas.
  * **Percussão de Batalha:** Caixa marcial e bumbo sincronizados em compassos dramáticos.
- **Estilo:** Clímax Sinfônico 16-bit / Boss Battle Final (*Final Fantasy VI / Chrono Trigger*).
- **Objetivo Sonoro:** Clímax épico máximo, transmitindo a urgência heróica da última esperança de defesa do planeta Terra.

---

#### Ciclo de Transições e Gerenciamento Dinâmico de Áudio
1. **Início da Partida (`startGame`):** A trilha relaxante *Cosmic Voyage* inicia suavemente através de um fade-in de 600ms.
2. **Invasão do Boss (`beginBossPhase`):** O sistema realiza crossfade instantâneo: a música normal faz fade-out de 450ms e o tema de ação específico daquele chefe entra com impacto via fade-in de 350ms.
3. **Derrota do Boss (`defeatBoss`):** O tema do chefe é interrompido com fade-out de 450ms e a trilha suave *Cosmic Voyage* é restabelecida automaticamente para a continuidade da corrida.
4. **Pausa & Retomada (`pauseGame` / `resumeGame`):** A música ativa pausa imediatamente e retoma perfeitamente sincronizada ao final da contagem regressiva de 3 segundos.
5. **Controle de Mudo (`toggleSound`):** Rampa suavemente os ganhos de masterização em 80ms, evitando estalos ou cortes abruptos de áudio.

---

## 4. Habilidades Roguelike Periódicas

As habilidades obtidas no Level-Up atuam automaticamente ao longo da partida, gerenciadas pelo painel lateral direito ("Perks da Run") com recargas automáticas e fila de ativação inteligente:

| Habilidade | Tipo | Ciclo / Duração | Efeito em Jogo |
|:---|:---:|:---:|:---|
| **Dilação Espacial** | Passiva Permanente | Efeito Contínuo | Amplia o espaçamento e intervalo entre novos vocábulos gerados (2x a 5x). |
| **Bomba Estelar** | Ativa Periódica | A cada 90s (Nv. 1 a 5) | Onda de choque estelar cujo raio expande a cada upgrade até atingir a tela toda no Nv. 5. |
| **Escudo de Plasma** | Ativa Periódica | 10s a 50s a cada 180s | Imunidade absoluta no escudo da Terra: duração cresce de 10s (Nv. 1) a 50s (Nv. 5). |
| **Criostase Sideral** | Ativa Periódica | 10s a cada 120s | Paralisa todos os vocábulos na esteira, suspendendo a queda em direção à Terra. |
| **Vórtice Cósmico** | Ativa Periódica | A cada 180s | Abre um vórtice gravitacional temporário no centro da tela que suga todos os termos ativos da tela. |
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
