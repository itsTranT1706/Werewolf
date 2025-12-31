package com.profile.dtos.response;

import lombok.Builder;

@Builder
public record  PlayerRoleResponse(
         String userId,
         String username,
         String role,
         Boolean isWin,
        Integer pointChange
) {
}
