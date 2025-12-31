package com.profile.dtos.response;

import lombok.Builder;

import java.time.LocalDateTime;
import java.util.List;

@Builder
public record MatchHistoryResponse(
         String matchId,
         String roomId,
         LocalDateTime startedAt,
        LocalDateTime endedAt,
        List<PlayerRoleResponse>players
) {
}
