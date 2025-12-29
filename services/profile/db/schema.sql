CREATE TABLE users (
                       id BIGSERIAL PRIMARY KEY,

                       user_id UUID NOT NULL UNIQUE,     -- id từ auth/user-service
                       username VARCHAR(50) NOT NULL UNIQUE,
                       display_name VARCHAR(100),
                       avatar_url TEXT,

                       total_point INT NOT NULL DEFAULT 0,
                       total_match INT NOT NULL DEFAULT 0,
                       win_match INT NOT NULL DEFAULT 0,
                       lose_match INT NOT NULL DEFAULT 0,

                       created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                       updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
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