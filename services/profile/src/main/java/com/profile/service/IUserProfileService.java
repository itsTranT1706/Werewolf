package com.profile.service;

import com.profile.dtos.request.CreateUserRequest;
import com.profile.dtos.request.InitProfileRequest;
import com.profile.dtos.request.UpdateProfileRequest;
import com.profile.dtos.response.UserProfileResponse;

public interface IUserProfileService {
    UserProfileResponse initProfile(InitProfileRequest request);
//    UserProfileResponse createUser(CreateUserRequest request);

    UserProfileResponse updateProfile(String userId, UpdateProfileRequest request);
}
