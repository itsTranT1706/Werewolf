package com.profile.dtos.response;

import java.time.LocalDateTime;

public record UserProfileResponse(
        String id,
        String username,
        String email,
        String avatarUrl,
        String displayName,
        Integer totalPoint,
        Integer totalMatch,
        Integer winMatch,
        Integer loseMatch,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
