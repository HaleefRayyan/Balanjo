-- Nama depan & belakang terpisah dari nama tampilan (halaman Akun di profil).
ALTER TABLE "User" ADD COLUMN "firstName" TEXT;
ALTER TABLE "User" ADD COLUMN "lastName" TEXT;

-- Isi dari nama yang sudah ada: kata pertama = nama depan, sisanya = nama belakang.
UPDATE "User"
SET "firstName" = split_part(trim("name"), ' ', 1),
    "lastName"  = NULLIF(trim(substr(trim("name"), length(split_part(trim("name"), ' ', 1)) + 1)), '');
