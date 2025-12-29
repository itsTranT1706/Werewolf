-- Leaderboard
CREATE INDEX idx_users_total_point_desc
    ON users (total_point DESC);

-- History theo user
CREATE INDEX idx_game_history_user_id
    ON game_history (user_id);

-- History theo match
CREATE INDEX idx_game_history_match_id
    ON game_history (match_id);