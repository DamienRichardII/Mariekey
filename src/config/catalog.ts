import type { Category, Service } from "@/lib/db-types";

/**
 * Catalogue importé de la page de réservation Acuity (source : scripts/acuity-services.json, relevé le 17/10/2026).
 * Utilisé quand la base ne contient aucune prestation active ; une prestation saisie en base prend le dessus.
 * Les durées affichées à 1 ou 2 minutes dans Acuity (visiblement non renseignées) et celle de la formation sont masquées.
 */
export const STATIC_CATEGORIES: Category[] = [
  {
    "id": "static-pose-customisation",
    "slug": "pose-customisation",
    "name": "Pose & customisation",
    "image_path": "/images/categories/pose-perruque.jpg",
    "sort_order": 1
  },
  {
    "id": "static-confection",
    "slug": "confection",
    "name": "Confection de perruque",
    "image_path": "/images/gallery/coiffure-bordeaux.jpg",
    "sort_order": 2
  },
  {
    "id": "static-coloration",
    "slug": "coloration",
    "name": "Coloration",
    "image_path": "/images/categories/coloration.jpg",
    "sort_order": 3
  },
  {
    "id": "static-soins-tissages",
    "slug": "soins-tissages",
    "name": "Soins & tissages",
    "image_path": "/images/categories/soin-capillaire.jpg",
    "sort_order": 4
  },
  {
    "id": "static-makeup-total-look",
    "slug": "makeup-total-look",
    "name": "Makeup & total look",
    "image_path": "/images/gallery/queue-cote-peignoir.jpg",
    "sort_order": 5
  },
  {
    "id": "static-formation",
    "slug": "formation",
    "name": "Formation",
    "image_path": "/images/about/outils.jpg",
    "sort_order": 6
  }
];

export const STATIC_SERVICES: Service[] = [
  {
    "id": "static-one-one-class-install-x-styling",
    "category_id": "static-formation",
    "slug": "one-one-class-install-x-styling",
    "name": "ONE ONE CLASS ( install x Styling )",
    "short_description": "Une journée intensive pour perfectionner vos techniques d’installation de perruque.",
    "description": "💇 Une journée intensive pour perfectionner vos techniques d’installation de perruque.\n\n✔ Analyse de la lace frontal & préparation des cheveux ( blanchiment des noeud )\n✔ Techniques de pose (colle, gel ou sans colle)\n✔ Personnalisation de la ligne frontale\n✔ Découpe, coiffage & mise en forme\n✔ Atelier pratique sur modèle\n✔ Conseils professionnels & entretien de la perruque\n\n🕘 10h30 – 16h45",
    "duration_minutes": null,
    "booking_url": null,
    "price_cents": 27500,
    "price_is_from": false,
    "preparation_notes": null,
    "image_path": null,
    "sort_order": 1,
    "service_options": [],
    "service_categories": {
      "slug": "formation",
      "name": "Formation"
    }
  },
  {
    "id": "static-coloration-jet-black",
    "category_id": "static-coloration",
    "slug": "coloration-jet-black",
    "name": "Coloration JET BLACK",
    "short_description": "La perruque est à déposer 6 jours en avance ; neuve ou propre.",
    "description": "La perruque est à déposer 6jours en avance ; neuve ou propre .",
    "duration_minutes": null,
    "booking_url": null,
    "price_cents": 6600,
    "price_is_from": false,
    "preparation_notes": null,
    "image_path": null,
    "sort_order": 2,
    "service_options": [],
    "service_categories": {
      "slug": "coloration",
      "name": "Coloration"
    }
  },
  {
    "id": "static-confection-de-perruque-machine-a-coudre",
    "category_id": "static-confection",
    "slug": "confection-de-perruque-machine-a-coudre",
    "name": "Confection de perruque ( Machine à coudre )",
    "short_description": "Bonnet et élastique inclus au prix.",
    "description": "Bonnet et élastique inclus au prix.\nDépôt 6 JOURS en avance\nJUSQU’À 3 paquets possible , pour l’ajout de paquet en plus prévoir 10 EUROS. PAR PAQUETS EN Supplément.",
    "duration_minutes": null,
    "booking_url": null,
    "price_cents": 5600,
    "price_is_from": false,
    "preparation_notes": null,
    "image_path": null,
    "sort_order": 3,
    "service_options": [],
    "service_categories": {
      "slug": "confection",
      "name": "Confection de perruque"
    }
  },
  {
    "id": "static-confection-closure-wig-styling-frange",
    "category_id": "static-confection",
    "slug": "confection-closure-wig-styling-frange",
    "name": "Confection closure wig Styling ( Frange )",
    "short_description": "Blanchiment des nœuds sans épilation, closure 2x6 ou 4x4 uniquement.",
    "description": "Blanchiment des noeud sans épilation , closure 2x6 ou 4x4 uniquement.",
    "duration_minutes": 45,
    "booking_url": null,
    "price_cents": 9600,
    "price_is_from": false,
    "preparation_notes": null,
    "image_path": null,
    "sort_order": 4,
    "service_options": [],
    "service_categories": {
      "slug": "confection",
      "name": "Confection de perruque"
    }
  },
  {
    "id": "static-confection-de-perruque-sur-place",
    "category_id": "static-confection",
    "slug": "confection-de-perruque-sur-place",
    "name": "Confection de perruque sur place",
    "short_description": "Vous venez avec vos mèches, nous réalisons votre wig sur place.",
    "description": "Vous venez avec vos mèches , nous réalisons votre wig sur place ( +10€ à partir du 4 ème paquets)",
    "duration_minutes": 45,
    "booking_url": null,
    "price_cents": 6600,
    "price_is_from": false,
    "preparation_notes": null,
    "image_path": null,
    "sort_order": 5,
    "service_options": [],
    "service_categories": {
      "slug": "confection",
      "name": "Confection de perruque"
    }
  },
  {
    "id": "static-customisation-et-pose-simple-closure-ou-lace-simple",
    "category_id": "static-pose-customisation",
    "slug": "customisation-et-pose-simple-closure-ou-lace-simple",
    "name": "Customisation et pose simple closure ou lace simple",
    "short_description": "Dépôt en avance - 4 jours - styling inclus.",
    "description": "Dépôt en avance - 4JOURS- styling inclus.",
    "duration_minutes": 90,
    "booking_url": null,
    "price_cents": 9600,
    "price_is_from": false,
    "preparation_notes": null,
    "image_path": null,
    "sort_order": 6,
    "service_options": [],
    "service_categories": {
      "slug": "pose-customisation",
      "name": "Pose & customisation"
    }
  },
  {
    "id": "static-customisation-pose-sans-colle-closure",
    "category_id": "static-pose-customisation",
    "slug": "customisation-pose-sans-colle-closure",
    "name": "Customisation & pose sans colle ( Closure )",
    "short_description": "Installation, découpe tulle, placement élastique/bande, décoloration des nœuds incluse, lissage uniquement.",
    "description": "Installation , découpe tulle , placement élastiqueBande , décoloration des noeud inclus , lissage uniquement.",
    "duration_minutes": 45,
    "booking_url": null,
    "price_cents": 6600,
    "price_is_from": false,
    "preparation_notes": null,
    "image_path": null,
    "sort_order": 7,
    "service_options": [],
    "service_categories": {
      "slug": "pose-customisation",
      "name": "Pose & customisation"
    }
  },
  {
    "id": "static-customisation-et-pose-sans-colle-sur-place",
    "category_id": "static-pose-customisation",
    "slug": "customisation-et-pose-sans-colle-sur-place",
    "name": "Customisation et pose sans colle SUR PLACE",
    "short_description": "Découpe de la tulle, raie côté ou milieu, brushing lissage (sans nattes collées).",
    "description": "decoupe de la tulle , raie coté ou milieu , brushing lissage. ( SANS NATTES COLLÉES )",
    "duration_minutes": 50,
    "booking_url": null,
    "price_cents": 8600,
    "price_is_from": false,
    "preparation_notes": null,
    "image_path": null,
    "sort_order": 8,
    "service_options": [],
    "service_categories": {
      "slug": "pose-customisation",
      "name": "Pose & customisation"
    }
  },
  {
    "id": "static-customisation",
    "category_id": "static-pose-customisation",
    "slug": "customisation",
    "name": "CUSTOMISATION",
    "short_description": "Dépôt wig 1/2 jours.",
    "description": "DÉPÔT WIG 1/2 jours",
    "duration_minutes": null,
    "booking_url": null,
    "price_cents": 5600,
    "price_is_from": false,
    "preparation_notes": null,
    "image_path": null,
    "sort_order": 9,
    "service_options": [],
    "service_categories": {
      "slug": "pose-customisation",
      "name": "Pose & customisation"
    }
  },
  {
    "id": "static-customisation-et-pose-lace-ou-closure-styling-inclus-soin-ex",
    "category_id": "static-pose-customisation",
    "slug": "customisation-et-pose-lace-ou-closure-styling-inclus-soin-ex",
    "name": "Customisation et pose Lace ou closure Styling inclus ( SOIN EXPRESS )",
    "short_description": "Shampoing, soin express, nattes et installation complète de votre perruque, styling inclus.",
    "description": "Ce service comprend un shampoing accompagné d’un soin express, la réalisation des nattes, ainsi que l’installation complète de votre perruque ,styling inclus (sauf carré) ,sans dépôt préalable de la wig.",
    "duration_minutes": 120,
    "booking_url": null,
    "price_cents": 13600,
    "price_is_from": false,
    "preparation_notes": null,
    "image_path": null,
    "sort_order": 10,
    "service_options": [],
    "service_categories": {
      "slug": "pose-customisation",
      "name": "Pose & customisation"
    }
  },
  {
    "id": "static-ponytail-lace-frontal-lace-hd-uniquement",
    "category_id": "static-pose-customisation",
    "slug": "ponytail-lace-frontal-lace-hd-uniquement",
    "name": "Ponytail lace frontal ( Lace HD uniquement )",
    "short_description": "Customisation comprise (décoloration des nœuds sur place).",
    "description": "Customisation comprise ( décoloration des noeud sur place )\n* cheveux propre sans gras obligatoire",
    "duration_minutes": 160,
    "booking_url": null,
    "price_cents": 13600,
    "price_is_from": false,
    "preparation_notes": null,
    "image_path": null,
    "sort_order": 11,
    "service_options": [],
    "service_categories": {
      "slug": "pose-customisation",
      "name": "Pose & customisation"
    }
  },
  {
    "id": "static-brushing-refresh-hair-styling",
    "category_id": "static-pose-customisation",
    "slug": "brushing-refresh-hair-styling",
    "name": "BRUSHING REFRESH HAIR STYLING",
    "short_description": "Lissage ou boucle, idéal pour les tissages ouverts ou une simple remise en forme.",
    "description": "LISSAGE OU BOUCLE , idéal pour les tissage ouvert , ou une simple remise en forme.",
    "duration_minutes": 45,
    "booking_url": null,
    "price_cents": 4600,
    "price_is_from": false,
    "preparation_notes": null,
    "image_path": null,
    "sort_order": 12,
    "service_options": [],
    "service_categories": {
      "slug": "pose-customisation",
      "name": "Pose & customisation"
    }
  },
  {
    "id": "static-repose-closure",
    "category_id": "static-pose-customisation",
    "slug": "repose-closure",
    "name": "Repose closure",
    "short_description": "Lissage ou boucle légère inclus, sans dépôt à l’avance.",
    "description": "Lissage ou boucle légère inclus\nSans dépôt à l’avance.\nLa wig doit être propre et en bon état.\nDes frais supplémentaires seront facturés si ces conditions ne sont pas respectées.",
    "duration_minutes": 80,
    "booking_url": null,
    "price_cents": 7600,
    "price_is_from": false,
    "preparation_notes": null,
    "image_path": null,
    "sort_order": 13,
    "service_options": [],
    "service_categories": {
      "slug": "pose-customisation",
      "name": "Pose & customisation"
    }
  },
  {
    "id": "static-repose-lace-lissage-ou-boucle-legere",
    "category_id": "static-pose-customisation",
    "slug": "repose-lace-lissage-ou-boucle-legere",
    "name": "Repose Lace ( lissage ou boucle légère )",
    "short_description": "Sans dépôt à l’avance.",
    "description": "Sans dépôt à l’avance.\nLa wig doit être propre et en bon état.\nDes frais supplémentaires seront facturés si ces conditions ne sont pas respectées.",
    "duration_minutes": 90,
    "booking_url": null,
    "price_cents": 8600,
    "price_is_from": false,
    "preparation_notes": null,
    "image_path": null,
    "sort_order": 14,
    "service_options": [],
    "service_categories": {
      "slug": "pose-customisation",
      "name": "Pose & customisation"
    }
  },
  {
    "id": "static-shampoing-soins-coupe-des-pointes-lissage-simple-ou-nattes-c",
    "category_id": "static-soins-tissages",
    "slug": "shampoing-soins-coupe-des-pointes-lissage-simple-ou-nattes-c",
    "name": "Shampoing Soins - Coupe des pointes - Lissage simple ou nattes collées",
    "short_description": "Votre moment détente, prenez soin de vos cheveux naturels.",
    "description": "Votre moment détente ,prenez soins de vos cheveux naturels.",
    "duration_minutes": 60,
    "booking_url": null,
    "price_cents": 6600,
    "price_is_from": false,
    "preparation_notes": null,
    "image_path": null,
    "sort_order": 15,
    "service_options": [],
    "service_categories": {
      "slug": "soins-tissages",
      "name": "Soins & tissages"
    }
  },
  {
    "id": "static-defrisage-mizani",
    "category_id": "static-soins-tissages",
    "slug": "defrisage-mizani",
    "name": "Defrisage Mizani",
    "short_description": "Défrise efficacement les cheveux bouclés, frisés et crépus.",
    "description": "Défrise efficacement les cheveux bouclés, frisés et crépus.\nAide à réduire le volume et les frisottis.\nFacilite le coiffage quotidien.\nLaisse les cheveux plus lisses, doux et maniables.\nContient des agents conditionnants qui contribuent à protéger la fibre capillaire pendant le service chimique.",
    "duration_minutes": 90,
    "booking_url": null,
    "price_cents": 5000,
    "price_is_from": false,
    "preparation_notes": null,
    "image_path": null,
    "sort_order": 16,
    "service_options": [],
    "service_categories": {
      "slug": "soins-tissages",
      "name": "Soins & tissages"
    }
  },
  {
    "id": "static-tissage-ouvert-flipover-uniquement",
    "category_id": "static-soins-tissages",
    "slug": "tissage-ouvert-flipover-uniquement",
    "name": "Tissage ouvert ( Flipover uniquement)",
    "short_description": "Réalisation des nattes et installation complète de votre tissage Flipover.",
    "description": "Ce service comprend la réalisation des nattes, ainsi que l’installation complète de votre TISSAGE Flipover\nSans dépôt à l’avance.\nLes mèches doivent être propre et en bon état.\nDes frais supplémentaires seront facturés si ces conditions ne sont pas respectées.",
    "duration_minutes": 120,
    "booking_url": null,
    "price_cents": 7600,
    "price_is_from": false,
    "preparation_notes": null,
    "image_path": null,
    "sort_order": 17,
    "service_options": [],
    "service_categories": {
      "slug": "soins-tissages",
      "name": "Soins & tissages"
    }
  },
  {
    "id": "static-naturelglam-signature",
    "category_id": "static-makeup-total-look",
    "slug": "naturelglam-signature",
    "name": "NaturelGlam Signature",
    "short_description": "Teint frais.",
    "description": "Teint frais.",
    "duration_minutes": 60,
    "booking_url": null,
    "price_cents": 7600,
    "price_is_from": false,
    "preparation_notes": null,
    "image_path": null,
    "sort_order": 18,
    "service_options": [],
    "service_categories": {
      "slug": "makeup-total-look",
      "name": "Makeup & total look"
    }
  },
  {
    "id": "static-softglam-signature",
    "category_id": "static-makeup-total-look",
    "slug": "softglam-signature",
    "name": "SoftGlam Signature",
    "short_description": "Un maquillage élégant, doux, lumineux et naturel : l’effet « glamour sans effort ».",
    "description": "Le soft glam makeup est un maquillage élégant et sophistiqué qui reste doux, lumineux et naturel à l’œil. Il donne un effet “glamour sans effort” : le visage paraît parfaitement mis en valeur, sans maquillage trop chargé.",
    "duration_minutes": 85,
    "booking_url": null,
    "price_cents": 9600,
    "price_is_from": false,
    "preparation_notes": null,
    "image_path": null,
    "sort_order": 19,
    "service_options": [],
    "service_categories": {
      "slug": "makeup-total-look",
      "name": "Makeup & total look"
    }
  },
  {
    "id": "static-total-look-lacewig-uniquement-ou-closurewig-hair-makeup-au-c",
    "category_id": "static-makeup-total-look",
    "slug": "total-look-lacewig-uniquement-ou-closurewig-hair-makeup-au-c",
    "name": "Total look LACEWIG ( UNIQUEMENT OU CLOSUREWIG ( hair & makeup au choix)",
    "short_description": "Hair & makeup au choix ; nattes non incluses, styling simple boucle ou lissage.",
    "description": "NATTES NON INCLUS ET STYLING SIMPLE BOUCLE OU LISSAGE\nLES AUTRES MODÈLES SUR DEVIS RÉALISABLE SUR PLACE.\nDépôt wig en avance 2 À 3 JOURS EN AVANCE.",
    "duration_minutes": 180,
    "booking_url": null,
    "price_cents": 25600,
    "price_is_from": false,
    "preparation_notes": null,
    "image_path": null,
    "sort_order": 20,
    "service_options": [],
    "service_categories": {
      "slug": "makeup-total-look",
      "name": "Makeup & total look"
    }
  }
];
