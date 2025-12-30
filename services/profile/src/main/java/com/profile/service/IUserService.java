package com.profile.service;

import com.profile.dtos.request.CreateUserRequest;
import com.profile.dtos.response.UserResponse;

public interface IUserService {

    UserResponse createUser(CreateUserRequest request);
}
