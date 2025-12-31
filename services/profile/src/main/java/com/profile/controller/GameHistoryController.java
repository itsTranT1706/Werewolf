package com.profile.controller;

import com.profile.dtos.ApiResponse;
import com.profile.dtos.request.CreateGameHistoryRequest;
import com.profile.dtos.response.GameHistoryResponse;
import com.profile.service.GameHistoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/game-history")
@RequiredArgsConstructor
@Slf4j
public class GameHistoryController {

    private final GameHistoryService gameHistoryService;

    @PostMapping
    public ResponseEntity<ApiResponse<GameHistoryResponse>> createGameHistory(
            @Valid @RequestBody CreateGameHistoryRequest request) {

        log.info("Received request to create game history for user: {}", request.getUserId());

        GameHistoryResponse gameHistoryResponse = gameHistoryService.createGameHistory(request);

        ApiResponse<GameHistoryResponse> response = ApiResponse.<GameHistoryResponse>builder()
                .code(HttpStatus.CREATED.value())
                .message("Game history created successfully")
                .result(gameHistoryResponse)
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<GameHistoryResponse>> getGameHistoryById(@PathVariable Long id) {

        log.info("Received request to get game history by id: {}", id);

        GameHistoryResponse gameHistoryResponse = gameHistoryService.getGameHistoryById(id);

        ApiResponse<GameHistoryResponse> response = ApiResponse.<GameHistoryResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Game history retrieved successfully")
                .result(gameHistoryResponse)
                .build();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<Page<GameHistoryResponse>>> getUserGameHistory(
            @PathVariable String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        log.info("Received request to get game history for user: {} with page: {}, size: {}", userId, page, size);

        Pageable pageable = PageRequest.of(page, size);
        Page<GameHistoryResponse> gameHistoryPage = gameHistoryService.getUserGameHistory(userId, pageable);

        ApiResponse<Page<GameHistoryResponse>> response = ApiResponse.<Page<GameHistoryResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("User game history retrieved successfully")
                .result(gameHistoryPage)
                .build();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/user/{userId}/result/{gameResult}")
    public ResponseEntity<ApiResponse<List<GameHistoryResponse>>> getUserGameHistoryByResult(
            @PathVariable String userId,
            @PathVariable String gameResult) {

        log.info("Received request to get game history for user: {} with result: {}", userId, gameResult);

        List<GameHistoryResponse> gameHistories = gameHistoryService.getUserGameHistoryByResult(userId, gameResult);

        ApiResponse<List<GameHistoryResponse>> response = ApiResponse.<List<GameHistoryResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("User game history by result retrieved successfully")
                .result(gameHistories)
                .build();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/game-session/{gameSessionId}")
    public ResponseEntity<ApiResponse<List<GameHistoryResponse>>> getGameHistoryByGameSessionId(
            @PathVariable String gameSessionId) {

        log.info("Received request to get game history for game session: {}", gameSessionId);

        List<GameHistoryResponse> gameHistories = gameHistoryService.getGameHistoryByGameSessionId(gameSessionId);

        ApiResponse<List<GameHistoryResponse>> response = ApiResponse.<List<GameHistoryResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Game history by game session ID retrieved successfully")
                .result(gameHistories)
                .build();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/user/{userId}/game-mode/{gameMode}")
    public ResponseEntity<ApiResponse<List<GameHistoryResponse>>> getUserGameHistoryByGameMode(
            @PathVariable String userId,
            @PathVariable String gameMode) {

        log.info("Received request to get game history for user: {} with game mode: {}", userId, gameMode);

        List<GameHistoryResponse> gameHistories = gameHistoryService.getUserGameHistoryByGameMode(userId, gameMode);

        ApiResponse<List<GameHistoryResponse>> response = ApiResponse.<List<GameHistoryResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("User game history by game mode retrieved successfully")
                .result(gameHistories)
                .build();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/user/{userId}/date-range")
    public ResponseEntity<ApiResponse<List<GameHistoryResponse>>> getUserGameHistoryByDateRange(
            @PathVariable String userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {

        log.info("Received request to get game history for user: {} between {} and {}", userId, startDate, endDate);

        List<GameHistoryResponse> gameHistories = gameHistoryService.getUserGameHistoryByDateRange(userId, startDate, endDate);

        ApiResponse<List<GameHistoryResponse>> response = ApiResponse.<List<GameHistoryResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("User game history by date range retrieved successfully")
                .result(gameHistories)
                .build();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/user/{userId}/top-scores")
    public ResponseEntity<ApiResponse<List<GameHistoryResponse>>> getUserTopScores(
            @PathVariable String userId,
            @RequestParam(defaultValue = "10") int limit) {

        log.info("Received request to get top {} scores for user: {}", limit, userId);

        List<GameHistoryResponse> topScores = gameHistoryService.getUserTopScores(userId, limit);

        ApiResponse<List<GameHistoryResponse>> response = ApiResponse.<List<GameHistoryResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("User top scores retrieved successfully")
                .result(topScores)
                .build();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/user/{userId}/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getUserGameStatistics(@PathVariable String userId) {

        log.info("Received request to get game statistics for user: {}", userId);

        Map<String, Object> stats = gameHistoryService.getUserGameStatistics(userId);

        ApiResponse<Map<String, Object>> response = ApiResponse.<Map<String, Object>>builder()
                .code(HttpStatus.OK.value())
                .message("User game statistics retrieved successfully")
                .result(stats)
                .build();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/game-session/{gameSessionId}/user/{userId}")
    public ResponseEntity<ApiResponse<GameHistoryResponse>> getUserGameHistoryByGameSessionId(
            @PathVariable String gameSessionId,
            @PathVariable String userId) {

        log.info("Received request to get game history for game session: {} and user: {}", gameSessionId, userId);

        GameHistoryResponse gameHistory = gameHistoryService.getUserGameHistoryByGameSessionId(gameSessionId, userId);

        ApiResponse<GameHistoryResponse> response = ApiResponse.<GameHistoryResponse>builder()
                .code(HttpStatus.OK.value())
                .message("User game history by game session ID retrieved successfully")
                .result(gameHistory)
                .build();

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteGameHistory(@PathVariable Long id) {

        log.info("Received request to delete game history with id: {}", id);

        gameHistoryService.deleteGameHistory(id);

        ApiResponse<Void> response = ApiResponse.<Void>builder()
                .code(HttpStatus.OK.value())
                .message("Game history deleted successfully")
                .build();

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<Void>> deleteUserGameHistory(@PathVariable String userId) {

        log.info("Received request to delete all game history for user: {}", userId);

        gameHistoryService.deleteUserGameHistory(userId);

        ApiResponse<Void> response = ApiResponse.<Void>builder()
                .code(HttpStatus.OK.value())
                .message("All user game history deleted successfully")
                .build();

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/game-session/{gameSessionId}")
    public ResponseEntity<ApiResponse<Void>> deleteGameHistoryByGameSessionId(@PathVariable String gameSessionId) {

        log.info("Received request to delete all game history for game session: {}", gameSessionId);

        gameHistoryService.deleteGameHistoryByGameSessionId(gameSessionId);

        ApiResponse<Void> response = ApiResponse.<Void>builder()
                .code(HttpStatus.OK.value())
                .message("All game history for game session deleted successfully")
                .build();

        return ResponseEntity.ok(response);
    }
}
