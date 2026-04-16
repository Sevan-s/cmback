# ⚙️ CousuMouche — API REST Backend

> Backend Express de la plateforme e-commerce [cousumouche.fr](https://www.cousumouche.fr). API REST sécurisée avec gestion des produits, commandes, paiements Stripe et stockage AWS S3.

![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb)
![Stripe](https://img.shields.io/badge/Stripe-Payments-635BFF?style=flat-square&logo=stripe)
![AWS](https://img.shields.io/badge/AWS-S3-FF9900?style=flat-square&logo=amazonaws)
![Render](https://img.shields.io/badge/Deployed-Render-46E3B7?style=flat-square&logo=render)

---

## 📖 Présentation

API REST complète servant de backend à la plateforme e-commerce CousuMouche. Gère l'authentification, le catalogue produits, le traitement des commandes et les paiements via Stripe, avec stockage des images sur AWS S3.

---

## ✨ Fonctionnalités

- 🔐 Authentification JWT (admin)
- 🛍️ CRUD complet sur les produits
- 💳 Intégration **Stripe** (création de session, webhooks)
- 🖼️ Upload d'images vers **AWS S3**
- 🗄️ Base de données **MongoDB Atlas**

---

## 🛠️ Stack technique

| Technologie | Usage |
|-------------|-------|
| **Node.js / Express** | Serveur et routing |
| **MongoDB Atlas** | Base de données |
| **Stripe API** | Paiements et webhooks |
| **AWS S3** | Stockage des images produits |
| **JWT** | Authentification sécurisée |
| **Render** | Hébergement |

---

## 🏗️ Repos liés

| Repo | Description |
|------|-------------|
| [CousuMouche](https://github.com/Sevan-s/CousuMouche) | Frontend client React |
| [cmadmindashboard](https://github.com/Sevan-s/cmadmindashboard) | Back-office admin React |

---

## 🚀 Lancer en local

```bash
git clone https://github.com/Sevan-s/cmback.git
cd cmback
npm install
```

Créer un fichier `.env` à la racine :

```env
MONGO_URI=your_mongodb_atlas_uri
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=eu-west-3
S3_BUCKET_NAME=your_bucket_name
JWT_SECRET=your_jwt_secret
PORT=5000
```

```bash
npm run dev
```

---

## 💡 Ce que j'ai appris

- Conception et sécurisation d'une **API REST** (JWT, middleware d'auth)
- Intégration des **webhooks Stripe** pour la gestion des statuts de paiement
- Upload et gestion de fichiers avec **AWS S3** (présigned URLs)
- Déploiement backend sur **Render** avec variables d'environnement sécurisées
- Modélisation de données avec **Mongoose**

---

## 👨‍💻 Auteur

**Sevan Sarikaya** — Développeur Full-Stack
[GitHub](https://github.com/Sevan-s) · [LinkedIn](https://www.linkedin.com/in/sevan-sarikaya/) · [cousumouche.fr](https://www.cousumouche.fr)

---

*Projet en production depuis 2025*

# ⚙️ CousuMouche — REST API Backend

> Express backend for the e-commerce platform [cousumouche.fr](https://www.cousumouche.fr). Secure REST API with product management, orders, Stripe payments, and AWS S3 storage.

![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb)
![Stripe](https://img.shields.io/badge/Stripe-Payments-635BFF?style=flat-square&logo=stripe)
![AWS](https://img.shields.io/badge/AWS-S3-FF9900?style=flat-square&logo=amazonaws)
![Render](https://img.shields.io/badge/Deployed-Render-46E3B7?style=flat-square&logo=render)

---

## 📖 Overview

Complete REST API serving as the backend for the CousuMouche e-commerce platform. It handles authentication, product catalog management, order processing, Stripe payments, and image storage with AWS S3.

---

## ✨ Features

- 🔐 JWT authentication for admin access
- 🛍️ Full product CRUD
- 💳 **Stripe** integration for checkout sessions and webhooks
- 🖼️ Image upload to **AWS S3**
- 🗄️ **MongoDB Atlas** database

---

## 🛠️ Tech Stack

| Technology | Usage |
|------------|-------|
| **Node.js / Express** | Server and routing |
| **MongoDB Atlas** | Database |
| **Stripe API** | Payments and webhooks |
| **AWS S3** | Product image storage |
| **JWT** | Secure authentication |
| **Render** | Hosting |

---

## 🏗️ Related Repositories

| Repo | Description |
|------|-------------|
| [CousuMouche](https://github.com/Sevan-s/CousuMouche) | React client frontend |
| [cmadmindashboard](https://github.com/Sevan-s/cmadmindashboard) | React admin dashboard |

---

## 🚀 Run Locally

```bash
git clone https://github.com/Sevan-s/cmback.git
cd cmback
npm install
```

Create a `.env` file in the root directory:

```env
MONGO_URI=your_mongodb_atlas_uri
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=eu-west-3
S3_BUCKET_NAME=your_bucket_name
JWT_SECRET=your_jwt_secret
PORT=5000
```

```bash
npm run dev
```

---

## 💡 What I Learned

- Designing and securing a **REST API** with JWT and auth middleware
- Integrating **Stripe webhooks** to handle payment statuses
- Uploading and managing files with **AWS S3** using presigned URLs
- Deploying a backend on **Render** with secure environment variables
- Modeling data with **Mongoose**

---

## 👨‍💻 Author

**Sevan Sarikaya** — Full-Stack Developer  
[GitHub](https://github.com/Sevan-s) · [LinkedIn](https://www.linkedin.com/in/sevan-sarikaya/) · [cousumouche.fr](https://www.cousumouche.fr)

---

*Project live in production since 2025*