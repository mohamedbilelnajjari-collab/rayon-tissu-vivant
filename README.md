# Rayon Tissu Vivant

Crée une application web en français, interface claire et moderne, qui simule l'atténuation des rayons X : I = I0 · e^(-μx). Contrôles : curseur d'épaisseur x (0 à 20 cm), sélecteur d'énergie (40, 100, 400 keV), choix du tissu (tissu mou ou os). Utilise ces valeurs de μ/ρ en m²/kg : tissu mou = 0.0245 (40 keV), 0.0167 (100 keV), 0.0106 (400 keV) ; os = 0.0541 (40 keV), 0.0175 (100 keV), 0.0102 (400 keV). Densités approximatives : tissu mou 1000 kg/m³, os 1850 kg/m³. Affichage : la valeur de I/I0 en pourcentage, une courbe d'atténuation en fonction de x, et une animation de photons qui traversent le milieu (certains sont arrêtés). Ajoute une petite explication sous le graphique : « Plus x ou μ augmente, plus l'image est claire sur le détecteur

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/58bb4728-2ad6-4fb3-b51b-69462b8ed1c6).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
