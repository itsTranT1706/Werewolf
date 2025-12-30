package com.profile.service;

import com.profile.dtos.request.CreateUserRequest;
import com.profile.dtos.request.UpdateProfileRequest;
import com.profile.dtos.response.UserResponse;

public interface IUserService {

    UserResponse createUser(CreateUserRequest request);

    UserResponse updateProfile(Long userId, UpdateProfileRequest request);
}
