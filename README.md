# trama — jornadas de design

Sistema de identidade visual generativo para as Jornadas de Design do IADE.

## Conceito

Fios horizontais e verticais que se cruzam, ondulam e reagem — cada composição é única mas reconhecível como parte do mesmo sistema. A marca não é um logotipo estático: é um organismo vivo.

## Stack

- React + Vite
- Canvas 2D para geração em tempo real
- GitHub Pages deploy

## Desenvolvimento

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Estrutura

```
src/
  components/
    WeaveCanvas.jsx      — motor generativo
    SpeakerCard.jsx      — cartões de oradores
    TramaQR.jsx          — QR codes generativos
    Countdown.jsx        — countdown de sessões
    InstagramCarousel.jsx — narrativas para carrossel
    Posters.jsx          — posters e separadores
    InteractiveExperience.jsx — experiência narrativa
  data/
    tokens.js            — design tokens
  App.jsx               — layout principal
  main.jsx              — entry point
```

---

rodrigobrazao.pt · iade · 2025
