"""Security middleware for the FastAPI application."""
import time
from collections import defaultdict, deque
from typing import Dict, Tuple
from fastapi import Request, HTTPException, status
from fastapi.middleware.base import BaseHTTPMiddleware
from fastapi.responses import JSONResponse
from loguru import logger
import asyncio


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Rate limiting middleware to prevent abuse."""
    
    def __init__(self, app, calls: int = 100, period: int = 300):
        super().__init__(app)
        self.calls = calls  # Maximum calls
        self.period = period  # Time period in seconds
        self.clients: Dict[str, deque] = defaultdict(deque)
        self.lock = asyncio.Lock()
    
    def _get_client_ip(self, request: Request) -> str:
        """Extract client IP address."""
        # Check for forwarded IP first (reverse proxy)
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()
        
        # Check for real IP
        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip
        
        # Fallback to client host
        return request.client.host if request.client else "unknown"
    
    async def dispatch(self, request: Request, call_next):
        """Process request with rate limiting."""
        # Skip rate limiting for health checks
        if request.url.path in ["/health", "/", "/api/v1/status"]:
            return await call_next(request)
        
        client_ip = self._get_client_ip(request)
        now = time.time()
        
        async with self.lock:
            # Clean old requests
            client_requests = self.clients[client_ip]
            while client_requests and client_requests[0] <= now - self.period:
                client_requests.popleft()
            
            # Check rate limit
            if len(client_requests) >= self.calls:
                logger.warning(f"Rate limit exceeded for IP: {client_ip}")
                return JSONResponse(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    content={
                        "detail": "Rate limit exceeded. Please try again later.",
                        "retry_after": self.period
                    }
                )
            
            # Record current request
            client_requests.append(now)
        
        response = await call_next(request)
        
        # Add rate limit headers
        remaining = max(0, self.calls - len(self.clients[client_ip]))
        response.headers["X-RateLimit-Limit"] = str(self.calls)
        response.headers["X-RateLimit-Remaining"] = str(remaining)
        response.headers["X-RateLimit-Reset"] = str(int(now + self.period))
        
        return response


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Add security headers to all responses."""
    
    async def dispatch(self, request: Request, call_next):
        """Add security headers to response."""
        response = await call_next(request)
        
        # Security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        
        # Content Security Policy
        csp = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: blob:; "
            "font-src 'self'; "
            "connect-src 'self'; "
            "media-src 'self' blob:; "
            "object-src 'none'; "
            "base-uri 'self'; "
            "frame-ancestors 'none';"
        )
        response.headers["Content-Security-Policy"] = csp
        
        # HSTS (HTTP Strict Transport Security) - only in production
        if request.url.scheme == "https":
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        
        return response


class LoggingMiddleware(BaseHTTPMiddleware):
    """Log all requests for security monitoring."""
    
    async def dispatch(self, request: Request, call_next):
        """Log request details."""
        start_time = time.time()
        client_ip = self._get_client_ip(request)
        
        # Log request
        logger.info(
            f"Request: {request.method} {request.url.path} "
            f"from {client_ip} "
            f"User-Agent: {request.headers.get('User-Agent', 'Unknown')}"
        )
        
        try:
            response = await call_next(request)
            process_time = time.time() - start_time
            
            # Log response
            logger.info(
                f"Response: {response.status_code} "
                f"for {request.method} {request.url.path} "
                f"from {client_ip} "
                f"in {process_time:.3f}s"
            )
            
            # Log suspicious activity
            if response.status_code >= 400:
                logger.warning(
                    f"HTTP {response.status_code}: {request.method} {request.url.path} "
                    f"from {client_ip}"
                )
            
            return response
            
        except Exception as e:
            process_time = time.time() - start_time
            logger.error(
                f"Request failed: {request.method} {request.url.path} "
                f"from {client_ip} "
                f"after {process_time:.3f}s - {str(e)}"
            )
            raise
    
    def _get_client_ip(self, request: Request) -> str:
        """Extract client IP address."""
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()
        
        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip
        
        return request.client.host if request.client else "unknown"


class AuthenticationMiddleware(BaseHTTPMiddleware):
    """Enhanced authentication middleware with attack detection."""
    
    def __init__(self, app):
        super().__init__(app)
        self.failed_attempts: Dict[str, Tuple[int, float]] = {}  # IP -> (count, last_attempt)
        self.blocked_ips: Dict[str, float] = {}  # IP -> unblock_time
        self.max_attempts = 5
        self.block_duration = 900  # 15 minutes
        self.attempt_window = 300  # 5 minutes
    
    async def dispatch(self, request: Request, call_next):
        """Process request with authentication attack detection."""
        client_ip = self._get_client_ip(request)
        now = time.time()
        
        # Check if IP is blocked
        if client_ip in self.blocked_ips:
            if now < self.blocked_ips[client_ip]:
                logger.warning(f"Blocked IP attempted access: {client_ip}")
                return JSONResponse(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    content={
                        "detail": "IP temporarily blocked due to suspicious activity",
                        "retry_after": int(self.blocked_ips[client_ip] - now)
                    }
                )
            else:
                # Unblock expired IP
                del self.blocked_ips[client_ip]
                if client_ip in self.failed_attempts:
                    del self.failed_attempts[client_ip]
        
        response = await call_next(request)
        
        # Monitor authentication endpoints
        if "/auth/" in request.url.path:
            if response.status_code == 401:  # Unauthorized
                self._record_failed_attempt(client_ip, now)
            elif response.status_code == 200 and client_ip in self.failed_attempts:
                # Successful auth, reset failed attempts
                del self.failed_attempts[client_ip]
        
        return response
    
    def _record_failed_attempt(self, client_ip: str, timestamp: float):
        """Record failed authentication attempt."""
        if client_ip in self.failed_attempts:
            count, last_attempt = self.failed_attempts[client_ip]
            
            # Reset counter if outside attempt window
            if timestamp - last_attempt > self.attempt_window:
                count = 1
            else:
                count += 1
            
            self.failed_attempts[client_ip] = (count, timestamp)
            
            # Block IP if too many failed attempts
            if count >= self.max_attempts:
                self.blocked_ips[client_ip] = timestamp + self.block_duration
                logger.warning(
                    f"IP blocked due to {count} failed auth attempts: {client_ip}"
                )
                del self.failed_attempts[client_ip]
        else:
            self.failed_attempts[client_ip] = (1, timestamp)
    
    def _get_client_ip(self, request: Request) -> str:
        """Extract client IP address."""
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()
        
        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip
        
        return request.client.host if request.client else "unknown"