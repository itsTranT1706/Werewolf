package com.profile.exceptions;
import lombok.Getter;

//lop ngoai le tu dinh nghia cho ung dung
@Getter
public class AppException extends RuntimeException {

    private final String errorCode;

    public AppException(String message) {
        super(message);
        this.errorCode = "BUSINESS_ERROR";
    }

    public AppException(String message, String errorCode) {
        super(message);
        this.errorCode = errorCode;
    }

    public AppException(String message, Throwable cause) {
        super(message, cause);
        this.errorCode = "BUSINESS_ERROR";
    }

    public AppException(String message, String errorCode, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
    }
}
