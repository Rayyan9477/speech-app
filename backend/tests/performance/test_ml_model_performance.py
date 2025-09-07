"""
Performance tests for ML model processing.
Tests model inference speed, memory usage, and scalability.
"""
import pytest
import time
import psutil
import threading
import asyncio
import concurrent.futures
from unittest.mock import patch, MagicMock
import numpy as np
import io
import wave
from pathlib import Path

from app.services.tts_service import TTSService
from app.services.stt_service import STTService
from app.services.voice_cloning_service import VoiceCloningService
from app.services.translation_service import TranslationService


class TestMLModelPerformance:
    """Performance tests for ML model processing."""
    
    @pytest.fixture
    def sample_audio_data(self):
        """Generate sample audio data for testing."""
        sample_rate = 16000
        duration = 5.0  # 5 seconds
        frequency = 440.0
        
        t = np.linspace(0, duration, int(sample_rate * duration), False)
        audio_data = np.sin(frequency * 2 * np.pi * t) * 0.3
        audio_data = (audio_data * 32767).astype(np.int16)
        
        # Create WAV file in memory
        buffer = io.BytesIO()
        with wave.open(buffer, 'wb') as wav_file:
            wav_file.setnchannels(1)
            wav_file.setsampwidth(2)
            wav_file.setframerate(sample_rate)
            wav_file.writeframes(audio_data.tobytes())
        
        buffer.seek(0)
        return buffer.getvalue()
    
    @pytest.fixture
    def long_audio_data(self):
        """Generate long audio data for stress testing."""
        sample_rate = 16000
        duration = 300.0  # 5 minutes
        frequency = 440.0
        
        t = np.linspace(0, duration, int(sample_rate * duration), False)
        audio_data = np.sin(frequency * 2 * np.pi * t) * 0.3
        audio_data = (audio_data * 32767).astype(np.int16)
        
        buffer = io.BytesIO()
        with wave.open(buffer, 'wb') as wav_file:
            wav_file.setnchannels(1)
            wav_file.setsampwidth(2)
            wav_file.setframerate(sample_rate)
            wav_file.writeframes(audio_data.tobytes())
        
        buffer.seek(0)
        return buffer.getvalue()

    @pytest.fixture
    def memory_monitor(self):
        """Monitor memory usage during tests."""
        process = psutil.Process()
        initial_memory = process.memory_info().rss
        peak_memory = initial_memory
        
        def update_peak():
            nonlocal peak_memory
            current_memory = process.memory_info().rss
            peak_memory = max(peak_memory, current_memory)
        
        return {
            'initial': initial_memory,
            'peak': lambda: peak_memory,
            'update': update_peak,
            'current': lambda: process.memory_info().rss
        }

    class TestTTSPerformance:
        """Performance tests for Text-to-Speech."""
        
        def test_single_tts_inference_time(self, memory_monitor):
            """Test single TTS inference performance."""
            tts_service = TTSService()
            text = "This is a performance test for text to speech conversion."
            
            with patch.object(tts_service, 'generate_audio') as mock_generate:
                # Mock model inference
                mock_generate.return_value = {
                    'audio_data': b'fake_audio_data' * 1000,
                    'sample_rate': 22050,
                    'duration': 3.5
                }
                
                start_time = time.time()
                memory_monitor['update']()
                
                result = tts_service.synthesize_speech(
                    text=text,
                    voice_id="test-voice",
                    speed=1.0,
                    pitch=1.0
                )
                
                end_time = time.time()
                memory_monitor['update']()
                
                inference_time = end_time - start_time
                memory_used = memory_monitor['peak']() - memory_monitor['initial']
                
                # Performance assertions
                assert inference_time < 5.0, f"TTS inference took {inference_time:.2f}s (should be < 5s)"
                assert memory_used < 500 * 1024 * 1024, f"TTS used {memory_used / (1024*1024):.1f}MB (should be < 500MB)"
                assert result is not None
                
                # Verify model was called
                mock_generate.assert_called_once()

        def test_batch_tts_performance(self, memory_monitor):
            """Test batch TTS processing performance."""
            tts_service = TTSService()
            texts = [
                f"This is test sentence number {i} for batch processing performance evaluation."
                for i in range(10)
            ]
            
            with patch.object(tts_service, 'generate_audio') as mock_generate:
                mock_generate.return_value = {
                    'audio_data': b'fake_audio_data' * 1000,
                    'sample_rate': 22050,
                    'duration': 3.5
                }
                
                start_time = time.time()
                memory_monitor['update']()
                
                results = []
                for text in texts:
                    result = tts_service.synthesize_speech(
                        text=text,
                        voice_id="test-voice",
                        speed=1.0,
                        pitch=1.0
                    )
                    results.append(result)
                    memory_monitor['update']()
                
                end_time = time.time()
                
                total_time = end_time - start_time
                avg_time_per_request = total_time / len(texts)
                peak_memory = memory_monitor['peak']() - memory_monitor['initial']
                
                # Performance assertions
                assert total_time < 30.0, f"Batch TTS took {total_time:.2f}s (should be < 30s)"
                assert avg_time_per_request < 3.0, f"Average per request: {avg_time_per_request:.2f}s (should be < 3s)"
                assert peak_memory < 1024 * 1024 * 1024, f"Peak memory: {peak_memory / (1024*1024):.1f}MB (should be < 1GB)"
                assert len(results) == len(texts)
                assert all(r is not None for r in results)

        def test_concurrent_tts_performance(self, memory_monitor):
            """Test concurrent TTS processing performance."""
            tts_service = TTSService()
            text = "Concurrent processing test for text to speech performance."
            num_concurrent = 5
            
            with patch.object(tts_service, 'generate_audio') as mock_generate:
                mock_generate.return_value = {
                    'audio_data': b'fake_audio_data' * 1000,
                    'sample_rate': 22050,
                    'duration': 3.5
                }
                
                def process_request():
                    return tts_service.synthesize_speech(
                        text=text,
                        voice_id="test-voice",
                        speed=1.0,
                        pitch=1.0
                    )
                
                start_time = time.time()
                memory_monitor['update']()
                
                with concurrent.futures.ThreadPoolExecutor(max_workers=num_concurrent) as executor:
                    futures = [executor.submit(process_request) for _ in range(num_concurrent)]
                    results = [future.result() for future in concurrent.futures.as_completed(futures)]
                
                end_time = time.time()
                memory_monitor['update']()
                
                total_time = end_time - start_time
                peak_memory = memory_monitor['peak']() - memory_monitor['initial']
                
                # Performance assertions
                assert total_time < 15.0, f"Concurrent TTS took {total_time:.2f}s (should be < 15s)"
                assert peak_memory < 2048 * 1024 * 1024, f"Peak memory: {peak_memory / (1024*1024):.1f}MB (should be < 2GB)"
                assert len(results) == num_concurrent
                assert all(r is not None for r in results)

        def test_long_text_tts_performance(self, memory_monitor):
            """Test TTS performance with very long text."""
            tts_service = TTSService()
            # Generate long text (approximately 1000 words)
            long_text = " ".join([
                "This is a very long text for testing the performance of text to speech conversion with extended input."
            ] * 100)
            
            with patch.object(tts_service, 'generate_audio') as mock_generate:
                mock_generate.return_value = {
                    'audio_data': b'fake_audio_data' * 10000,  # Larger output for long text
                    'sample_rate': 22050,
                    'duration': 120.0  # 2 minutes of audio
                }
                
                start_time = time.time()
                memory_monitor['update']()
                
                result = tts_service.synthesize_speech(
                    text=long_text,
                    voice_id="test-voice",
                    speed=1.0,
                    pitch=1.0
                )
                
                end_time = time.time()
                memory_monitor['update']()
                
                inference_time = end_time - start_time
                memory_used = memory_monitor['peak']() - memory_monitor['initial']
                
                # Performance assertions for long text
                assert inference_time < 60.0, f"Long text TTS took {inference_time:.2f}s (should be < 60s)"
                assert memory_used < 2048 * 1024 * 1024, f"Long text TTS used {memory_used / (1024*1024):.1f}MB (should be < 2GB)"
                assert result is not None

    class TestSTTPerformance:
        """Performance tests for Speech-to-Text."""
        
        def test_single_stt_inference_time(self, sample_audio_data, memory_monitor):
            """Test single STT inference performance."""
            stt_service = STTService()
            
            with patch.object(stt_service, 'transcribe_audio') as mock_transcribe:
                mock_transcribe.return_value = {
                    'text': 'This is a transcribed text from the audio file.',
                    'confidence': 0.95,
                    'language': 'en-US',
                    'word_timestamps': []
                }
                
                start_time = time.time()
                memory_monitor['update']()
                
                result = stt_service.transcribe(
                    audio_data=sample_audio_data,
                    language='en-US'
                )
                
                end_time = time.time()
                memory_monitor['update']()
                
                inference_time = end_time - start_time
                memory_used = memory_monitor['peak']() - memory_monitor['initial']
                
                # Performance assertions
                assert inference_time < 10.0, f"STT inference took {inference_time:.2f}s (should be < 10s)"
                assert memory_used < 1024 * 1024 * 1024, f"STT used {memory_used / (1024*1024):.1f}MB (should be < 1GB)"
                assert result is not None
                assert 'text' in result

        def test_long_audio_stt_performance(self, long_audio_data, memory_monitor):
            """Test STT performance with long audio files."""
            stt_service = STTService()
            
            with patch.object(stt_service, 'transcribe_audio') as mock_transcribe:
                mock_transcribe.return_value = {
                    'text': 'This is a very long transcribed text from a 5-minute audio file. ' * 50,
                    'confidence': 0.92,
                    'language': 'en-US',
                    'word_timestamps': []
                }
                
                start_time = time.time()
                memory_monitor['update']()
                
                result = stt_service.transcribe(
                    audio_data=long_audio_data,
                    language='en-US'
                )
                
                end_time = time.time()
                memory_monitor['update']()
                
                inference_time = end_time - start_time
                memory_used = memory_monitor['peak']() - memory_monitor['initial']
                
                # Performance assertions for long audio
                assert inference_time < 120.0, f"Long audio STT took {inference_time:.2f}s (should be < 120s)"
                assert memory_used < 4096 * 1024 * 1024, f"Long audio STT used {memory_used / (1024*1024):.1f}MB (should be < 4GB)"
                assert result is not None

        def test_concurrent_stt_performance(self, sample_audio_data, memory_monitor):
            """Test concurrent STT processing performance."""
            stt_service = STTService()
            num_concurrent = 3  # Lower than TTS due to higher memory usage
            
            with patch.object(stt_service, 'transcribe_audio') as mock_transcribe:
                mock_transcribe.return_value = {
                    'text': 'Concurrent transcription test result.',
                    'confidence': 0.95,
                    'language': 'en-US',
                    'word_timestamps': []
                }
                
                def process_request():
                    return stt_service.transcribe(
                        audio_data=sample_audio_data,
                        language='en-US'
                    )
                
                start_time = time.time()
                memory_monitor['update']()
                
                with concurrent.futures.ThreadPoolExecutor(max_workers=num_concurrent) as executor:
                    futures = [executor.submit(process_request) for _ in range(num_concurrent)]
                    results = [future.result() for future in concurrent.futures.as_completed(futures)]
                
                end_time = time.time()
                memory_monitor['update']()
                
                total_time = end_time - start_time
                peak_memory = memory_monitor['peak']() - memory_monitor['initial']
                
                # Performance assertions
                assert total_time < 30.0, f"Concurrent STT took {total_time:.2f}s (should be < 30s)"
                assert peak_memory < 6144 * 1024 * 1024, f"Peak memory: {peak_memory / (1024*1024):.1f}MB (should be < 6GB)"
                assert len(results) == num_concurrent
                assert all(r is not None for r in results)

    class TestVoiceCloningPerformance:
        """Performance tests for Voice Cloning."""
        
        def test_voice_training_performance(self, sample_audio_data, memory_monitor):
            """Test voice training performance."""
            voice_service = VoiceCloningService()
            training_samples = [sample_audio_data] * 5  # 5 training samples
            
            with patch.object(voice_service, 'train_voice_model') as mock_train:
                mock_train.return_value = {
                    'model_id': 'trained_model_123',
                    'training_time': 45.0,
                    'quality_score': 0.89
                }
                
                start_time = time.time()
                memory_monitor['update']()
                
                result = voice_service.create_voice_clone(
                    training_samples=training_samples,
                    voice_name="Performance Test Voice"
                )
                
                end_time = time.time()
                memory_monitor['update']()
                
                training_time = end_time - start_time
                memory_used = memory_monitor['peak']() - memory_monitor['initial']
                
                # Performance assertions for voice training
                assert training_time < 300.0, f"Voice training took {training_time:.2f}s (should be < 300s)"
                assert memory_used < 8192 * 1024 * 1024, f"Voice training used {memory_used / (1024*1024):.1f}MB (should be < 8GB)"
                assert result is not None
                assert 'model_id' in result

        def test_voice_inference_performance(self, memory_monitor):
            """Test voice cloning inference performance."""
            voice_service = VoiceCloningService()
            text = "Testing voice cloning inference performance with custom voice."
            
            with patch.object(voice_service, 'generate_with_cloned_voice') as mock_generate:
                mock_generate.return_value = {
                    'audio_data': b'cloned_voice_audio_data' * 1000,
                    'sample_rate': 22050,
                    'duration': 4.0
                }
                
                start_time = time.time()
                memory_monitor['update']()
                
                result = voice_service.synthesize_with_voice(
                    text=text,
                    voice_model_id="trained_model_123"
                )
                
                end_time = time.time()
                memory_monitor['update']()
                
                inference_time = end_time - start_time
                memory_used = memory_monitor['peak']() - memory_monitor['initial']
                
                # Performance assertions
                assert inference_time < 8.0, f"Voice cloning inference took {inference_time:.2f}s (should be < 8s)"
                assert memory_used < 1024 * 1024 * 1024, f"Voice cloning used {memory_used / (1024*1024):.1f}MB (should be < 1GB)"
                assert result is not None

    class TestTranslationPerformance:
        """Performance tests for Voice Translation."""
        
        def test_voice_translation_performance(self, sample_audio_data, memory_monitor):
            """Test voice translation performance."""
            translation_service = TranslationService()
            
            with patch.object(translation_service, 'translate_speech') as mock_translate:
                mock_translate.return_value = {
                    'original_text': 'Hello, this is a test.',
                    'translated_text': 'Hola, esto es una prueba.',
                    'translated_audio': b'translated_audio_data' * 1000,
                    'confidence': 0.91,
                    'duration': 3.2
                }
                
                start_time = time.time()
                memory_monitor['update']()
                
                result = translation_service.translate_voice(
                    audio_data=sample_audio_data,
                    source_language='en-US',
                    target_language='es-ES',
                    target_voice_id='spanish_voice'
                )
                
                end_time = time.time()
                memory_monitor['update']()
                
                translation_time = end_time - start_time
                memory_used = memory_monitor['peak']() - memory_monitor['initial']
                
                # Performance assertions
                assert translation_time < 15.0, f"Voice translation took {translation_time:.2f}s (should be < 15s)"
                assert memory_used < 2048 * 1024 * 1024, f"Voice translation used {memory_used / (1024*1024):.1f}MB (should be < 2GB)"
                assert result is not None
                assert 'translated_text' in result

        def test_batch_translation_performance(self, sample_audio_data, memory_monitor):
            """Test batch voice translation performance."""
            translation_service = TranslationService()
            num_samples = 3
            
            with patch.object(translation_service, 'translate_speech') as mock_translate:
                mock_translate.return_value = {
                    'original_text': 'Batch translation test.',
                    'translated_text': 'Prueba de traducción por lotes.',
                    'translated_audio': b'translated_audio_data' * 1000,
                    'confidence': 0.89,
                    'duration': 2.8
                }
                
                start_time = time.time()
                memory_monitor['update']()
                
                results = []
                for i in range(num_samples):
                    result = translation_service.translate_voice(
                        audio_data=sample_audio_data,
                        source_language='en-US',
                        target_language='es-ES',
                        target_voice_id='spanish_voice'
                    )
                    results.append(result)
                    memory_monitor['update']()
                
                end_time = time.time()
                
                total_time = end_time - start_time
                avg_time_per_translation = total_time / num_samples
                peak_memory = memory_monitor['peak']() - memory_monitor['initial']
                
                # Performance assertions
                assert total_time < 45.0, f"Batch translation took {total_time:.2f}s (should be < 45s)"
                assert avg_time_per_translation < 15.0, f"Average per translation: {avg_time_per_translation:.2f}s (should be < 15s)"
                assert peak_memory < 4096 * 1024 * 1024, f"Peak memory: {peak_memory / (1024*1024):.1f}MB (should be < 4GB)"
                assert len(results) == num_samples

    class TestSystemResourceUsage:
        """Test system resource usage under various loads."""
        
        def test_cpu_usage_during_processing(self, sample_audio_data):
            """Test CPU usage during ML processing."""
            tts_service = TTSService()
            stt_service = STTService()
            
            with patch.object(tts_service, 'generate_audio') as mock_tts, \
                 patch.object(stt_service, 'transcribe_audio') as mock_stt:
                
                mock_tts.return_value = {'audio_data': b'fake_audio', 'sample_rate': 22050, 'duration': 3.0}
                mock_stt.return_value = {'text': 'Test transcription', 'confidence': 0.95}
                
                # Monitor CPU usage
                process = psutil.Process()
                cpu_samples = []
                
                def monitor_cpu():
                    for _ in range(10):  # Sample for 10 seconds
                        cpu_samples.append(process.cpu_percent())
                        time.sleep(1.0)
                
                # Start CPU monitoring in background
                monitor_thread = threading.Thread(target=monitor_cpu)
                monitor_thread.start()
                
                # Perform processing
                for _ in range(5):
                    tts_service.synthesize_speech("Test text", "voice-1", 1.0, 1.0)
                    stt_service.transcribe(sample_audio_data, 'en-US')
                
                monitor_thread.join()
                
                if cpu_samples:
                    avg_cpu = sum(cpu_samples) / len(cpu_samples)
                    max_cpu = max(cpu_samples)
                    
                    # CPU usage assertions
                    assert avg_cpu < 80.0, f"Average CPU usage: {avg_cpu:.1f}% (should be < 80%)"
                    assert max_cpu < 95.0, f"Peak CPU usage: {max_cpu:.1f}% (should be < 95%)"

        def test_memory_cleanup_after_processing(self, sample_audio_data, memory_monitor):
            """Test memory cleanup after processing."""
            tts_service = TTSService()
            initial_memory = memory_monitor['initial']
            
            with patch.object(tts_service, 'generate_audio') as mock_generate:
                mock_generate.return_value = {
                    'audio_data': b'fake_audio_data' * 10000,  # Large audio data
                    'sample_rate': 22050,
                    'duration': 10.0
                }
                
                # Process multiple requests
                for i in range(10):
                    result = tts_service.synthesize_speech(
                        f"Test text number {i}",
                        "voice-1",
                        1.0,
                        1.0
                    )
                    memory_monitor['update']()
                
                peak_memory_during = memory_monitor['peak']()
                
                # Force garbage collection (simulate cleanup)
                import gc
                gc.collect()
                time.sleep(1)  # Allow cleanup to complete
                
                final_memory = memory_monitor['current']()
                memory_cleanup = peak_memory_during - final_memory
                memory_growth = final_memory - initial_memory
                
                # Memory cleanup assertions
                assert memory_cleanup > 0, "Memory should be cleaned up after processing"
                assert memory_growth < 100 * 1024 * 1024, f"Memory growth: {memory_growth / (1024*1024):.1f}MB (should be < 100MB)"

        def test_disk_io_performance(self, sample_audio_data, tmp_path):
            """Test disk I/O performance during file operations."""
            large_audio = sample_audio_data * 100  # Create larger file
            test_file = tmp_path / "test_audio.wav"
            
            # Test write performance
            start_time = time.time()
            test_file.write_bytes(large_audio)
            write_time = time.time() - start_time
            
            # Test read performance
            start_time = time.time()
            read_data = test_file.read_bytes()
            read_time = time.time() - start_time
            
            # Disk I/O assertions
            assert write_time < 5.0, f"File write took {write_time:.2f}s (should be < 5s)"
            assert read_time < 2.0, f"File read took {read_time:.2f}s (should be < 2s)"
            assert len(read_data) == len(large_audio)

    class TestScalabilityAndLimits:
        """Test system scalability and limits."""
        
        def test_maximum_concurrent_requests(self, sample_audio_data, memory_monitor):
            """Test maximum number of concurrent requests."""
            tts_service = TTSService()
            max_concurrent = 10
            
            with patch.object(tts_service, 'generate_audio') as mock_generate:
                mock_generate.return_value = {
                    'audio_data': b'fake_audio' * 1000,
                    'sample_rate': 22050,
                    'duration': 3.0
                }
                
                def process_request(request_id):
                    return tts_service.synthesize_speech(
                        f"Scalability test request {request_id}",
                        "voice-1",
                        1.0,
                        1.0
                    )
                
                start_time = time.time()
                memory_monitor['update']()
                
                with concurrent.futures.ThreadPoolExecutor(max_workers=max_concurrent) as executor:
                    futures = [
                        executor.submit(process_request, i)
                        for i in range(max_concurrent)
                    ]
                    results = [
                        future.result()
                        for future in concurrent.futures.as_completed(futures, timeout=60)
                    ]
                
                end_time = time.time()
                memory_monitor['update']()
                
                total_time = end_time - start_time
                peak_memory = memory_monitor['peak']() - memory_monitor['initial']
                
                # Scalability assertions
                assert len(results) == max_concurrent, "All concurrent requests should complete"
                assert total_time < 60.0, f"Concurrent processing took {total_time:.2f}s (should be < 60s)"
                assert peak_memory < 8192 * 1024 * 1024, f"Peak memory: {peak_memory / (1024*1024):.1f}MB (should be < 8GB)"

        def test_memory_limit_handling(self, memory_monitor):
            """Test handling of memory-intensive operations."""
            tts_service = TTSService()
            
            # Simulate memory-intensive operation
            with patch.object(tts_service, 'generate_audio') as mock_generate:
                # Return very large audio data to simulate memory pressure
                mock_generate.return_value = {
                    'audio_data': b'x' * (100 * 1024 * 1024),  # 100MB of audio data
                    'sample_rate': 22050,
                    'duration': 60.0
                }
                
                try:
                    memory_monitor['update']()
                    result = tts_service.synthesize_speech(
                        "Memory stress test with very long text that should generate large audio output",
                        "voice-1",
                        1.0,
                        1.0
                    )
                    memory_monitor['update']()
                    
                    memory_used = memory_monitor['peak']() - memory_monitor['initial']
                    
                    # Should handle large memory usage gracefully
                    assert result is not None
                    assert memory_used < 10240 * 1024 * 1024, f"Memory usage: {memory_used / (1024*1024):.1f}MB (should be < 10GB)"
                    
                except MemoryError:
                    # If memory error occurs, it should be handled gracefully
                    pytest.skip("System ran out of memory during stress test")

        def test_processing_queue_performance(self, sample_audio_data):
            """Test processing queue performance under load."""
            import queue
            import threading
            
            request_queue = queue.Queue(maxsize=50)
            results_queue = queue.Queue()
            tts_service = TTSService()
            
            with patch.object(tts_service, 'generate_audio') as mock_generate:
                mock_generate.return_value = {
                    'audio_data': b'fake_audio' * 1000,
                    'sample_rate': 22050,
                    'duration': 3.0
                }
                
                def worker():
                    while True:
                        try:
                            request_id = request_queue.get(timeout=1)
                            result = tts_service.synthesize_speech(
                                f"Queue test request {request_id}",
                                "voice-1",
                                1.0,
                                1.0
                            )
                            results_queue.put((request_id, result))
                            request_queue.task_done()
                        except queue.Empty:
                            break
                
                # Start worker threads
                num_workers = 3
                workers = [threading.Thread(target=worker) for _ in range(num_workers)]
                
                start_time = time.time()
                
                # Start workers
                for worker_thread in workers:
                    worker_thread.start()
                
                # Add requests to queue
                num_requests = 20
                for i in range(num_requests):
                    request_queue.put(i)
                
                # Wait for all requests to complete
                request_queue.join()
                
                end_time = time.time()
                
                # Stop workers
                for worker_thread in workers:
                    worker_thread.join(timeout=1)
                
                # Collect results
                results = []
                while not results_queue.empty():
                    results.append(results_queue.get())
                
                processing_time = end_time - start_time
                throughput = len(results) / processing_time if processing_time > 0 else 0
                
                # Queue performance assertions
                assert len(results) == num_requests, "All queued requests should be processed"
                assert processing_time < 30.0, f"Queue processing took {processing_time:.2f}s (should be < 30s)"
                assert throughput > 0.5, f"Throughput: {throughput:.1f} requests/sec (should be > 0.5)"

    class TestModelWarmupAndCaching:
        """Test model warmup and caching performance."""
        
        def test_cold_start_vs_warm_start_performance(self, memory_monitor):
            """Test performance difference between cold and warm starts."""
            tts_service = TTSService()
            text = "Performance test for cold vs warm start comparison."
            
            with patch.object(tts_service, 'generate_audio') as mock_generate:
                mock_generate.return_value = {
                    'audio_data': b'fake_audio' * 1000,
                    'sample_rate': 22050,
                    'duration': 3.0
                }
                
                # Cold start (first request)
                start_time = time.time()
                result1 = tts_service.synthesize_speech(text, "voice-1", 1.0, 1.0)
                cold_start_time = time.time() - start_time
                
                # Warm start (subsequent request)
                start_time = time.time()
                result2 = tts_service.synthesize_speech(text, "voice-1", 1.0, 1.0)
                warm_start_time = time.time() - start_time
                
                # Performance comparison
                assert result1 is not None
                assert result2 is not None
                assert cold_start_time > 0
                assert warm_start_time > 0
                
                # Warm start should be faster (or at least not significantly slower)
                warmup_improvement = (cold_start_time - warm_start_time) / cold_start_time
                assert warmup_improvement >= -0.1, f"Warm start slower than cold start by {abs(warmup_improvement)*100:.1f}%"

        @pytest.mark.slow
        def test_model_caching_effectiveness(self, memory_monitor):
            """Test model caching effectiveness over time."""
            tts_service = TTSService()
            
            with patch.object(tts_service, 'generate_audio') as mock_generate:
                mock_generate.return_value = {
                    'audio_data': b'fake_audio' * 1000,
                    'sample_rate': 22050,
                    'duration': 3.0
                }
                
                # Test multiple requests over time
                response_times = []
                memory_usage = []
                
                for i in range(20):
                    memory_before = memory_monitor['current']()
                    start_time = time.time()
                    
                    result = tts_service.synthesize_speech(
                        f"Caching test request number {i}",
                        "voice-1",
                        1.0,
                        1.0
                    )
                    
                    end_time = time.time()
                    memory_after = memory_monitor['current']()
                    
                    response_times.append(end_time - start_time)
                    memory_usage.append(memory_after - memory_before)
                    
                    # Small delay between requests
                    time.sleep(0.1)
                
                # Analyze performance trends
                avg_early_response = sum(response_times[:5]) / 5
                avg_late_response = sum(response_times[-5:]) / 5
                
                avg_early_memory = sum(memory_usage[:5]) / 5
                avg_late_memory = sum(memory_usage[-5:]) / 5
                
                # Caching effectiveness assertions
                assert avg_late_response <= avg_early_response * 1.1, "Response times should not degrade significantly"
                assert avg_late_memory <= avg_early_memory * 1.2, "Memory usage should not grow significantly"