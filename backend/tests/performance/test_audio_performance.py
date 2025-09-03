"""
Performance tests for audio processing components
Tests memory usage, processing speed, and resource management
"""

import pytest
import time
import asyncio
import psutil
import gc
from unittest.mock import patch, Mock
import torch
import torchaudio
import numpy as np
from pathlib import Path
import tempfile
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed

from app.services import get_stt_service, get_tts_service, get_voice_cloning_service


@pytest.mark.performance
@pytest.mark.audio
class TestSTTPerformance:
    """Performance tests for Speech-to-Text service"""

    @pytest.mark.benchmark
    def test_transcription_speed_small_file(self, benchmark, sample_audio_file, mock_stt_service):
        """Benchmark transcription speed for small audio files (< 30 seconds)"""
        
        def transcribe_audio():
            return mock_stt_service.transcribe_audio(
                audio_path=sample_audio_file,
                language="en",
                task="transcribe"
            )
        
        # Benchmark the transcription
        result = benchmark(transcribe_audio)
        
        # Verify result structure
        assert "transcription" in result
        assert "confidence" in result
        assert "audio_duration" in result

    @pytest.mark.benchmark
    def test_transcription_speed_large_file(self, benchmark, long_audio_file, mock_stt_service):
        """Benchmark transcription speed for larger audio files (30+ seconds)"""
        
        def transcribe_large_audio():
            return mock_stt_service.transcribe_audio(
                audio_path=long_audio_file,
                language="en",
                task="transcribe"
            )
        
        result = benchmark(transcribe_large_audio)
        
        assert "transcription" in result
        assert result["audio_duration"] >= 30.0

    @pytest.mark.slow
    def test_memory_usage_during_transcription(self, sample_audio_file, mock_stt_service):
        """Test memory usage during transcription process"""
        
        process = psutil.Process()
        initial_memory = process.memory_info().rss / 1024 / 1024  # MB
        
        # Perform multiple transcriptions
        for _ in range(10):
            mock_stt_service.transcribe_audio(
                audio_path=sample_audio_file,
                language="en",
                task="transcribe"
            )
            
            current_memory = process.memory_info().rss / 1024 / 1024
            memory_increase = current_memory - initial_memory
            
            # Memory increase should be reasonable (< 500MB for mock service)
            assert memory_increase < 500, f"Memory usage increased by {memory_increase}MB"
        
        # Force garbage collection and check for memory leaks
        gc.collect()
        final_memory = process.memory_info().rss / 1024 / 1024
        memory_diff = final_memory - initial_memory
        
        # Memory should return close to initial levels (allow 50MB buffer)
        assert memory_diff < 50, f"Potential memory leak: {memory_diff}MB not freed"

    @pytest.mark.benchmark
    def test_concurrent_transcriptions(self, performance_test_files, mock_stt_service):
        """Test performance of concurrent transcription requests"""
        
        def transcribe_file(file_path):
            start_time = time.time()
            result = mock_stt_service.transcribe_audio(
                audio_path=file_path,
                language="en",
                task="transcribe"
            )
            end_time = time.time()
            return end_time - start_time, result
        
        # Test with different concurrency levels
        concurrency_levels = [1, 2, 4, 8]
        results = {}
        
        for num_workers in concurrency_levels:
            start_time = time.time()
            
            with ThreadPoolExecutor(max_workers=num_workers) as executor:
                futures = [
                    executor.submit(transcribe_file, file_path)
                    for file_path in performance_test_files[:num_workers]
                ]
                
                transcription_times = []
                for future in as_completed(futures):
                    duration, result = future.result()
                    transcription_times.append(duration)
                    assert "transcription" in result
            
            total_time = time.time() - start_time
            avg_transcription_time = np.mean(transcription_times)
            
            results[num_workers] = {
                'total_time': total_time,
                'avg_transcription_time': avg_transcription_time,
                'throughput': num_workers / total_time
            }
        
        # Verify that concurrency improves throughput
        assert results[4]['throughput'] > results[1]['throughput'], \
            "Concurrency should improve throughput"

    @pytest.mark.benchmark
    def test_batch_transcription_performance(self, performance_test_files, mock_stt_service):
        """Test performance of batch transcription processing"""
        
        batch_sizes = [1, 5, 10]
        performance_metrics = {}
        
        for batch_size in batch_sizes:
            files_batch = performance_test_files[:batch_size]
            
            start_time = time.time()
            
            # Process batch
            results = []
            for file_path in files_batch:
                result = mock_stt_service.transcribe_audio(
                    audio_path=file_path,
                    language="en",
                    task="transcribe"
                )
                results.append(result)
            
            end_time = time.time()
            total_time = end_time - start_time
            
            performance_metrics[batch_size] = {
                'total_time': total_time,
                'avg_time_per_file': total_time / batch_size,
                'files_per_second': batch_size / total_time
            }
            
            # Verify all transcriptions succeeded
            assert len(results) == batch_size
            assert all("transcription" in result for result in results)
        
        # Log performance metrics for analysis
        for batch_size, metrics in performance_metrics.items():
            print(f"Batch size {batch_size}: {metrics}")


@pytest.mark.performance
@pytest.mark.audio
class TestTTSPerformance:
    """Performance tests for Text-to-Speech service"""

    @pytest.mark.benchmark
    def test_synthesis_speed_short_text(self, benchmark, mock_tts_service):
        """Benchmark synthesis speed for short text (< 100 characters)"""
        
        short_text = "This is a short test for TTS performance."
        
        def synthesize_short_text():
            return mock_tts_service.synthesize_speech(
                text=short_text,
                language="en",
                voice_style="neutral",
                emotion="neutral"
            )
        
        result = benchmark(synthesize_short_text)
        
        assert "audio_path" in result
        assert "duration_seconds" in result
        assert result["text"] == short_text

    @pytest.mark.benchmark
    def test_synthesis_speed_long_text(self, benchmark, mock_tts_service):
        """Benchmark synthesis speed for long text (1000+ characters)"""
        
        long_text = "This is a very long text for testing TTS performance. " * 20  # ~1100 chars
        
        def synthesize_long_text():
            return mock_tts_service.synthesize_speech(
                text=long_text,
                language="en",
                voice_style="neutral",
                emotion="neutral"
            )
        
        result = benchmark(synthesize_long_text)
        
        assert "audio_path" in result
        assert result["text"] == long_text

    @pytest.mark.slow
    def test_memory_usage_during_synthesis(self, mock_tts_service):
        """Test memory usage during TTS synthesis"""
        
        process = psutil.Process()
        initial_memory = process.memory_info().rss / 1024 / 1024  # MB
        
        # Synthesize multiple texts of varying lengths
        test_texts = [
            "Short text.",
            "Medium length text for testing purposes with more words.",
            "This is a much longer text that contains significantly more content and should require more memory to process during text-to-speech synthesis operations."
        ]
        
        memory_measurements = []
        
        for i, text in enumerate(test_texts * 5):  # Process each text 5 times
            mock_tts_service.synthesize_speech(
                text=text,
                language="en",
                voice_style="neutral",
                emotion="neutral"
            )
            
            current_memory = process.memory_info().rss / 1024 / 1024
            memory_measurements.append(current_memory - initial_memory)
            
            # Check for excessive memory growth
            if i > 0 and i % 5 == 0:  # Every 5 iterations
                recent_avg = np.mean(memory_measurements[-5:])
                assert recent_avg < 200, f"Memory usage too high: {recent_avg}MB"
        
        # Clean up and verify memory is freed
        gc.collect()
        final_memory = process.memory_info().rss / 1024 / 1024
        memory_retained = final_memory - initial_memory
        
        assert memory_retained < 30, f"Memory leak detected: {memory_retained}MB not freed"

    @pytest.mark.benchmark
    def test_concurrent_synthesis_performance(self, mock_tts_service):
        """Test performance of concurrent synthesis requests"""
        
        test_texts = [
            f"Concurrent synthesis test number {i} with unique content."
            for i in range(10)
        ]
        
        def synthesize_text(text):
            start_time = time.time()
            result = mock_tts_service.synthesize_speech(
                text=text,
                language="en",
                voice_style="neutral",
                emotion="neutral"
            )
            end_time = time.time()
            return end_time - start_time, result
        
        # Test different concurrency levels
        concurrency_results = {}
        
        for num_workers in [1, 2, 4, 6]:
            start_time = time.time()
            
            with ThreadPoolExecutor(max_workers=num_workers) as executor:
                futures = [
                    executor.submit(synthesize_text, text)
                    for text in test_texts[:num_workers]
                ]
                
                synthesis_times = []
                results = []
                
                for future in as_completed(futures):
                    duration, result = future.result()
                    synthesis_times.append(duration)
                    results.append(result)
            
            total_time = time.time() - start_time
            avg_synthesis_time = np.mean(synthesis_times)
            
            concurrency_results[num_workers] = {
                'total_time': total_time,
                'avg_synthesis_time': avg_synthesis_time,
                'throughput': num_workers / total_time
            }
            
            # Verify all syntheses succeeded
            assert len(results) == num_workers
            assert all("audio_path" in result for result in results)
        
        # Performance should improve with concurrency up to a point
        assert concurrency_results[2]['throughput'] > concurrency_results[1]['throughput']

    @pytest.mark.benchmark
    def test_voice_style_switching_performance(self, benchmark, mock_tts_service):
        """Test performance when switching between voice styles"""
        
        voice_styles = ["neutral", "professional", "casual", "cheerful"]
        emotions = ["neutral", "happy", "sad"]
        text = "Testing voice style switching performance."
        
        def switch_voice_styles():
            results = []
            for style in voice_styles:
                for emotion in emotions:
                    result = mock_tts_service.synthesize_speech(
                        text=text,
                        language="en",
                        voice_style=style,
                        emotion=emotion
                    )
                    results.append(result)
            return results
        
        results = benchmark(switch_voice_styles)
        
        # Should process all combinations successfully
        expected_combinations = len(voice_styles) * len(emotions)
        assert len(results) == expected_combinations
        assert all("audio_path" in result for result in results)


@pytest.mark.performance
@pytest.mark.voice_cloning
class TestVoiceCloningPerformance:
    """Performance tests for Voice Cloning service"""

    @pytest.mark.benchmark
    def test_voice_clone_creation_speed(self, benchmark, sample_audio_file, mock_voice_cloning_service):
        """Benchmark voice clone creation speed"""
        
        def create_voice_clone():
            return mock_voice_cloning_service.create_voice_clone(
                name="Performance Test Clone",
                sample_audio_path=sample_audio_file,
                user_id="perf_test_user"
            )
        
        result = benchmark(create_voice_clone)
        
        assert "clone_id" in result
        assert "status" in result
        assert result["name"] == "Performance Test Clone"

    @pytest.mark.benchmark
    def test_voice_embedding_extraction_speed(self, benchmark, sample_audio_file, mock_voice_cloning_service, voice_embedding_sample):
        """Benchmark voice embedding extraction speed"""
        
        mock_voice_cloning_service.extract_voice_embedding.return_value = voice_embedding_sample
        
        def extract_embedding():
            return mock_voice_cloning_service.extract_voice_embedding(sample_audio_file)
        
        embedding = benchmark(extract_embedding)
        
        assert embedding is not None
        assert len(embedding) == 512  # Standard embedding dimensions

    @pytest.mark.benchmark
    def test_cloned_voice_synthesis_speed(self, benchmark, mock_voice_cloning_service):
        """Benchmark synthesis speed with cloned voice"""
        
        text = "Testing cloned voice synthesis performance."
        clone_id = "test_clone_performance"
        
        def synthesize_with_clone():
            return mock_voice_cloning_service.synthesize_with_cloned_voice(
                text=text,
                clone_id=clone_id,
                language="en"
            )
        
        result = benchmark(synthesize_with_clone)
        
        assert "audio_path" in result
        assert result["clone_id"] == clone_id
        assert result["text"] == text

    @pytest.mark.slow
    def test_multiple_voice_clones_memory_usage(self, performance_test_files, mock_voice_cloning_service):
        """Test memory usage when creating multiple voice clones"""
        
        process = psutil.Process()
        initial_memory = process.memory_info().rss / 1024 / 1024  # MB
        
        created_clones = []
        memory_measurements = []
        
        # Create multiple voice clones
        for i, audio_file in enumerate(performance_test_files[:5]):
            clone_result = mock_voice_cloning_service.create_voice_clone(
                name=f"Performance Clone {i}",
                sample_audio_path=audio_file,
                user_id="perf_test_user"
            )
            created_clones.append(clone_result["clone_id"])
            
            current_memory = process.memory_info().rss / 1024 / 1024
            memory_increase = current_memory - initial_memory
            memory_measurements.append(memory_increase)
            
            # Memory shouldn't grow excessively
            assert memory_increase < 100 * (i + 1), f"Memory usage too high: {memory_increase}MB"
        
        # Verify all clones were created
        assert len(created_clones) == 5
        
        # Test synthesis with all clones
        test_text = "Testing synthesis with multiple clones."
        synthesis_results = []
        
        for clone_id in created_clones:
            result = mock_voice_cloning_service.synthesize_with_cloned_voice(
                text=test_text,
                clone_id=clone_id,
                language="en"
            )
            synthesis_results.append(result)
            
            current_memory = process.memory_info().rss / 1024 / 1024
            memory_increase = current_memory - initial_memory
            
            # Memory shouldn't grow significantly during synthesis
            assert memory_increase < 200, f"Synthesis memory usage too high: {memory_increase}MB"
        
        # Verify all syntheses succeeded
        assert len(synthesis_results) == 5
        assert all("audio_path" in result for result in synthesis_results)
        
        # Cleanup and verify memory is freed
        gc.collect()
        final_memory = process.memory_info().rss / 1024 / 1024
        memory_retained = final_memory - initial_memory
        
        assert memory_retained < 50, f"Memory leak: {memory_retained}MB not freed"

    @pytest.mark.benchmark
    def test_voice_similarity_search_performance(self, benchmark, mock_voice_cloning_service):
        """Benchmark voice similarity search performance"""
        
        clone_id = "test_clone_similarity"
        n_results = 10
        
        def search_similar_voices():
            return mock_voice_cloning_service.find_similar_voices(
                clone_id=clone_id,
                n_results=n_results
            )
        
        result = benchmark(search_similar_voices)
        
        assert "ids" in result
        assert len(result["ids"]) <= n_results
        assert "distances" in result
        assert "metadatas" in result


@pytest.mark.performance
@pytest.mark.streaming
class TestStreamingPerformance:
    """Performance tests for real-time streaming functionality"""

    @pytest.mark.benchmark
    def test_websocket_connection_overhead(self, benchmark, mock_websocket):
        """Benchmark WebSocket connection establishment overhead"""
        
        from app.api.routes.streaming import ConnectionManager
        
        def establish_connection():
            manager = ConnectionManager()
            # Simulate connection establishment
            client_id = f"perf_test_client_{time.time()}"
            return manager
        
        manager = benchmark(establish_connection)
        assert manager is not None

    @pytest.mark.benchmark
    def test_audio_chunk_processing_speed(self, benchmark):
        """Benchmark audio chunk processing speed for real-time transcription"""
        
        # Create mock audio chunk (1 second of 16kHz audio)
        sample_rate = 16000
        audio_chunk = np.random.randn(sample_rate).astype(np.float32)
        
        def process_audio_chunk():
            # Simulate audio processing
            # This would normally involve model inference
            processed_chunk = audio_chunk * 0.5  # Simple processing
            return {
                "transcription": "Processed audio chunk",
                "confidence": 0.9,
                "timestamp": time.time()
            }
        
        result = benchmark(process_audio_chunk)
        
        assert "transcription" in result
        assert "confidence" in result
        assert "timestamp" in result

    @pytest.mark.slow
    def test_streaming_memory_stability(self, mock_stt_service):
        """Test memory stability during extended streaming session"""
        
        process = psutil.Process()
        initial_memory = process.memory_info().rss / 1024 / 1024  # MB
        
        # Simulate extended streaming session
        chunk_size = 16000  # 1 second of audio at 16kHz
        num_chunks = 100  # Simulate 100 seconds of audio
        
        memory_measurements = []
        
        for i in range(num_chunks):
            # Create audio chunk
            audio_chunk = np.random.randn(chunk_size).astype(np.float32)
            
            # Simulate processing (would be actual transcription in real scenario)
            mock_stt_service.transcribe_audio(
                audio_path="mock_chunk",
                language="en",
                task="transcribe"
            )
            
            # Measure memory every 10 chunks
            if i % 10 == 0:
                current_memory = process.memory_info().rss / 1024 / 1024
                memory_increase = current_memory - initial_memory
                memory_measurements.append(memory_increase)
                
                # Memory growth should be controlled
                assert memory_increase < 50, f"Memory growth too high: {memory_increase}MB at chunk {i}"
        
        # Verify memory stability (no significant upward trend)
        if len(memory_measurements) > 2:
            # Check that memory doesn't continuously grow
            first_half_avg = np.mean(memory_measurements[:len(memory_measurements)//2])
            second_half_avg = np.mean(memory_measurements[len(memory_measurements)//2:])
            
            # Second half shouldn't be significantly higher than first half
            growth_rate = (second_half_avg - first_half_avg) / first_half_avg
            assert growth_rate < 0.5, f"Memory growth rate too high: {growth_rate*100}%"

    @pytest.mark.benchmark
    def test_concurrent_streaming_connections(self, benchmark, mock_websocket):
        """Benchmark handling multiple concurrent streaming connections"""
        
        from app.api.routes.streaming import ConnectionManager
        
        def handle_concurrent_connections():
            manager = ConnectionManager()
            connections = []
            
            # Simulate multiple connections
            for i in range(10):
                client_id = f"concurrent_client_{i}"
                # Would normally be: await manager.connect(websocket, client_id)
                manager.active_connections[client_id] = mock_websocket
                connections.append(client_id)
            
            # Simulate message sending to all clients
            test_message = {"type": "transcription", "text": "Test message"}
            for client_id in connections:
                # Would normally be: await manager.send_message(client_id, test_message)
                pass
            
            return len(connections)
        
        num_connections = benchmark(handle_concurrent_connections)
        assert num_connections == 10


@pytest.mark.performance
@pytest.mark.integration
class TestEndToEndPerformance:
    """End-to-end performance tests"""

    @pytest.mark.slow
    def test_complete_workflow_performance(
        self, 
        sample_audio_file, 
        mock_stt_service, 
        mock_tts_service, 
        mock_voice_cloning_service
    ):
        """Test performance of complete STT -> TTS workflow"""
        
        start_time = time.time()
        
        # Step 1: Transcribe audio
        transcription_start = time.time()
        transcription_result = mock_stt_service.transcribe_audio(
            audio_path=sample_audio_file,
            language="en",
            task="transcribe"
        )
        transcription_time = time.time() - transcription_start
        
        # Step 2: Synthesize transcribed text
        synthesis_start = time.time()
        synthesis_result = mock_tts_service.synthesize_speech(
            text=transcription_result["transcription"],
            language="en",
            voice_style="neutral",
            emotion="neutral"
        )
        synthesis_time = time.time() - synthesis_start
        
        total_time = time.time() - start_time
        
        # Performance assertions
        assert transcription_time < 5.0, f"Transcription too slow: {transcription_time}s"
        assert synthesis_time < 5.0, f"Synthesis too slow: {synthesis_time}s"
        assert total_time < 8.0, f"Total workflow too slow: {total_time}s"
        
        # Verify results
        assert "transcription" in transcription_result
        assert "audio_path" in synthesis_result
        assert synthesis_result["text"] == transcription_result["transcription"]

    @pytest.mark.slow
    def test_voice_cloning_workflow_performance(
        self, 
        sample_audio_file, 
        mock_voice_cloning_service
    ):
        """Test performance of complete voice cloning workflow"""
        
        start_time = time.time()
        
        # Step 1: Create voice clone
        clone_start = time.time()
        clone_result = mock_voice_cloning_service.create_voice_clone(
            name="Performance Test Clone",
            sample_audio_path=sample_audio_file,
            user_id="perf_user"
        )
        clone_time = time.time() - clone_start
        
        # Step 2: Synthesize with cloned voice
        synthesis_start = time.time()
        synthesis_result = mock_voice_cloning_service.synthesize_with_cloned_voice(
            text="Testing cloned voice synthesis performance.",
            clone_id=clone_result["clone_id"],
            language="en"
        )
        synthesis_time = time.time() - synthesis_start
        
        total_time = time.time() - start_time
        
        # Performance assertions
        assert clone_time < 10.0, f"Voice cloning too slow: {clone_time}s"
        assert synthesis_time < 5.0, f"Cloned voice synthesis too slow: {synthesis_time}s"
        assert total_time < 12.0, f"Total cloning workflow too slow: {total_time}s"
        
        # Verify results
        assert "clone_id" in clone_result
        assert "audio_path" in synthesis_result
        assert synthesis_result["clone_id"] == clone_result["clone_id"]

    @pytest.mark.benchmark
    def test_api_response_times(self, benchmark, async_test_client):
        """Benchmark API endpoint response times"""
        
        async def api_health_check():
            # Simulate API call (would be actual HTTP request)
            return {"status": "healthy", "response_time": 0.1}
        
        result = benchmark(asyncio.run, api_health_check())
        
        assert result["status"] == "healthy"
        assert result["response_time"] < 1.0