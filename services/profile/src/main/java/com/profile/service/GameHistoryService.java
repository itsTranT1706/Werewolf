// package com.profile.service;

// import com.profile.dtos.request.CreateGameHistoryRequest;
// import com.profile.dtos.response.GameHistoryResponse;
// import org.springframework.data.domain.Page;
// import org.springframework.data.domain.Pageable;

// import java.time.LocalDateTime;
// import java.util.List;
// import java.util.Map;

// public interface GameHistoryService {

//     GameHistoryResponse createGameHistory(CreateGameHistoryRequest request);

//     GameHistoryResponse getGameHistoryById(Long id);

//     Page<GameHistoryResponse> getUserGameHistory(String userId, Pageable pageable);

//     List<GameHistoryResponse> getUserGameHistoryByResult(String userId, String gameResult);

//     List<GameHistoryResponse> getGameHistoryByGameSessionId(String gameSessionId);

//     List<GameHistoryResponse> getUserGameHistoryByGameMode(String userId, String gameMode);

//     List<GameHistoryResponse> getUserGameHistoryByDateRange(String userId, LocalDateTime startDate, LocalDateTime endDate);

//     List<GameHistoryResponse> getUserTopScores(String userId, int limit);

//     Map<String, Object> getUserGameStatistics(String userId);

//     Integer getUserTotalScoreEarned(String userId);

//     Integer getUserTotalExperienceGained(String userId);

//     Double getUserAverageGameDuration(String userId);

//     Long getUserGameHistoryCount(String userId);

//     Long getUserGameHistoryCountByResult(String userId, String gameResult);

//     Long getUserGameHistoryCountByGameMode(String userId, String gameMode);

//     Long getUserDistinctGameModesCount(String userId);

//     GameHistoryResponse getUserGameHistoryByGameSessionId(String gameSessionId, String userId);

//     void deleteGameHistory(Long id);

//     void deleteUserGameHistory(String userId);

//     void deleteGameHistoryByGameSessionId(String gameSessionId);
// }