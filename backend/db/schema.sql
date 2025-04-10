CREATE TYPE visibility_type AS ENUM ('private', 'public', 'shared');
CREATE TYPE invitation_status AS ENUM ('pending', 'accepted', 'rejected');
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

--------------------------------------------------
CREATE OR REPLACE FUNCTION set_last_modified()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_modified = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
--------------------------------------------------

CREATE TABLE "user" (
  "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  "email" varchar UNIQUE,
  "google_id" varchar UNIQUE,
  "facebook_id" varchar UNIQUE,
  "apple_id" varchar UNIQUE,
  "password" varchar,
  "country_code" VARCHAR(2) DEFAULT 'WW',
  "created_at" timestamp DEFAULT (now())
);

CREATE TABLE "profile" (
  "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  "user_id" UUID NOT NULL UNIQUE REFERENCES "user"("id") ON DELETE CASCADE,
  "name" varchar NOT NULL,
  "bio" text,
  "photo_url" text,
  "birthdate" date
);

CREATE TABLE "interest" (
  "id" serial PRIMARY KEY,
  "name" varchar UNIQUE NOT NULL
);

CREATE TABLE "profileInterest" (
  "profile_id" UUID NOT NULL REFERENCES "profile"("id") ON DELETE CASCADE,
  "interest_id" integer NOT NULL REFERENCES "interest"("id") ON DELETE CASCADE
);

CREATE TABLE "person" (
  "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  "profile_id" UUID UNIQUE NOT NULL REFERENCES "profile"("id") ON DELETE CASCADE,
  "is_gifteo_user" boolean
);

CREATE TABLE "userPerson" (
  "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  "user_id" UUID REFERENCES "user"("id") ON DELETE CASCADE,
  "person_id" UUID REFERENCES "person"("id") ON DELETE CASCADE,
  "status" invitation_status DEFAULT 'pending',
  "created_at" timestamp DEFAULT (now())
);

CREATE TABLE "wishlist" (
  "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  "profile_id" UUID NOT NULL REFERENCES "profile"("id") ON DELETE CASCADE,
  "name" varchar NOT NULL,
  "visibility" visibility_type NOT NULL DEFAULT 'public',
  "created_by_user_id" UUID NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "shared_with_all_my_people" boolean DEFAULT true,
  "deleted" boolean DEFAULT false,
  "is_custom" boolean DEFAULT false,
  "created_at" timestamp DEFAULT (now()),
  "last_modified" timestamp DEFAULT now()
);
CREATE TRIGGER trg_set_last_modified_wishlist
BEFORE UPDATE ON wishlist
FOR EACH ROW
EXECUTE FUNCTION set_last_modified();

CREATE TABLE "wishlistItem" (
  "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  "wishlist_id" UUID NOT NULL REFERENCES "wishlist"("id") ON DELETE CASCADE,
  "name" varchar NOT NULL,
  "price" decimal(10,2) CHECK (price >= 0),
  "price_currency" varchar(3) DEFAULT 'EUR',
  "url" text,
  "photo_url" text,
  "description" text,
  "checked_off_by_user_id" UUID REFERENCES "user"("id") ON DELETE SET NULL,
  "deleted" boolean DEFAULT false,
  "created_at" timestamp DEFAULT (now()),
  "last_modified" timestamp DEFAULT now(),
  "modified_by_owner" timestamp DEFAULT NULL
);
CREATE TRIGGER trg_set_last_modified_wishlist_item
BEFORE UPDATE ON "wishlistItem"
FOR EACH ROW
EXECUTE FUNCTION set_last_modified();

CREATE TABLE "wishlistSharedWith" (
  "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  "wishlist_id" UUID NOT NULL REFERENCES "wishlist"("id") ON DELETE CASCADE,
  "shared_with_user_id" UUID NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "created_at" timestamp DEFAULT now()
);

CREATE TABLE "comment" (
  "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  "wishlist_id" UUID REFERENCES "wishlist"("id") ON DELETE CASCADE,
  "user_id" UUID REFERENCES "user"("id") ON DELETE CASCADE,
  "content" text,
  "created_at" timestamp DEFAULT (now())
);

CREATE TABLE "calendarEvent" (
  "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  "profile_id" UUID REFERENCES "profile"("id") ON DELETE CASCADE,
  "created_by_user_id" UUID REFERENCES "user"("id") ON DELETE CASCADE,
  "name" varchar NOT NULL,
  "date" date NOT NULL,
  "created_at" timestamp DEFAULT (now())
);

CREATE TABLE "calendarEventNotification" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES "calendarEvent"("id") ON DELETE CASCADE,
  days_before INTEGER NOT NULL,
  notified_at DATE,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE "globalEvent" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR NOT NULL,
  description TEXT,
  country_code VARCHAR(2),                 -- napĹ™. 'CZ', 'US', 'DE', 'WW'
  month INTEGER NOT NULL,                  -- 1â€“12
  day INTEGER,                             -- pro pevnĂ© datumy (1â€“31)
  weekday INTEGER,                         -- pro pohyblivĂ© svĂˇtky (0 = nedÄ›le, 1 = pondÄ›lĂ­, ...)
  week INTEGER,                            -- 1â€“5 (napĹ™. 2. nedÄ›le = 2)
  notification_days_before INTEGER DEFAULT 7,
  created_at TIMESTAMP DEFAULT now()
);

CREATE UNIQUE INDEX ON "profileInterest" ("profile_id", "interest_id");
CREATE UNIQUE INDEX ON "userPerson" ("user_id", "person_id");
CREATE INDEX ON "wishlistItem" ("wishlist_id");
CREATE INDEX ON "comment" ("wishlist_id");


COMMENT ON TABLE "user" IS 'Tabulka nese informace o uĹľivateli';

COMMENT ON TABLE "profile" IS 'Informace o profilu uĹľivatele. Lze vytvoĹ™it dummy profile pro non gifteo uĹľivatele.';

COMMENT ON TABLE "interest" IS 'PĹ™eddefinovanĂ˝ vĂ˝ÄŤet zĂˇjmĹŻ, kterĂ© si uĹľivatel mĹŻĹľe vybrat.';

COMMENT ON TABLE "profileInterest" IS 'PĹ™iĹ™azenĂ­ konkrĂ©tnĂ­ho zĂˇjmu k profilu uĹľivatele.';

COMMENT ON TABLE "person" IS 'Osoba, odkazujĂ­cĂ­ na profil. SlouĹľĂ­ pro sekci "My people".';

COMMENT ON TABLE "userPerson" IS 'SlouĹľĂ­ pro sekci "My people", evidence jakĂ˝ user mĂˇ pĹ™iĹ™azenĂ© jakĂ© osoby.';

COMMENT ON TABLE "wishlist" IS 'OriginĂˇlnĂ­ wishlist, kterĂ˝ si uĹľivatel vytvoĹ™il, je vĂˇzĂˇn na profil. Custom wishlisty budou takĂ© zde.';

COMMENT ON TABLE "wishlistItem" IS 'JednotlivĂ© itemy ve wishlistu a data o nich.';

COMMENT ON TABLE "comment" IS 'KomentĂˇĹ™e ke kopii wishlistu.';

COMMENT ON TABLE "calendarEvent" IS 'Data z kalendĂˇĹ™e s moĹľnostĂ­ pĹ™idat custom interval notifikace.';