package com.profile.dtos.response;

import java.time.LocalDateTime;

public record UserResponse(
        Long id,
        String username,
        String email,
        String fullName,
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
