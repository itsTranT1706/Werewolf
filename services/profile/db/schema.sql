-- Table: public.users

-- DROP TABLE IF EXISTS public.users;

CREATE TABLE IF NOT EXISTS public.users
(
    id bigint NOT NULL DEFAULT nextval('users_id_seq'::regclass),
    username character varying(50) COLLATE pg_catalog."default" NOT NULL,
    display_name character varying(100) COLLATE pg_catalog."default",
    avatar_url text COLLATE pg_catalog."default",
    total_point integer NOT NULL DEFAULT 0,
    total_match integer NOT NULL DEFAULT 0,
    win_match integer NOT NULL DEFAULT 0,
    lose_match integer NOT NULL DEFAULT 0,
    created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    email character varying(255) COLLATE pg_catalog."default" NOT NULL,
    full_name character varying(100) COLLATE pg_catalog."default",
    password character varying(255) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT uk6dotkott2kjsp8vw4d0m25fb7 UNIQUE (email),
    CONSTRAINT users_username_key UNIQUE (username)
    )

    TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.users
    OWNER to postgres;
-- Index: idx_users_total_point_desc

-- DROP INDEX IF EXISTS public.idx_users_total_point_desc;

CREATE INDEX IF NOT EXISTS idx_users_total_point_desc
    ON public.users USING btree
    (total_point DESC NULLS FIRST)
    WITH (fillfactor=100, deduplicate_items=True)
    TABLESPACE pg_default;


CREATE TABLE game_history (
                              id BIGSERIAL PRIMARY KEY,

                              user_id BIGINT NOT NULL,
                              room_id VARCHAR(50) NOT NULL,
                              match_id VARCHAR(50) NOT NULL,

                              role VARCHAR(30) NOT NULL,
                              is_win BOOLEAN NOT NULL,           -- TRUE = WIN, FALSE = LOSE
                              point_change INT NOT NULL,

                              started_at TIMESTAMP,
                              ended_at TIMESTAMP,

                              created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

                              CONSTRAINT fk_game_history_user
                                  FOREIGN KEY (user_id)
                                      REFERENCES users(id)
                                      ON DELETE CASCADE
);