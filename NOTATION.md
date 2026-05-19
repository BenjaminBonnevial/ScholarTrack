# Examen — Développement API

- [**ScholarTrack**](./SUJET_3.md) — Système de gestion académique : cours, notes pondérées, présences et reporting semestriel.

---

## Comment c'est noté

> **100 points → ramenés sur 20**

### Fonctionnalités (75 pts)

Le détail des points est dans chaque sujet. Ce qui compte, c'est ce qui **fonctionne réellement** : un endpoint mal sécurisé ou une logique métier bancale, c'est des points perdus même si le code compile.

### Critères transverses (25 pts)

Ces critères sont **identiques pour les trois sujets** et évalués indépendamment des fonctionnalités.

| Critère                 | Pts | Ce qui est attendu                                                                                                     |
| ----------------------- | --- | ---------------------------------------------------------------------------------------------------------------------- |
| **Git Flow**            | 8   | Branches `feature/`, `fix/`, merge requests avec description, commits conventionnels (`feat:`, `fix:`, `chore:`, etc.) |
| **Documentation**       | 7   | README avec setup complet, Swagger configuré et à jour, `.env.example` fourni sans secrets hardcodés                   |
| **Qualité du code**     | 5   | Structure modulaire NestJS respectée, logique métier dans les services (pas dans les controllers), nommage cohérent    |
| **Gestion des erreurs** | 5   | `HttpException` appropriées sur tous les cas d'erreur, messages clairs, aucun 500 exposé au client                     |

> Ces 25 points sont une opportunité facile à saisir — ils ne dépendent pas de la complexité des fonctionnalités implémentées, mais de la rigueur avec laquelle vous travaillez.

### Bonus / Malus

|                                                                           | Pts |
| ------------------------------------------------------------------------- | --- |
| Rendu soigné, features bonus solides, proactivité                         | +5  |
| Rendu bâclé, code illisible, fonctionnalités incomplètes sans explication | -5  |

---

## Livrables

- Lien vers le dépôt Git (avant la deadline)
- `README.md` avec les instructions de setup à la racine du projet
- `.env.example` à la racine
- Collection Postman/Insomnia/Bruno ou lien Swagger
