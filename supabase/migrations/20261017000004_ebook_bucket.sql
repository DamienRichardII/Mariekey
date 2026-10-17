-- Bucket PRIVÉ pour le PDF de l'ebook (téléchargement par lien temporaire après paiement).
insert into storage.buckets (id, name, public) values ('ebook', 'ebook', false) on conflict (id) do nothing;
-- Aucune policy publique : seul le service_role (serveur) peut lire / écrire.
