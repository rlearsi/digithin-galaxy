# 🌌 Digithin Galaxy — Jogo de Digitação Arcade Espacial

[![Versão](https://img.shields.io/badge/versão-v1.3-6366F1?style=for-the-badge&logo=gamepad)](https://github.com/rlearsi/digithin-galaxy)
[![Status](https://img.shields.io/badge/status-estável-10B981?style=for-the-badge)](https://github.com/rlearsi/digithin-galaxy)
[![Licença](https://img.shields.io/badge/licença-MIT-38BDF8?style=for-the-badge)](https://github.com/rlearsi/digithin-galaxy)

> **Digithin Galaxy** é um jogo de digitação arcade moderno, dinâmico e polido ambientado no espaço sideral profundo, construído em **HTML5**, **CSS3 Vanilla** e **JavaScript modular**. Palavras, termos astronômicos e corpos celestes caem em direção a um buraco negro ao fundo; o jogador digita velozmente antes que as palavras sejam engolidas pelo horizonte de eventos, acumulando pontos, avançando de fase e enfrentando 6 Comandantes Invasores Alienígenas que ameaçam invadir o Sistema Solar.

---

## 🎮 Sumário
- [1. Visão Geral](#1-visão-geral)
- [2. Estrutura e Arquitetura do Projeto](#2-estrutura-e-arquitetura-do-projeto)
- [3. Mecânicas do Jogo (Gameplay)](#3-mecânicas-do-jogo-gameplay)
  - [3.1 Os Tokens Cósmicos & Buraco Negro](#31-os-tokens-cósmicos--buraco-negro)
  - [3.2 Sistema de Fases e Progressão](#32-sistema-de-fases-e-progressão)
  - [3.3 Sistema de Pontuação Dupla e Penalidades](#33-sistema-de-pontuação-dupla-e-penalidades)
  - [3.4 Vida e Condição de Derrota](#34-vida-e-condição-de-derrota)
  - [3.5 Sistema de Combo & Modo Fúria](#35-sistema-de-combo--modo-fúria)
  - [3.6 Modos de Jogo Disponíveis](#36-modos-de-jogo-disponíveis)
  - [3.7 Batalhas Contra Comandantes Alienígenas](#37-batalhas-contra-comandantes-alienígenas)
- [4. Sistema de Habilidades](#4-sistema-de-habilidades)
- [5. Loja de Habilidades e Economia](#5-loja-de-habilidades-e-economia)
- [6. Biblioteca Cósmica (Bestiário)](#6-biblioteca-cósmica-bestiário)
- [7. Design, UI e Experiência do Jogador](#7-design-ui-e-experiência-do-jogador)
- [8. Controles e Atalhos de Teclado](#8-controles-e-atalhos-de-teclado)
- [9. Como Executar](#9-como-executar)
- [10. Histórico de Versões (Changelog)](#10-histórico-de-versões-changelog)

---

## 1. Visão Geral

O projeto foi projetado com forte ênfase na estética espacial arcade moderna, feedback sonoro dinâmico via síntese em tempo real com **Web Audio API** (sem arquivos externos de áudio) e jogabilidade responsiva.

- **Stack 100% Nativa:** HTML5 semântico, CSS3 Moderno (CSS Grid, Flexbox, Glassmorphism translúcido) e JavaScript Vanilla.
- **Zero Dependências:** Funciona imediatamente tanto no protocolo `file:///` direto no navegador quanto em servidores locais (Apache / LAMPP / Live Server).
- **Design Espacial Arcade:** Fundo cósmico com 200 estrelas cintilantes, estrelas cadentes, buraco negro estelar estilizado com photon sphere e disco de acreção, coluna de jogo centralizada e efeitos de espaguetificação sonora e visual ao engolir termos não digitados.
- **Isolamento de Armazenamento Local:** Todas as chaves utilizam o prefixo `digithin_galaxy_` no `localStorage`, garantindo total independência de moedas, slots salvos e recordes em relação a outros projetos no mesmo domínio local.

---

## 2. Estrutura e Arquitetura do Projeto

A base de código é completamente desacoplada em módulos de responsabilidade única dentro das pastas `css/` e `js/`:

```
digithin-galaxy/
├── index.html            # Estrutura do jogo, HUD, modais e scripts
├── privacy.html          # Política de Privacidade & Transparência (LGPD, GitHub Pages)
├── style.css             # Agregador mestre (@import) dos submódulos de estilo
├── game.js               # Orquestrador central: ciclo de jogo, loop RAF e matching de digitação
├── ChangeLog.md          # Histórico detalhado de alterações do Digithin Galaxy
├── README.md             # Esta documentação completa do projeto
├── TRANSLATING.md        # Guia para tradutores e localização i18n
├── AGENTS.md             # Regras de design, glassmorphism e diretrizes técnicas
├── version.json          # Arquivo de versão remota para detecção de atualizações
├── css/
│   ├── variables.css     # Design tokens, paleta estelar, temas e superfícies translúcidas
│   ├── components.css    # Botões, interruptor de tema, badges de velocidade e tags
│   ├── layout.css        # Telas, HUD, colunas flutuantes em vidro e tabuleiro
│   ├── gameplay.css      # Tokens espaciais flutuantes, animação de buraco negro, auras
│   ├── modals.css        # Modais translúcidos de pausa, vitória de fase, loja, biblioteca e game over
│   └── responsive.css    # Media queries e adaptações para viewports menores
├── locales/              # Pacotes de idiomas (en, pt, fr, de, ja, ko, zh)
└── js/
    ├── ambient.js        # Canvas de campo estelar 2D, estrelas cintilantes e buraco negro
    ├── audio.js          # Síntese Web Audio API (hit, word, sucção de buraco negro, erro, vida)
    ├── i18n.js           # Sistema de internacionalização (i18n) e carregador JSON multilíngue
    ├── data.js           # Constantes (CFG), dicionário cósmico (75 palavras), habilidades e chefões
    ├── state.js          # Definição do estado global e persistência no localStorage (digithin_galaxy_*)
    ├── ui.js             # Atualizações de HUD, modais translúcidos, fila e partículas
    ├── shop.js           # Mecânica da loja espacial, navegação por teclado e inventário
    ├── library.js        # Biblioteca Cósmica de termos descobertos e contadores de frequência
    ├── spawner.js        # Motor de geração de tokens cósmicos, esteira de fila e espaçamento
    ├── skills.js         # Acionamento de habilidades ativas (congelamento, bomba, vórtex, escudo)
    ├── boss.js           # Batalhas contra os 6 Comandantes Alienígenas, enigmas cósmicos e recompensas
    ├── pause.js          # Controle de pausa/retomada, contagem 3-2-1 e modais de saída
    ├── phase.js          # Progressão de fases, tela de vitória, resumo didático e recordes
    └── input.js          # Captura e roteamento de teclado, suporte a espaço/hífen e auto-pausa
```

---

## 3. Mecânicas do Jogo (Gameplay)

### 3.1 Os Tokens Cósmicos & Buraco Negro
Os itens que caem do topo da tela em direção ao buraco negro são denominados **Tokens Cósmicos**. Suas cores de fundo seguem uma ordem térmica intuitiva:

| Tipo de Token | Temperatura / Nível | Exemplo | Pontuação Base | Visual e Estilo |
|---|---|---|---|---|
| **Letra** | ❄️ **Fria (Gélida)** | `A`, `B`, `K` | **1 ponto** | Círculo azul espacial (`#2563EB`) de 44px com texto branco |
| **Sílaba** | 🌿 **Temperada (Fresca)** | `CA`, `SOL`, `LUA` | **3 pontos** | Pílula verde esmeralda (`#059669`) |
| **Palavra Cósmica** | ☀️ **Quente (Solar)** | `ORBITA`, `PULSAR` | **3 pts × letras** | Pílula âmbar dourado (`#D97706`) |
| **Palavra com Habilidade** | ⚡ **Incandescente (Plasma)** | `ESTRELA ⚡` | Pontuação da palavra + **Habilidade** | Pílula magenta radiante (`#D946EF`), aura estelar e badge `⚡` |
| **Palavra Coringa** | 💥 **Supernova / Caos** | `BURACO`, `NOVA` | **10 pts base + Pontos da tela toda** | Pílula violeta (`#8B5CF6`) e badge `💥` |
| **🚨 Tragada Estelar** | 🔥 **Singularidade Gravitacional** | Qualquer palavra no horizonte de eventos | — | Animação de estiramento gravitacional (`swallowIntoBlackHole`), pulso relativístico e perda de 1 vida |

> **Suporte Fluido a Espaço e Hífen:** Para termos compostos espaciais (`buraco-negro`, `poeira-estelar`, `velocidade-da-luz`), o jogador pode pressionar indistintamente a barra de **Espaço** ou a tecla **- (Hífen)**, digitando com naturalidade e velocidade contínua.

---

### 3.2 Sistema de Fases e Progressão
A barra de progresso no centro do HUD avança conforme os tokens cósmicos são digitados com sucesso. Ao atingir a meta da fase:
- O jogo é pausado imediatamente com chuva festiva de partículas estelares e áudio de celebração.
- O modal de fase completa exibe o resumo financeiro de pontos e moedas e desbloqueia **3 palavras aleatórias** para o acervo cósmico do jogador.
- Ao iniciar uma nova fase:
  - **A velocidade adicional acumulada é reiniciada para 1.0×** (`baseSpeed`).
  - **O contador de combo e o Modo Fúria são reiniciados para 0×**.

#### Metas de Cada Fase:
- **Fase 1:** **10 pontos**
- **Fase 2:** **20 pontos**
- **Fase 3:** **30 pontos**
- **Fase 4:** **40 pontos**
- **Fase 5:** **50 pontos**
- **Fase 6 em diante:** **Progressão linear (+10 pontos a cada nova fase)**: $\text{Meta} = \text{Fase} \times 10$

---

### 3.3 Sistema de Pontuação Dupla e Penalidades

1. **Pontos da Fase (`FASE`):** Pontos ganhos na fase atual através de digitação, palavras completas e explosões.
2. **Pontos Totais Acumulados (`TOTAL`):** Saldo bancado definitivo usado como moeda na Loja Espacial, formatado com 10 dígitos (ex.: `0000098120`).
3. **Penalidade por Erro de Digitação:**
   - **Trava de Proteção (Campo Vazio):** Caso não haja nenhum token ativo na coluna no momento da digitação, nenhuma penalidade é aplicada.
   - **Punição Condicional:** Se houver palavras em tela e o jogador errar uma tecla, reduz-se a barra de progresso, a velocidade sobe suavemente (+0.1×) e o erro é contabilizado para apuração no fim da fase.

---

### 3.4 Vida e Condição de Derrota
- O jogador inicia a partida com **3 vidas** (❤️ ❤️ ❤️).
- Se uma palavra atinge o horizonte de eventos do buraco negro (exceto com **Imunidade** ativa), ela é espaguetificada e o jogador perde 1 vida.
- Quando as vidas chegam a zero, surge a tela de **Game Over**. Com **Fichas Continue**, é possível reviver imediatamente na mesma fase.

---

### 3.5 Sistema de Combo & Modo Fúria
- **Sequência de Acertos:** Cada palavra completada sem erros incrementa o contador de combo:
  - **1 a 4 acertos:** Multiplicador normal ($1\times$).
  - **5 a 9 acertos:** Multiplicador dobrado ($2\times$).
  - **10 a 14 acertos:** Multiplicador triplo ($3\times$).
  - **15+ acertos — MODO FÚRIA:** Multiplicador quádruplo ($4\times$) que **dobra novamente** no modo fúria (totalizando até **$8\times$ pontos**!).

---

### 3.6 Modos de Jogo Disponíveis
1. **Modo Clássico:** A experiência arcade espacial completa com vidas, fases progressivas, loja e chefões alienígenas a cada 8 fases.
2. **Modo Treinamento por Linhas do Teclado:** 4 Mundos estruturados pedagogicamente (Linha Base, Superior, Inferior e Acentos) com lições de fixação motora e recorde de precisão.
3. **Modo Zen (Treino Livre):** Sem perda de vidas, ideal para praticar vocabulário cósmico e velocidade sem risco de Game Over.
4. **Modo Contra o Relógio (Time Attack 60s):** Corrida eletrizante de 60 segundos com cronômetro regressivo e pontuação máxima.

---

### 3.7 Batalhas Contra Comandantes Alienígenas
A cada **8 fases** (fases 8, 16, 24, 32, 40, 48…), a coluna cósmica é invadida por um dos **6 Comandantes Invasores Alienígenas** em ordem fixa:

| Fase | Comandante Invasor | Arquétipo / Cor | Ameaça Alienígena | Universo dos Enigmas |
|:---:|:---|:---:|:---|:---|
| **8** | **Xylarion** | `xylarion` (Cyan `#06B6D4`) | Arauto da Vanguarda Alienígena | Sondas orbitais, radares, naves batedoras e vácuo. |
| **16** | **Zorkon** | `zorkon` (Emerald `#10B981`) | Mestre do Enxame Biomecânico | Colmeias cósmicas, bio-drones e matéria adaptativa. |
| **24** | **Vespera** | `vespera` (Violet `#A855F7`) | Soberana Psiônica Extraterrestre | Ondas de choque mentais, hiperspaço e aurora boreal cósmica. |
| **32** | **Kragthor** | `kragthor` (Crimson `#EF4444`) | General Belicista Alienígena | Frotas de batalha, canhões estelares e supernovas destrutivas. |
| **40** | **Nebulor** | `nebulor` (Indigo `#6366F1`) | Entidade Cósmica Invasora | Vórtices de matéria escura, quasars e lente gravitacional. |
| **48** | **Xenor** | `xenor` (Amber `#F59E0B`) | Consciência Central da Invasão | Núcleo de singularidade, velocidade da luz e buraco de minhoca. |

#### Dinâmica do Duelo:
1. **Entrada do Comandante:** O invasor alienígena surge no topo com avatar vetorial SVG inline e medidor arcade de **Pontos de Vida: `|||`**.
2. **Caixa de Enigma Gravitacional:** Uma caixa translúcida em vidro fosco desce contendo a dica científica e o número de letras da palavra secreta.
3. **Impacto Devastador:** Digite a palavra antes que a caixa encoste no horizonte de eventos para causar dano crítico no invasor.
4. **Recompensa de Vitória:** Ao derrotar o Comandante, o jogador escolhe 1 entre 3 habilidades especiais gratuitas.

---

## 4. Sistema de Habilidades

As habilidades podem ser acumuladas no HUD e acionadas por teclado (<kbd>1</kbd>–<kbd>8</kbd>) ou clique:

| Ícone | Habilidade | Duração | Descrição do Efeito |
|:---:|:---|:---:|:---|
| ❄️ | **Freezer** | 10s | Congela todos os tokens na tela impedindo sua descida em direção ao buraco negro. |
| 💣 | **Bomba** | 10s | Cada palavra digitada gera uma onda de choque que destrói palavras próximas e absorve seus pontos. |
| 🛡️ | **Imunidade** | 10s | Cria uma barreira estelar: palavras engolidas não tiram vidas e erros não quebram combo. |
| 🌀 | **Vórtice** | 10s | Consome automaticamente 1 palavra urgente a cada 2s concedendo seus pontos integrais. |
| ⏱️ | **Slowdown** | 15s | Reduz a velocidade de descida de todos os tokens pela metade (50%). |
| ⚡ | **Haste** | 15s | Aumenta a velocidade em +0.5 e **dobra todos os pontos recebidos (2×)**. |
| 🔒 | **Trava Velocidade** | 60s | Trava a velocidade da esteira em 1.0× por 1 minuto. |
| 🌌 | **Espaçamento** | 45s | Amplia a distância vertical e intervalo entre novas palavras geradas. |

---

## 5. Loja de Habilidades e Economia

A **Loja Espacial** abre após a **fase 5** e a cada 3 fases subsequentes (5, 8, 11, 14...):
- **Moeda de Compra:** Pontos Totais bancados (`totalScore`).
- **Oferta Rotativa:** 3 itens sorteados aleatoriamente a cada abertura.
- **Inflação Exponencial:** A cada compra, os itens subsequentes sofrem reajuste de preço escalonado.

---

## 6. Biblioteca Cósmica (Bestiário)

A **Biblioteca Cósmica** cataloga todos os **75 termos espaciais e astrofísicos** do jogo (divididos em Fáceis, Normais e Difíceis):
- **Descoberta Gradual:** Palavras são catalogadas conforme o jogador avança de fase ou abre Pacotes Misteriosos na loja.
- **Significado Científico:** Cada vocábulo desbloqueado exibe sua definição astronômica e contador de digitações concluídas.
- **Pausa Automática:** Abrir a biblioteca durante a partida pausa o jogo com restauração suave ao retornar.

---

## 7. Design, UI e Experiência do Jogador

- **Vidro Fosco Translúcido (Glassmorphism):** Superfícies translúcidas em `backdrop-filter: blur(24px) saturate(200%)`, 100% sem bordas (`border: none !important`) e sem sombras opacas pesadas.
- **Cenário Dinâmico:** Fundo cósmico com estrelas cintilantes e buraco negro estelar 2D de alta performance visual.
- **Zero Salto no Hover:** Proibição de deslocamento vertical (`transform: none !important`), com feedback exclusivamente por luminosidade e tom de cor.
- **Ícones Vetoriais em SVG Inline:** 100% de ícones em SVG limpo (sem emojis de sistema operacional em interfaces).
- **Internacionalização Obrigatória (i18n):** Suporte nativo completo a 7 idiomas (`en`, `pt`, `fr`, `de`, `ja`, `ko`, `zh`).

---

## 8. Controles e Atalhos de Teclado

| Tecla / Ação | Função |
|:---:|:---|
| <kbd>A</kbd> – <kbd>Z</kbd> | Digitação direta das palavras cósmicas em queda |
| <kbd>Espaço</kbd> ou <kbd>-</kbd> | Alternância fluida para termos compostos espaciais (`buraco-negro`, `velocidade-da-luz`) |
| <kbd>Backspace</kbd> | Limpa o buffer de digitação atual e cancela a mira |
| <kbd>ESC</kbd> | Pausa ou retoma o jogo imediatamente |
| <kbd>Enter</kbd> | Confirma ações em modais, avança de fase e reinicia partidas |
| <kbd>1</kbd> – <kbd>8</kbd> | Ativa a habilidade estelar do respectivo Slot 1 a 8 |
| **Clique do Mouse** | Clica diretamente no card da habilidade na lista lateral para ativá-la |

---

## 9. Como Executar

O projeto é completamente estático e autônomo, não necessitando de `npm`, compilações ou bundlers.

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
Ou utilizando o servidor embutido do Python na pasta do projeto:
```bash
python3 -m http.server 8000
# Acesse no navegador: http://localhost:8000
```

---

## 10. Histórico de Versões (Changelog)

### 🚀 v1.3 — Modo Roguelike Arcade Infinito, Arsenal Permanente, Nova Habilidade "Eco Cósmico" & Farm de Moedas
- **Transformação em Corrida Infinita Arcade Roguelike**: Eliminação de transições de fases fixas. A partida agora é uma jornada ininterrupta onde termos cósmicos caem sem parar, com aumento contínuo de velocidade a cada 5s até o limite estipulado (+2.0x). A partida termina exclusivamente por esgotamento de vidas do jogador ou pausa.
- **Arsenal e Habilidades Permanentes**: Habilidades adquiridas na Loja Cósmica passam a ser salvas de forma perpétua no inventário (`digithin_galaxy_permanent_skills`) e são preservadas entre partidas. Habilidades dropadas durante o jogo são consumidas primeiro e descartadas ao fim da corrida.
- **Loja Cósmica no Menu Principal & Mecânica de Reroll**: A Loja Cósmica agora pode ser aberta a partir do menu inicial. O jogador pode rolar novas ofertas por 25 moedas (`CFG.shopRerollPrice`), reembaralhando 3 cartas aleatórias.
- **Entrada Direta sem Slots de Salvamento**: Acesso direto à partida clicando em "Jogar", sem telas intermediárias de slots. Moedas, recordes e vocabulário desbloqueado são mantidos centralmente.
- **Nova Habilidade Cósmica: "Eco Cósmico" (`autodestroy`)**: Habilidade lendária (preço: 300 moedas, duração: 60s) que busca automaticamente palavras já aprendidas pelo jogador e as desintegra a cada 5 segundos em partículas celestes, gerando pontos e acelerando o farm de moedas.
- **Farm Contínuo de Moedas durante o Jogo**: Como não há mais bônus de fase, o jogador recebe +1 moeda a cada 10 palavras completadas (`CFG.wordsPerCoinFarm`), com medidor visual dinâmico integrado ao HUD.
- **Progressão Didática Inicial na Partida Arcade**: Aquecimento inteligente com 8 a 12 letras isoladas no início da corrida, seguido de intercalação com sílabas cósmicas até 20 vocábulos e liberação gradual de palavras completas (55%), sílabas (25%) e letras (20%) após o 20º vocábulo.
- **HUD Minimalista e Limpo no Modo Arcade**: Remoção de textos redundantes no topo da tela ("FASE ARCADE INFINITO" e "Próxima Moeda"), preservando a barra sutil de progresso para a moeda farmada a cada 10 palavras completadas.
- **Diálogo de Saída Conciso & Direto**: Modal de retorno ao menu inicial simplificado com aviso direto de que as moedas ganhas serão mantidas, mas habilidades dropadas durante a partida serão perdidas.
- **Correção do Banner de Recorde no Menu Principal**: Eliminação de duplicações e placeholders `{score}`, formatando perfeitamente o recorde atual do jogador.
- **Redesign Símétrico e Moderno da Loja Cósmica**: Grid com botões "Comprar" alinhados com largura e altura uniformes, botões de rodapé ("Sortear Ofertas" e "Fechar") com altura idêntica de 48px, 100% sem bordas (`border: none !important`), badges monetários com ícones vetoriais SVG e sem opacidade reduzida em textos.
- **Cache-Busting Cirúrgico por Arquivo (`?v=1.3`)**: Atualização cirúrgica em `index.html` e `privacy.html` exclusivamente nos arquivos modificados nesta versão (`css/variables.css`, `css/layout.css`, `css/modals.css`, `js/data.js`, `js/state.js`, `js/ui.js`, `js/shop.js`, `js/spawner.js`, `js/skills.js`, `js/boss.js`, `js/phase.js`, `game.js`).

### 🚀 v1.2 — Iluminação Constante do Disco de Acreção, Espaguetificação Gravitacional & Destruição Cósmica em Confete
- **Disco de Acreção com Brilho Constante & Pulsação Contínua**: O disco de acreção horizontal e a atmosfera do buraco negro agora contam com iluminação vibrante permanente (`#38BDF8`, `#FFFFFF`, `#F472B6`, `#FBBF24`), acompanhados de pulso rítmico harmônico contínuo em CSS3 sem depender exclusivamente do gatilho de palavras tragadas.
- **Espaguetificação Gravitacional Progressiva no Buraco Negro (Início a 80% da Tela)**: A partir de ~78-80% da altura da coluna, o vocábulo é capturado pelo campo de atração gravitacional e começa a se esticar suave e progressivamente (`scaleX: 1.0 → 0.38` e `scaleY: 1.0 → 2.35`), desacelerando continuamente até quase parar (~0.08x) por dilatação temporal gravitacional, chegando ao horizonte de eventos já intensamente distorcido antes de sofrer a tragada na singularidade (`swallowIntoBlackHole`).
- **Destruição Cósmica Fluida via Motor 2D em Canvas (Queda Contínua até o Final da Tela)**: Motor dedicado em Canvas 2D (`#debris-canvas`) a 60 FPS com física newtoniana contínua (sem paradas no ar). Os destroços e confetes cósmicos explodem em arco e caem ininterruptamente percorrendo toda a coluna até o fundo da tela rodopiando em 3D, soltando cauda de micro-faíscas/poeira estelar cintilante e se desfazendo suavemente durante a descida.
- **Cache-Busting Cirúrgico por Arquivo (`?v=1.2`)**: Atualização cirúrgica em `index.html` apenas nos arquivos modificados nesta versão (`css/layout.css`, `css/gameplay.css`, `js/ui.js`, `js/skills.js`, `js/boss.js`, `game.js`).

### 🚀 v1.1 — Isolamento de Armazenamento Local, Refatoração Cósmica & Detecção de Atualizações
- **Isolamento Completo de Armazenamento (`digithin_galaxy_*`)**: Migração de 100% das chaves de persistência do `localStorage` para o namespace exclusivo `digithin_galaxy_*`, assegurando independência absoluta de moedas compartilhadas, slots de salvamento, recordes e preferências em relação a outros projetos locais rodando no mesmo domínio (`http://localhost/`).
- **Sincronização Visual e Documental**: Atualização integral de `AGENTS.md`, `TRANSLATING.md` e `README.md` com os 6 Comandantes Invasores Alienígenas e catálogo astronômico. Padronização de cabeçalhos de todos os arquivos CSS e JS para Digithin Galaxy.
- **Sistema Dinâmico de Notificação de Atualização**: Validação e ativação do fluxo de detecção de novas versões em tempo real (`#btn-update-available`), permitindo atualização instantânea de cache com feedback visual ao jogador sempre que ele entra no jogo.
- **Unificação da Versão em Tempo de Execução (`version.json` como Fonte Única)**: Eliminação de todas as strings estáticas hardcoded de versão dos scripts JavaScript (`js/i18n.js` e `js/ui.js`), sincronizando dinamicamente a versão instalada no cliente com o `version.json` do servidor.

### 🚀 v1.0 — Lançamento Oficial do Digithin Galaxy (Tema Espacial, Buraco Negro & Invasores Alienígenas)
- **Tema Cósmico & Espaço Sideral**: Fundo preto sideral com 200 estrelas cintilantes estelares (multi-espectrais) e passagem esporádica de estrelas cadentes via 2D Canvas de alto desempenho e baixíssimo consumo de hardware.
- **Buraco Negro Central & Horizonte de Eventos**: Renderização sutil, estilizada e não-realista de um buraco negro ao fundo da coluna de jogo, acompanhado de disco de acreção, anel de fótons e lente gravitacional relativística.
- **Tragada Estelar & Espaguetificação**: Quando palavras atingem a base da coluna cósmica sem serem digitadas, são tragadas pelo horizonte de eventos com efeito visual de estiramento gravitacional (*spaghettification*), pulso no buraco negro e colapso sonoro via Web Audio API.
- **Dicionário Estritamente Espacial (75 Termos)**: Vocabulário calibrado por dificuldade focado em astrofísica, exploração espacial e corpos celestes (`planeta`, `estrela`, `sol`, `poeira-estelar`, `velocidade-da-luz`, `materia-escura`, `galaxias`, `luas`, `exoplanetas`, `buraco-negro`, `buraco-de-minhoca`, `vacuo`, `estacao-espacial`, `astronauta`, `astronomia`...).
- **Suporte Fluido a Espaço e Hífen**: Termos compostos espaciais permitem alternância transparente entre a tecla Espaço e o Hífen, permitindo digitação natural sem travar o buffer.
- **6 Chefões Comandantes Alienígenas**: Batalhas épicas a cada 8 fases contra comandantes invasores que ameaçam invadir o Sistema Solar:
  * `Xylarion`: Comandante da Vanguarda Alienígena (Cyan `#06B6D4`).
  * `Zorkon`: Mestre do Enxame Biomecânico (Emerald `#10B981`).
  * `Vespera`: Soberana Psiônica Extraterrestre (Violet `#A855F7`).
  * `Kragthor`: General Belicista Alienígena (Crimson `#EF4444`).
  * `Nebulor`: Entidade Cósmica Invasora (Indigo `#6366F1`).
  * `Xenor`: Consciência Central da Invasão (Amber `#F59E0B`).
- **Sprites Vetoriais Modernos em SVG Inline**: 6 designs vetoriais exclusivos para os chefões alienígenas, com traçado limpo, glow translúcido e zero emojis do sistema operacional (Regra 11 de `AGENTS.md`).
- **Isolamento de Armazenamento Local (`digithin_galaxy_`)**: Migração completa das chaves de persistência do `localStorage` para `digithin_galaxy_*`, assegurando independência absoluta de moedas, slots salvos e preferências em relação a outros projetos locais.
- **Design Glassmorphism Translúcido Calibrado**: Superfícies de vidro fosco translúcido (*glassmorphism*), 100% sem bordas (`border: none !important`), sem saltos no hover (`transform: none !important`).
- **Internacionalização Completa (7 Idiomas)**: Suporte nativo em `pt`, `en`, `fr`, `de`, `ja`, `ko`, `zh` para todas as 75 palavras espaciais, significados cósmicos e diálogos dos chefões alienígenas.
- **Versionamento Base 1.0**: Padronização de todas as folhas de estilo (`./css/*.css?v=1.0`), scripts (`./js/*.js?v=1.0`), `game.js?v=1.0` e pacotes i18n (`./locales/*.json?v=1.0`).
