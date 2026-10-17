-- Catalogue Acuity (relevé le 17/10/2026, voir scripts/acuity-services.json). Idempotent.
insert into public.service_categories (slug, name, image_path, sort_order) values
  ('pose-customisation', 'Pose & customisation', null, 1),
  ('confection', 'Confection de perruque', null, 2),
  ('coloration', 'Coloration', null, 3),
  ('soins-tissages', 'Soins & tissages', '/images/categories/soin-capillaire.jpg', 4),
  ('makeup-total-look', 'Makeup & total look', null, 5),
  ('formation', 'Formation', '/images/about/outils.jpg', 6)
on conflict (slug) do update set name = excluded.name, image_path = excluded.image_path, sort_order = excluded.sort_order, is_active = true;

-- Les catégories de l'ancienne maquette (lissage, tresses…) sont masquées.
update public.service_categories set is_active = false where slug in ('lissage','pose-perruque','tresses','soin-capillaire');

insert into public.services (slug, category_id, name, short_description, description, duration_minutes, price_cents, sort_order)
select v.slug, c.id, v.name, v.short, v.descr, v.dur, v.price, v.ord from (values
  ('one-one-class-install-x-styling', 'formation', 'ONE ONE CLASS ( install x Styling )', 'Une journée intensive pour perfectionner vos techniques d’installation de perruque.', '💇 Une journée intensive pour perfectionner vos techniques d’installation de perruque.

✔ Analyse de la lace frontal & préparation des cheveux ( blanchiment des noeud )
✔ Techniques de pose (colle, gel ou sans colle)
✔ Personnalisation de la ligne frontale
✔ Découpe, coiffage & mise en forme
✔ Atelier pratique sur modèle
✔ Conseils professionnels & entretien de la perruque

🕘 10h30 – 16h45', null::integer, 27500, 1),
  ('coloration-jet-black', 'coloration', 'Coloration JET BLACK', 'La perruque est à déposer 6 jours en avance ; neuve ou propre.', 'La perruque est à déposer 6jours en avance ; neuve ou propre .', null::integer, 6600, 2),
  ('confection-de-perruque-machine-a-coudre', 'confection', 'Confection de perruque ( Machine à coudre )', 'Bonnet et élastique inclus au prix.', 'Bonnet et élastique inclus au prix.
Dépôt 6 JOURS en avance
JUSQU’À 3 paquets possible , pour l’ajout de paquet en plus prévoir 10 EUROS. PAR PAQUETS EN Supplément.', null::integer, 5600, 3),
  ('confection-closure-wig-styling-frange', 'confection', 'Confection closure wig Styling ( Frange )', 'Blanchiment des nœuds sans épilation, closure 2x6 ou 4x4 uniquement.', 'Blanchiment des noeud sans épilation , closure 2x6 ou 4x4 uniquement.', 45::integer, 9600, 4),
  ('confection-de-perruque-sur-place', 'confection', 'Confection de perruque sur place', 'Vous venez avec vos mèches, nous réalisons votre wig sur place.', 'Vous venez avec vos mèches , nous réalisons votre wig sur place ( +10€ à partir du 4 ème paquets)', 45::integer, 6600, 5),
  ('customisation-et-pose-simple-closure-ou-lace-simple', 'pose-customisation', 'Customisation et pose simple closure ou lace simple', 'Dépôt en avance - 4 jours - styling inclus.', 'Dépôt en avance - 4JOURS- styling inclus.', 90::integer, 9600, 6),
  ('customisation-pose-sans-colle-closure', 'pose-customisation', 'Customisation & pose sans colle ( Closure )', 'Installation, découpe tulle, placement élastique/bande, décoloration des nœuds incluse, lissage uniquement.', 'Installation , découpe tulle , placement élastiqueBande , décoloration des noeud inclus , lissage uniquement.', 45::integer, 6600, 7),
  ('customisation-et-pose-sans-colle-sur-place', 'pose-customisation', 'Customisation et pose sans colle SUR PLACE', 'Découpe de la tulle, raie côté ou milieu, brushing lissage (sans nattes collées).', 'decoupe de la tulle , raie coté ou milieu , brushing lissage. ( SANS NATTES COLLÉES )', 50::integer, 8600, 8),
  ('customisation', 'pose-customisation', 'CUSTOMISATION', 'Dépôt wig 1/2 jours.', 'DÉPÔT WIG 1/2 jours', null::integer, 5600, 9),
  ('customisation-et-pose-lace-ou-closure-styling-inclus-soin-ex', 'pose-customisation', 'Customisation et pose Lace ou closure Styling inclus ( SOIN EXPRESS )', 'Shampoing, soin express, nattes et installation complète de votre perruque, styling inclus.', 'Ce service comprend un shampoing accompagné d’un soin express, la réalisation des nattes, ainsi que l’installation complète de votre perruque ,styling inclus (sauf carré) ,sans dépôt préalable de la wig.', 120::integer, 13600, 10),
  ('ponytail-lace-frontal-lace-hd-uniquement', 'pose-customisation', 'Ponytail lace frontal ( Lace HD uniquement )', 'Customisation comprise (décoloration des nœuds sur place).', 'Customisation comprise ( décoloration des noeud sur place )
* cheveux propre sans gras obligatoire', 160::integer, 13600, 11),
  ('brushing-refresh-hair-styling', 'pose-customisation', 'BRUSHING REFRESH HAIR STYLING', 'Lissage ou boucle, idéal pour les tissages ouverts ou une simple remise en forme.', 'LISSAGE OU BOUCLE , idéal pour les tissage ouvert , ou une simple remise en forme.', 45::integer, 4600, 12),
  ('repose-closure', 'pose-customisation', 'Repose closure', 'Lissage ou boucle légère inclus, sans dépôt à l’avance.', 'Lissage ou boucle légère inclus
Sans dépôt à l’avance.
La wig doit être propre et en bon état.
Des frais supplémentaires seront facturés si ces conditions ne sont pas respectées.', 80::integer, 7600, 13),
  ('repose-lace-lissage-ou-boucle-legere', 'pose-customisation', 'Repose Lace ( lissage ou boucle légère )', 'Sans dépôt à l’avance.', 'Sans dépôt à l’avance.
La wig doit être propre et en bon état.
Des frais supplémentaires seront facturés si ces conditions ne sont pas respectées.', 90::integer, 8600, 14),
  ('shampoing-soins-coupe-des-pointes-lissage-simple-ou-nattes-c', 'soins-tissages', 'Shampoing Soins - Coupe des pointes - Lissage simple ou nattes collées', 'Votre moment détente, prenez soin de vos cheveux naturels.', 'Votre moment détente ,prenez soins de vos cheveux naturels.', 60::integer, 6600, 15),
  ('defrisage-mizani', 'soins-tissages', 'Defrisage Mizani', 'Défrise efficacement les cheveux bouclés, frisés et crépus.', 'Défrise efficacement les cheveux bouclés, frisés et crépus.
Aide à réduire le volume et les frisottis.
Facilite le coiffage quotidien.
Laisse les cheveux plus lisses, doux et maniables.
Contient des agents conditionnants qui contribuent à protéger la fibre capillaire pendant le service chimique.', 90::integer, 5000, 16),
  ('tissage-ouvert-flipover-uniquement', 'soins-tissages', 'Tissage ouvert ( Flipover uniquement)', 'Réalisation des nattes et installation complète de votre tissage Flipover.', 'Ce service comprend la réalisation des nattes, ainsi que l’installation complète de votre TISSAGE Flipover
Sans dépôt à l’avance.
Les mèches doivent être propre et en bon état.
Des frais supplémentaires seront facturés si ces conditions ne sont pas respectées.', 120::integer, 7600, 17),
  ('naturelglam-signature', 'makeup-total-look', 'NaturelGlam Signature', 'Teint frais.', 'Teint frais.', 60::integer, 7600, 18),
  ('softglam-signature', 'makeup-total-look', 'SoftGlam Signature', 'Un maquillage élégant, doux, lumineux et naturel : l’effet « glamour sans effort ».', 'Le soft glam makeup est un maquillage élégant et sophistiqué qui reste doux, lumineux et naturel à l’œil. Il donne un effet “glamour sans effort” : le visage paraît parfaitement mis en valeur, sans maquillage trop chargé.', 85::integer, 9600, 19),
  ('total-look-lacewig-uniquement-ou-closurewig-hair-makeup-au-c', 'makeup-total-look', 'Total look LACEWIG ( UNIQUEMENT OU CLOSUREWIG ( hair & makeup au choix)', 'Hair & makeup au choix ; nattes non incluses, styling simple boucle ou lissage.', 'NATTES NON INCLUS ET STYLING SIMPLE BOUCLE OU LISSAGE
LES AUTRES MODÈLES SUR DEVIS RÉALISABLE SUR PLACE.
Dépôt wig en avance 2 À 3 JOURS EN AVANCE.', 180::integer, 25600, 20)
) as v(slug, cat, name, short, descr, dur, price, ord) join public.service_categories c on c.slug = v.cat
on conflict (slug) do update set name = excluded.name, short_description = excluded.short_description, description = excluded.description,
  duration_minutes = excluded.duration_minutes, price_cents = excluded.price_cents, sort_order = excluded.sort_order, category_id = excluded.category_id, is_active = true;
