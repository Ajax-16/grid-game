# Grid Game

Un juego de laberinto con combate por turnos, implementado en JavaScript con soporte para consola y navegador (Phaser).

## Características

- Sistema de combate por turnos
- Sistema de oleadas con bosses
- Sistema de habilidades especiales
- Tienda para comprar mejoras y habilidades
- Sistema de puntos con combos y rachas
- Pathfinding para enemigos
- Refactorizado para separar lógica del renderizado

## Instalación

```bash
npm install
```

## Ejecución

### Versión Consola (Node.js)

```bash
node src/index.js
```

## Controles

- **WASD / Flechas**: Mover
- **Espacio**: Atacar
- **S**: Abrir tienda
- **Q/E/W**: Habilidades especiales (si están desbloqueadas)
  - **Q**: Dash (teletransporte rápido)
  - **W**: Ataque de área
  - **E**: Curación

## Estructura del Proyecto

```
src/
├── core/              # Interfaces abstractas (Grid, Renderer)
├── models/            # Implementaciones de Grid e Input
├── render/            # Implementaciones de Renderer
├── entities/          # Entidades del juego
├── behaviors/         # Comportamientos de entidades
├── systems/           # Sistemas del juego (puntos, oleadas, habilidades, etc.)
├── utils/             # Utilidades (pathfinding, combate, etc.)
├── data/              # Datos estáticos (tipos, direcciones, etc.)
├── factories/          # Factories para crear entidades
├── registry/           # Registro de enemigos
├── index.js           # Entry point para consola
```

## Arquitectura

El juego está diseñado con una arquitectura que separa la lógica del renderizado:

- **Core**: Interfaces abstractas (`Grid`, `Renderer`)
- **Models**: Implementaciones concretas (`ConsoleGrid`, `ConsoleInput`)
- **Render**: Renderers (`ConsoleRenderer`)

Esto permite cambiar fácilmente el renderizado sin modificar la lógica del juego.

## Desarrollo

Para añadir un nuevo renderizado:

1. Crea una clase que extienda `Grid` (en `src/models/`)
2. Crea una clase que extienda `Renderer` (en `src/render/`)
3. Crea un sistema de input si es necesario (en `src/models/`)
4. Crea un nuevo entry point que use estas clases

## Licencia

ISC
