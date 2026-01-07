
-- 2. Tạo bảng User Profile
CREATE TABLE IF NOT EXISTS public.user_profile
(
    -- id là Primary Key -> Tự động là UNIQUE và NOT NULL
    id character varying(36) NOT NULL,

    username character varying(50) NOT NULL,
    email character varying(255) NOT NULL,

    display_name character varying(100),
    avatar_url text,

    total_point integer NOT NULL DEFAULT 0,
    total_match integer NOT NULL DEFAULT 0,
    win_match integer NOT NULL DEFAULT 0,
    lose_match integer NOT NULL DEFAULT 0,

    created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Định nghĩa Khóa Chính (Primary Key)
    CONSTRAINT user_profile_pkey PRIMARY KEY (id),

    -- Các ràng buộc Unique khác (Đổi tên constraint cho khớp tên bảng)
    CONSTRAINT user_profile_email_unique UNIQUE (email),
    CONSTRAINT user_profile_username_unique UNIQUE (username)
    );

-- 3. Tạo Index cho điểm số (Sửa target table thành user_profile)
CREATE INDEX IF NOT EXISTS idx_user_profile_total_point_desc
    ON public.user_profile USING btree
    (total_point DESC NULLS FIRST);

-- 4. Tạo bảng Game History
CREATE TABLE IF NOT EXISTS public.game_history (
                                                   id BIGSERIAL PRIMARY KEY,

    -- user_id phải cùng kiểu dữ liệu với user_profile.id (varchar 36)
                                                   user_id character varying(36) NOT NULL,

    room_id VARCHAR(50) NOT NULL,
    match_id VARCHAR(50) NOT NULL,

    role VARCHAR(30) NOT NULL,
    is_win BOOLEAN NOT NULL,
    point_change INT NOT NULL,

    started_at TIMESTAMP,
    ended_at TIMESTAMP,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Khóa ngoại liên kết với bảng user_profile
    CONSTRAINT fk_game_history_user_profile
    FOREIGN KEY (user_id)
    REFERENCES user_profile(id)
    ON DELETE CASCADE
    );