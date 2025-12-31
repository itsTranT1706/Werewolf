package com.profile.mapper;

import com.profile.dtos.request.CreateGameHistoryRequest;
import com.profile.dtos.request.InitProfileRequest;
import com.profile.dtos.response.GameHistoryResponse;
import com.profile.dtos.response.UserProfileResponse;
import com.profile.entity.GameHistory;
import com.profile.entity.UserProfile;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    UserProfile initProfileRequestToUserProfile(InitProfileRequest request);

    UserProfileResponse userProfileToUserProfileResponse(UserProfile userProfile);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    GameHistory createGameHistoryRequestToGameHistory(CreateGameHistoryRequest request);

    GameHistoryResponse gameHistoryToGameHistoryResponse(GameHistory gameHistory);
}

