package com.profile.dtos;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.http.HttpStatus;
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL) // Bỏ qua các field null để giảm payload
public class ApiResponse<T> {
    private int code; // Business Code
    private String message; // Message mô tả
    private T result; // Dữ liệu thực tế (Object, List,...)

    // Helper method cho trường hợp thành công
    public static <T> ApiResponse<T> success(T result) {
        return ApiResponse.<T>builder()
                .code(HttpStatus.OK.value())
                .result(result)
                .build();
    }

    // Helper method cho trường hợp thành công với message tùy chỉnh
    public static <T> ApiResponse<T> success(int code, T result) {
        return ApiResponse.<T>builder()
                .code(code)
                .result(result)
                .build();
    }

    // Helper method cho trường hợp lỗi
    public static <T> ApiResponse<T> error(int code, String message) {
        return ApiResponse.<T>builder()
                .code(code)
                .message(message)
                .result(null)
                .build();
    }
}
