package com.profile.service.impl;

import com.profile.dtos.request.CreateGameHistoryRequest;
import com.profile.dtos.response.GameHistoryResponse;
import com.profile.entity.GameHistory;
import com.profile.exceptions.AppException;
import com.profile.mapper.UserMapper;
import com.profile.repository.GameHistoryRepository;
import com.profile.service.GameHistoryService;
import com.profile.shared.enums.GameResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class GameHistoryServiceImpl implements GameHistoryService {

    private final GameHistoryRepository gameHistoryRepository;
    private final UserMapper userMapper;

    @Override
    @Transactional
    public GameHistoryResponse createGameHistory(CreateGameHistoryRequest request) {
        log.info("Creating game history for user: {} in game session: {} with result: {}",
                request.getUserId(), request.getGameSessionId(), request.getGameResult());

        GameHistory gameHistory = userMapper.createGameHistoryRequestToGameHistory(request);
        GameHistory savedGameHistory = gameHistoryRepository.save(gameHistory);

        log.info("Game history created successfully with id: {}", savedGameHistory.getId());
        return userMapper.gameHistoryToGameHistoryResponse(savedGameHistory);
    }

    @Override
    public GameHistoryResponse getGameHistoryById(Long id) {
        log.info("Getting game history by id: {}", id);

        GameHistory gameHistory = gameHistoryRepository.findById(id)
                .orElseThrow(() -> new AppException("Game history not found with id: " + id));

        return userMapper.gameHistoryToGameHistoryResponse(gameHistory);
    }

    @Override
    public Page<GameHistoryResponse> getUserGameHistory(String userId, Pageable pageable) {
        log.info("Getting game history for user: {} with pagination", userId);

        Page<GameHistory> gameHistoryPage = gameHistoryRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);

        return gameHistoryPage.map(userMapper::gameHistoryToGameHistoryResponse);
    }

    @Override
    public List<GameHistoryResponse> getUserGameHistoryByResult(String userId, String gameResult) {
        log.info("Getting game history for user: {} with result: {}", userId, gameResult);

        try {
            GameResult resultEnum = GameResult.valueOf(gameResult.toUpperCase());
            List<GameHistory> gameHistories = gameHistoryRepository.findByUserIdAndGameResult(userId, resultEnum);

            return gameHistories.stream()
                    .map(userMapper::gameHistoryToGameHistoryResponse)
                    .collect(Collectors.toList());
        } catch (IllegalArgumentException e) {
            throw new AppException("Invalid game result: " + gameResult);
        }
    }

    @Override
    public List<GameHistoryResponse> getGameHistoryByGameSessionId(String gameSessionId) {
        log.info("Getting game history for game session: {}", gameSessionId);

        List<GameHistory> gameHistories = gameHistoryRepository.findByGameSessionId(gameSessionId);

        return gameHistories.stream()
                .map(userMapper::gameHistoryToGameHistoryResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<GameHistoryResponse> getUserGameHistoryByGameMode(String userId, String gameMode) {
        log.info("Getting game history for user: {} with game mode: {}", userId, gameMode);

        List<GameHistory> gameHistories = gameHistoryRepository.findByUserIdAndGameMode(userId, gameMode);

        return gameHistories.stream()
                .map(userMapper::gameHistoryToGameHistoryResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<GameHistoryResponse> getUserGameHistoryByDateRange(String userId, LocalDateTime startDate, LocalDateTime endDate) {
        log.info("Getting game history for user: {} between {} and {}", userId, startDate, endDate);

        List<GameHistory> gameHistories = gameHistoryRepository.findByUserIdAndDateRange(userId, startDate, endDate);

        return gameHistories.stream()
                .map(userMapper::gameHistoryToGameHistoryResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<GameHistoryResponse> getUserTopScores(String userId, int limit) {
        log.info("Getting top {} scores for user: {}", limit, userId);

        Pageable pageable = PageRequest.of(0, limit);
        List<GameHistory> topScores = gameHistoryRepository.findTopScoresByUserId(userId, pageable);

        return topScores.stream()
                .map(userMapper::gameHistoryToGameHistoryResponse)
                .collect(Collectors.toList());
    }

    @Override
    public Map<String, Object> getUserGameStatistics(String userId) {
        log.info("Getting game statistics for user: {}", userId);

        Map<String, Object> stats = new HashMap<>();

        Long totalGames = gameHistoryRepository.countByUserId(userId);
        Long victories = gameHistoryRepository.countVictoriesByUserId(userId);
        Long defeats = gameHistoryRepository.countDefeatsByUserId(userId);
        Long draws = gameHistoryRepository.countDrawsByUserId(userId);
        Integer totalScore = gameHistoryRepository.getTotalScoreEarnedByUserId(userId);
        Integer totalExperience = gameHistoryRepository.getTotalExperienceGainedByUserId(userId);
        Double avgDuration = gameHistoryRepository.getAverageGameDurationByUserId(userId);
        Long distinctGameModes = gameHistoryRepository.countDistinctGameModesByUserId(userId);

        stats.put("totalGames", totalGames);
        stats.put("victories", victories);
        stats.put("defeats", defeats);
        stats.put("draws", draws);
        stats.put("winRate", totalGames > 0 ? (double) victories / totalGames * 100 : 0.0);
        stats.put("totalScoreEarned", totalScore != null ? totalScore : 0);
        stats.put("totalExperienceGained", totalExperience != null ? totalExperience : 0);
        stats.put("averageGameDuration", avgDuration != null ? avgDuration : 0.0);
        stats.put("distinctGameModesPlayed", distinctGameModes);

        return stats;
    }

    @Override
    public Integer getUserTotalScoreEarned(String userId) {
        log.info("Getting total score earned for user: {}", userId);

        Integer totalScore = gameHistoryRepository.getTotalScoreEarnedByUserId(userId);
        return totalScore != null ? totalScore : 0;
    }

    @Override
    public Integer getUserTotalExperienceGained(String userId) {
        log.info("Getting total experience gained for user: {}", userId);

        Integer totalExperience = gameHistoryRepository.getTotalExperienceGainedByUserId(userId);
        return totalExperience != null ? totalExperience : 0;
    }

    @Override
    public Double getUserAverageGameDuration(String userId) {
        log.info("Getting average game duration for user: {}", userId);

        Double avgDuration = gameHistoryRepository.getAverageGameDurationByUserId(userId);
        return avgDuration != null ? avgDuration : 0.0;
    }

    @Override
    public Long getUserGameHistoryCount(String userId) {
        log.info("Getting game history count for user: {}", userId);

        return gameHistoryRepository.countByUserId(userId);
    }

    @Override
    public Long getUserGameHistoryCountByResult(String userId, String gameResult) {
        log.info("Getting game history count for user: {} with result: {}", userId, gameResult);

        try {
            GameResult resultEnum = GameResult.valueOf(gameResult.toUpperCase());
            return gameHistoryRepository.countByUserIdAndGameResult(userId, resultEnum);
        } catch (IllegalArgumentException e) {
            throw new AppException("Invalid game result: " + gameResult);
        }
    }

    @Override
    public Long getUserGameHistoryCountByGameMode(String userId, String gameMode) {
        log.info("Getting game history count for user: {} with game mode: {}", userId, gameMode);

        return gameHistoryRepository.countByUserIdAndGameMode(userId, gameMode);
    }

    @Override
    public Long getUserDistinctGameModesCount(String userId) {
        log.info("Getting distinct game modes count for user: {}", userId);

        return gameHistoryRepository.countDistinctGameModesByUserId(userId);
    }

    @Override
    public GameHistoryResponse getUserGameHistoryByGameSessionId(String gameSessionId, String userId) {
        log.info("Getting game history for game session: {} and user: {}", gameSessionId, userId);

        GameHistory gameHistory = gameHistoryRepository.findByGameSessionIdAndUserId(gameSessionId, userId)
                .orElseThrow(() -> new AppException("Game history not found for game session: " + gameSessionId + " and user: " + userId));

        return userMapper.gameHistoryToGameHistoryResponse(gameHistory);
    }

    @Override
    @Transactional
    public void deleteGameHistory(Long id) {
        log.info("Deleting game history with id: {}", id);

        if (!gameHistoryRepository.existsById(id)) {
            throw new AppException("Game history not found with id: " + id);
        }

        gameHistoryRepository.deleteById(id);
        log.info("Game history deleted successfully with id: {}", id);
    }

    @Override
    @Transactional
    public void deleteUserGameHistory(String userId) {
        log.info("Deleting all game history for user: {}", userId);

        long deletedCount = gameHistoryRepository.countByUserId(userId);
        if (deletedCount == 0) {
            log.warn("No game history found for user: {}", userId);
            return;
        }

        gameHistoryRepository.deleteByUserId(userId);
        log.info("Deleted {} game history records for user: {}", deletedCount, userId);
    }

    @Override
    @Transactional
    public void deleteGameHistoryByGameSessionId(String gameSessionId) {
        log.info("Deleting all game history for game session: {}", gameSessionId);

        List<GameHistory> gameHistories = gameHistoryRepository.findByGameSessionId(gameSessionId);
        if (gameHistories.isEmpty()) {
            log.warn("No game history found for game session: {}", gameSessionId);
            return;
        }

        gameHistoryRepository.deleteByGameSessionId(gameSessionId);
        log.info("Deleted {} game history records for game session: {}", gameHistories.size(), gameSessionId);
    }
}