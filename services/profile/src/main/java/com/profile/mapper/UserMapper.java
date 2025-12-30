package com.profile.mapper;

import com.profile.dtos.request.InitProfileRequest;
import com.profile.dtos.response.UserProfileResponse;
import com.profile.entity.UserProfile;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    UserProfile initProfileRequestToUserProfile(InitProfileRequest request);

    UserProfileResponse userProfileToUserProfileResponse(UserProfile userProfile);

}

